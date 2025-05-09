"""
Utility functions for nutrient calculations.
"""

from typing import Any, Dict, List, Tuple, Union

import pandas as pd

from server.config import (
    CARB_CALORIES_PER_GRAM,
    FAT_CALORIES_PER_GRAM,
    FIBER_RATIO,
    NUTRIENT_MAP,
    PROTEIN_CALORIES_PER_GRAM,
    SATURATED_FAT_RATIO,
)


def calculate_bmr_mifflin_st_jeor(
    gender: str, weight: int, height: int, age: int
) -> int:
    """
    Calculate Basal Metabolic Rate using the Mifflin-St Jeor equation.

    Args:
        gender: 'm' for male, 'f' for female
        weight: Weight in kg
        height: Height in cm
        age: Age in years

    Returns:
        BMR in calories per day (rounded to integer)
    """
    if gender.lower() == "m":
        return int(10 * weight + 6.25 * height - 5 * age + 5)
    else:
        return int(10 * weight + 6.25 * height - 5 * age - 161)


def calculate_bmr_katch_mcardle(lean_body_mass: int) -> int:
    """
    Calculate Basal Metabolic Rate using the Katch-McArdle equation.

    Args:
        lean_body_mass: Lean body mass in kg

    Returns:
        BMR in calories per day (rounded to integer)
    """
    return int(370 + 21.6 * lean_body_mass)


def calculate_tdee(bmr: int, activity_multiplier: float) -> int:
    """
    Calculate Total Daily Energy Expenditure based on BMR and activity level.

    Args:
        bmr: Basal Metabolic Rate in calories
        activity_multiplier: Activity multiplier (e.g., 1.2 for sedentary)

    Returns:
        TDEE in calories per day (rounded to integer)
    """
    return int(bmr * activity_multiplier)


def calculate_macros(
    daily_caloric_intake: int, pratio: float, cratio: float, fratio: float
) -> Tuple[int, int, int, int, int]:
    """
    Calculate macronutrient targets based on caloric intake and desired ratios.

    Args:
        daily_caloric_intake: Total daily calories
        pratio: Protein ratio (0.0-1.0)
        cratio: Carbohydrate ratio (0.0-1.0)
        fratio: Fat ratio (0.0-1.0)

    Returns:
        Tuple of (protein, carbohydrate, fats, fiber, saturated_fats) in grams
    """
    protein = int(pratio * daily_caloric_intake / PROTEIN_CALORIES_PER_GRAM)
    carbohydrate = int(cratio * daily_caloric_intake / CARB_CALORIES_PER_GRAM)
    fats = int(fratio * daily_caloric_intake / FAT_CALORIES_PER_GRAM)
    fiber = int(FIBER_RATIO * daily_caloric_intake)
    saturated_fats = int(
        SATURATED_FAT_RATIO * daily_caloric_intake / FAT_CALORIES_PER_GRAM
    )
    return protein, carbohydrate, fats, fiber, saturated_fats


def extract_nutrients(nutrients_data: List[Dict[str, Any]]) -> Dict[str, float]:
    """
    Extract relevant nutrients from the API response and convert to our format.
    Returns nutrients per 100g.

    Args:
        nutrients_data: List of nutrient dictionaries from USDA API

    Returns:
        Dictionary with our nutrient names as keys and values per 100g
    """
    result = {}
    reverse_map = {v: k for k, v in NUTRIENT_MAP.items()}
    for nutrient in nutrients_data:
        api_name = nutrient.get("nutrientName")
        if api_name in reverse_map:
            our_name = reverse_map[api_name]
            value = nutrient.get("value", 0)
            if value is not None:
                result[our_name] = float(value)
    for our_name in NUTRIENT_MAP.keys():
        if our_name not in result:
            result[our_name] = 0.0
    return result


def standardize_nutrient_bounds(
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
) -> Tuple[Dict[str, float], Dict[str, float]]:
    """
    Standardize nutrient bounds to dictionaries with float values.

    Args:
        lower_bounds: Lower bounds for nutrients as Series or Dict
        upper_bounds: Upper bounds for nutrients as Series or Dict

    Returns:
        Tuple of (lower_bounds_dict, upper_bounds_dict)
    """
    if isinstance(lower_bounds, pd.Series):
        lower_bounds = lower_bounds.to_dict()
    if isinstance(upper_bounds, pd.Series):
        upper_bounds = upper_bounds.to_dict()

    lower_bounds = {k: float(v) for k, v in lower_bounds.items() if pd.notna(v)}
    upper_bounds = {k: float(v) for k, v in upper_bounds.items() if pd.notna(v)}

    return lower_bounds, upper_bounds
