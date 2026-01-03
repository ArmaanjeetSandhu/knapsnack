"""
Diet optimization services.
"""

from itertools import product
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
import pulp

from server.config import NUTRIENT_MAP
from server.utils.nutrient_utils import standardize_nutrient_bounds


def analyze_feasibility(
    selected_foods: List[Dict[str, Any]],
    max_servings: List[float],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
    nutrient_goals: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Analyze whether the selected foods can meet nutrient requirements.

    Args:
        selected_foods: List of food dictionaries with nutrients
        max_servings: Maximum servings for each food
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients
        nutrient_goals: Target nutrient goals

    Returns:
        Dictionary with feasibility analysis results
    """
    lower_bounds_dict, upper_bounds_dict = standardize_nutrient_bounds(
        lower_bounds, upper_bounds
    )

    lower_bound_issues = analyze_lower_bound_feasibility(
        selected_foods, max_servings, lower_bounds_dict, nutrient_goals
    )

    upper_bound_issues = analyze_upper_bound_feasibility(
        selected_foods, upper_bounds_dict
    )

    is_lower_bounds_feasible = len(lower_bound_issues) == 0
    is_upper_bounds_feasible = len(upper_bound_issues) == 0
    is_feasible = is_lower_bounds_feasible and is_upper_bounds_feasible

    lower_bound_issues.sort(key=lambda x: x.get("shortfallPercentage", 0), reverse=True)
    upper_bound_issues.sort(key=lambda x: x.get("excessPercentage", 0), reverse=True)

    return {
        "analysis": "Feasibility analysis completed",
        "isLowerBoundsFeasible": is_lower_bounds_feasible,
        "isUpperBoundsFeasible": is_upper_bounds_feasible,
        "isFeasible": is_feasible,
        "lowerBoundIssues": lower_bound_issues,
        "upperBoundIssues": upper_bound_issues,
    }


def analyze_lower_bound_feasibility(
    selected_foods: List[Dict[str, Any]],
    max_servings: List[float],
    lower_bounds: Dict[str, float],
    nutrient_goals: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Analyze lower bound feasibility for nutrients.

    Args:
        selected_foods: List of food dictionaries with nutrients
        max_servings: Maximum servings for each food
        lower_bounds: Lower bounds for nutrients
        nutrient_goals: Target nutrient goals

    Returns:
        List of issues with lower bounds
    """
    lower_bound_issues = []

    for nutrient, min_value in lower_bounds.items():
        try:
            min_value = float(min_value)
            if np.isnan(min_value):
                continue
        except (ValueError, TypeError):
            continue

        max_possible = 0
        for i, food in enumerate(selected_foods):
            if nutrient in food["nutrients"]:
                max_possible += food["nutrients"][nutrient] * max_servings[i]

        if max_possible < min_value:
            shortfall = min_value - max_possible
            shortfall_percentage = (shortfall / min_value) * 100 if min_value > 0 else 0
            lower_bound_issues.append(
                {
                    "nutrient": nutrient,
                    "required": min_value,
                    "achievable": max_possible,
                    "shortfall": shortfall,
                    "shortfallPercentage": shortfall_percentage,
                }
            )

    for nutrient in ["protein", "carbohydrate", "fats", "fiber"]:
        if nutrient in nutrient_goals:
            min_value = nutrient_goals[nutrient]
            max_possible = 0
            for i, food in enumerate(selected_foods):
                if nutrient in food["nutrients"]:
                    max_possible += food["nutrients"][nutrient] * max_servings[i]

            if max_possible < min_value:
                shortfall = min_value - max_possible
                shortfall_percentage = (
                    (shortfall / min_value) * 100 if min_value > 0 else 0
                )
                lower_bound_issues.append(
                    {
                        "nutrient": nutrient,
                        "required": min_value,
                        "achievable": max_possible,
                        "shortfall": shortfall,
                        "shortfallPercentage": shortfall_percentage,
                    }
                )

    return lower_bound_issues


def analyze_upper_bound_feasibility(
    selected_foods: List[Dict[str, Any]],
    upper_bounds: Dict[str, float],
) -> List[Dict[str, Any]]:
    """
    Analyze upper bound feasibility for nutrients.

    Args:
        selected_foods: List of food dictionaries with nutrients
        upper_bounds: Upper bounds for nutrients

    Returns:
        List of issues with upper bounds
    """
    upper_bound_issues = []

    for nutrient, max_value in upper_bounds.items():
        try:
            max_value = float(max_value)
            if np.isnan(max_value):
                continue
        except (ValueError, TypeError):
            continue

        min_possible = 0
        has_nutrient = False
        for food in selected_foods:
            if nutrient in food["nutrients"] and food["nutrients"][nutrient] > 0:
                has_nutrient = True
                min_possible += food["nutrients"][nutrient]

        if has_nutrient and min_possible > max_value:
            excess = min_possible - max_value
            excess_percentage = (excess / max_value) * 100 if max_value > 0 else 0
            upper_bound_issues.append(
                {
                    "nutrient": nutrient,
                    "limit": max_value,
                    "minimum": min_possible,
                    "excess": excess,
                    "excessPercentage": excess_percentage,
                }
            )

    return upper_bound_issues


def optimize_diet(
    selected_foods: List[Dict[str, Any]],
    costs: np.ndarray,
    max_servings: List[float],
    nutrient_goals: Dict[str, Any],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
) -> Optional[Dict[str, Any]]:
    """
    Find optimal diet by trying different overflow percentages.

    Args:
        selected_foods: List of food dictionaries
        costs: Array of costs for each food
        max_servings: Maximum allowed servings for each food
        nutrient_goals: Target nutrient goals
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients

    Returns:
        Optimization result or None if no feasible solution
    """
    overflow_percentages = list(range(0, 11))
    nutrients = ["protein", "carbohydrate", "fats", "fiber"]

    all_combinations = list(product(overflow_percentages, repeat=len(nutrients)))
    sorted_combinations = sorted(all_combinations, key=sum)

    for combo in sorted_combinations:
        result = solve_optimization_problem(
            selected_foods,
            costs,
            max_servings,
            nutrient_goals,
            lower_bounds,
            upper_bounds,
            combo,
        )

        if result:
            return result

    return None


def solve_optimization_problem(
    selected_foods: List[Dict[str, Any]],
    costs: np.ndarray,
    max_servings: List[float],
    nutrient_goals: Dict[str, Any],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
    overflow_percentages: Tuple[int, ...],
) -> Optional[Dict[str, Any]]:
    """
    Solve the diet optimization problem with the given parameters.

    Args:
        selected_foods: List of food dictionaries
        costs: Array of costs for each food
        max_servings: Maximum allowed servings for each food
        nutrient_goals: Target nutrient goals
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients
        overflow_percentages: Overflow percentages for (protein, carbs, fats, fiber)

    Returns:
        Result dictionary if optimization succeeds, None otherwise
    """
    lower_bounds_dict, upper_bounds_dict = standardize_nutrient_bounds(
        lower_bounds, upper_bounds
    )

    nutrients = ["protein", "carbohydrate", "fats", "fiber"]
    num_foods = len(selected_foods)

    prob = pulp.LpProblem("Diet_Optimization", pulp.LpMinimize)

    x = []
    for i in range(num_foods):
        if selected_foods[i].get("requires_integer_servings", False):
            var = pulp.LpVariable(f"x_{i}", 0, max_servings[i], cat=pulp.LpInteger)
        else:
            var = pulp.LpVariable(f"x_{i}", 0, max_servings[i], cat=pulp.LpContinuous)
        x.append(var)

    y = [pulp.LpVariable(f"y_{i}", cat=pulp.LpBinary) for i in range(num_foods)]

    prob += pulp.lpSum([costs[i] * x[i] for i in range(num_foods)])

    for i in range(num_foods):
        prob += x[i] <= max_servings[i] * y[i]
        prob += x[i] >= y[i]

    for i, nutrient in enumerate(nutrients):
        nutrient_key = nutrient.lower().replace(" ", "_")
        if nutrient_key in nutrient_goals:
            goal = nutrient_goals[nutrient_key]
            values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
            overflow_factor = 1 + (overflow_percentages[i] / 100)

            prob += pulp.lpSum([values[j] * x[j] for j in range(num_foods)]) >= goal

            prob += pulp.lpSum([values[j] * x[j] for j in range(num_foods)]) <= int(
                goal * overflow_factor
            )

    if "saturated_fats" in nutrient_goals:
        sat_fat_goal = nutrient_goals["saturated_fats"]
        sat_fat_values = [
            food["nutrients"].get("saturated_fats", 0) for food in selected_foods
        ]
        prob += (
            pulp.lpSum([sat_fat_values[j] * x[j] for j in range(num_foods)])
            <= sat_fat_goal
        )

    for nutrient, _ in NUTRIENT_MAP.items():
        if nutrient not in nutrients:
            values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]

            if nutrient in lower_bounds_dict:
                prob += pulp.lpSum(
                    [values[j] * x[j] for j in range(num_foods)]
                ) >= float(lower_bounds_dict[nutrient])

            if nutrient in upper_bounds_dict:
                prob += pulp.lpSum(
                    [values[j] * x[j] for j in range(num_foods)]
                ) <= float(upper_bounds_dict[nutrient])

    prob.solve(pulp.PULP_CBC_CMD(msg=False))

    if prob.status == pulp.LpStatusOptimal:
        return format_optimization_result(
            selected_foods, x, costs, nutrients, overflow_percentages
        )

    return None


def format_optimization_result(
    selected_foods: List[Dict[str, Any]],
    x: List[pulp.LpVariable],
    costs: np.ndarray,
    nutrients: List[str],
    overflow_percentages: Tuple[int, ...],
) -> Dict[str, Any]:
    """
    Format the optimization result for API response.

    Args:
        selected_foods: List of food dictionaries
        x: List of decision variables with solution values
        costs: Array of costs for each food
        nutrients: List of nutrient names
        overflow_percentages: Overflow percentages used

    Returns:
        Formatted result dictionary
    """
    num_foods = len(selected_foods)
    servings = np.array([x[i].value() for i in range(num_foods)])
    servings = np.round(servings, 1)

    food_items = [food["description"] for food in selected_foods]
    total_cost = np.round(servings * costs, 1)

    nutrient_totals = {}
    for nutrient in NUTRIENT_MAP.keys():
        values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
        nutrient_totals[nutrient] = float(np.round(np.sum(servings * values), 1))

    overflow_by_nutrient = {
        nutrient: percent for nutrient, percent in zip(nutrients, overflow_percentages)
    }

    return {
        "food_items": food_items,
        "servings": servings.tolist(),
        "total_cost": total_cost.tolist(),
        "nutrient_totals": nutrient_totals,
        "total_cost_sum": float(np.sum(total_cost)),
        "overflow_by_nutrient": overflow_by_nutrient,
        "total_overflow": sum(overflow_percentages),
    }
