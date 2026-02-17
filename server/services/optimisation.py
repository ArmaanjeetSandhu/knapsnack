"""
Diet optimisation services.
"""

from itertools import product
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
import pulp

from server.config import NUTRIENT_MAP
from server.utils.nutrient_utils import standardise_nutrient_bounds


def analyse_feasibility(
    selected_foods: List[Dict[str, Any]],
    max_servings: List[float],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
    nutrient_goals: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Analyse whether the selected foods can meet nutrient requirements.

    Args:
        selected_foods: List of food dictionaries with nutrients
        max_servings: Maximum servings for each food
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients
        nutrient_goals: Target nutrient goals

    Returns:
        Dictionary with feasibility analysis results
    """
    lower_bounds_dict, upper_bounds_dict = standardise_nutrient_bounds(
        lower_bounds, upper_bounds
    )

    lower_bound_issues = analyse_lower_bound_feasibility(
        selected_foods, max_servings, lower_bounds_dict, nutrient_goals
    )

    upper_bound_issues = analyse_upper_bound_feasibility(
        selected_foods, upper_bounds_dict, nutrient_goals
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


def analyse_lower_bound_feasibility(
    selected_foods: List[Dict[str, Any]],
    max_servings: List[float],
    lower_bounds: Dict[str, float],
    nutrient_goals: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Analyse lower bound feasibility for nutrients.

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
        if nutrient in ["protein", "carbohydrate", "fats", "fibre"]:
            continue

        max_possible = 0
        for i, food in enumerate(selected_foods):
            val = food["nutrients"].get(nutrient)
            if val is not None:
                max_possible += val * max_servings[i]

        if max_possible < min_value:
            shortfall = min_value - max_possible
            shortfall_percentage = (shortfall / min_value) * 100

            lower_bound_issues.append(
                {
                    "nutrient": nutrient,
                    "required": min_value,
                    "achievable": max_possible,
                    "shortfall": shortfall,
                    "shortfallPercentage": shortfall_percentage,
                }
            )

    macro_display_names = {
        "protein": "Protein (g)",
        "carbohydrate": "Carbohydrates (g)",
        "fats": "Fats (g)",
        "fibre": "Fibre (g)",
    }

    for nutrient in ["protein", "carbohydrate", "fats", "fibre"]:
        if nutrient in nutrient_goals:
            min_value = nutrient_goals[nutrient]
            max_possible = 0
            for i, food in enumerate(selected_foods):
                val = food["nutrients"].get(nutrient)
                if val is not None:
                    max_possible += val * max_servings[i]

            if max_possible < min_value:
                shortfall = min_value - max_possible
                shortfall_percentage = (shortfall / min_value) * 100

                lower_bound_issues.append(
                    {
                        "nutrient": macro_display_names.get(nutrient, nutrient),
                        "required": min_value,
                        "achievable": max_possible,
                        "shortfall": shortfall,
                        "shortfallPercentage": shortfall_percentage,
                    }
                )

    return lower_bound_issues


def analyse_upper_bound_feasibility(
    selected_foods: List[Dict[str, Any]],
    upper_bounds: Dict[str, float],
    nutrient_goals: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Analyse upper bound feasibility for nutrients.
    Flags any single food item that exceeds a limit on its own at 1 serving.

    Args:
        selected_foods: List of food dictionaries with nutrients
        upper_bounds: Upper bounds for nutrients
        nutrient_goals: Target nutrient goals (for saturated fats)

    Returns:
        List of issues with upper bounds
    """
    upper_bound_issues = []
    checked_nutrients = set()

    def check_limit(nutrient_name, limit_value, display_name_override=None):
        for food in selected_foods:
            val = food["nutrients"].get(nutrient_name)

            if val is not None and val > limit_value:
                excess = val - limit_value
                excess_percentage = (
                    (excess / limit_value) * 100 if limit_value > 0 else 0
                )

                name_to_show = (
                    display_name_override if display_name_override else nutrient_name
                )
                food_name = food.get("description", "Unknown Food Item")

                upper_bound_issues.append(
                    {
                        "nutrient": name_to_show,
                        "foodItem": food_name,
                        "limit": limit_value,
                        "minimum": val,
                        "excess": excess,
                        "excessPercentage": excess_percentage,
                    }
                )

    for nutrient, max_value in upper_bounds.items():
        display_name = None
        if nutrient == "saturated_fats":
            display_name = "Saturated Fats (g)"

        check_limit(nutrient, max_value, display_name_override=display_name)
        checked_nutrients.add(nutrient)

    if "saturated_fats" in nutrient_goals and "saturated_fats" not in checked_nutrients:
        check_limit(
            "saturated_fats",
            nutrient_goals["saturated_fats"],
            display_name_override="Saturated Fats (g)",
        )

    return upper_bound_issues


def optimise_diet(
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
        Optimisation result or None if no feasible solution
    """
    overflow_percentages = list(range(0, 11))
    nutrients = ["protein", "carbohydrate", "fats"]

    all_combinations = list(product(overflow_percentages, repeat=len(nutrients)))
    sorted_combinations = sorted(all_combinations, key=sum)

    for combo in sorted_combinations:
        result = solve_optimisation_problem(
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


def solve_optimisation_problem(
    selected_foods: List[Dict[str, Any]],
    costs: np.ndarray,
    max_servings: List[float],
    nutrient_goals: Dict[str, Any],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
    overflow_percentages: Tuple[int, ...],
) -> Optional[Dict[str, Any]]:
    """
    Solve the diet optimisation problem with the given parameters.

    Args:
        selected_foods: List of food dictionaries
        costs: Array of costs for each food
        max_servings: Maximum allowed servings for each food
        nutrient_goals: Target nutrient goals
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients
        overflow_percentages: Overflow percentages for (protein, carbs, fats)

    Returns:
        Result dictionary if optimisation succeeds, None otherwise
    """
    lower_bounds_dict, upper_bounds_dict = standardise_nutrient_bounds(
        lower_bounds, upper_bounds
    )

    nutrients = ["protein", "carbohydrate", "fats"]
    num_foods = len(selected_foods)

    prob = pulp.LpProblem("Diet_Optimisation", pulp.LpMinimize)

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

        if selected_foods[i].get("must_include", False):
            prob += y[i] == 1

    for i, nutrient in enumerate(nutrients):
        nutrient_key = nutrient.lower().replace(" ", "_")
        if nutrient_key in nutrient_goals:
            goal = nutrient_goals[nutrient_key]
            values = [(food["nutrients"].get(nutrient) or 0) for food in selected_foods]
            overflow_factor = 1 + (overflow_percentages[i] / 100)

            prob += pulp.lpSum([values[j] * x[j] for j in range(num_foods)]) >= goal

            prob += (
                pulp.lpSum([values[j] * x[j] for j in range(num_foods)])
                <= goal * overflow_factor
            )

    if "saturated_fats" in nutrient_goals:
        sat_fat_goal = nutrient_goals["saturated_fats"]
        sat_fat_values = [
            (food["nutrients"].get("saturated_fats") or 0) for food in selected_foods
        ]
        prob += (
            pulp.lpSum([sat_fat_values[j] * x[j] for j in range(num_foods)])
            <= sat_fat_goal
        )

    if "fibre" in nutrient_goals:
        fibre_goal = nutrient_goals["fibre"]
        fibre_values = [
            (food["nutrients"].get("fibre") or 0) for food in selected_foods
        ]
        prob += (
            pulp.lpSum([fibre_values[j] * x[j] for j in range(num_foods)]) >= fibre_goal
        )

    for nutrient, _ in NUTRIENT_MAP.items():
        if nutrient not in nutrients:
            values = [(food["nutrients"].get(nutrient) or 0) for food in selected_foods]

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
        return format_optimisation_result(
            selected_foods, x, costs, nutrients, overflow_percentages
        )

    return None


def format_optimisation_result(
    selected_foods: List[Dict[str, Any]],
    x: List[pulp.LpVariable],
    costs: np.ndarray,
    nutrients: List[str],
    overflow_percentages: Tuple[int, ...],
) -> Dict[str, Any]:
    """
    Format the optimisation result for API response.
    """
    num_foods = len(selected_foods)
    servings = np.array([x[i].value() for i in range(num_foods)])

    food_items = [food["description"] for food in selected_foods]

    total_cost = servings * costs

    nutrient_totals = {}
    for nutrient in NUTRIENT_MAP.keys():
        values = [(food["nutrients"].get(nutrient) or 0) for food in selected_foods]
        nutrient_totals[nutrient] = float(np.sum(servings * values))

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
