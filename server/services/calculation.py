"""
Services for nutritional calculations.
"""

from typing import Any, Dict, List, Optional, Tuple

import pandas as pd

from server.data.nutrient_data import get_nutrient_bounds
from server.utils.nutrient_utils import (
    calculate_bmr,
    calculate_macros,
    calculate_tdee,
)


def validate_input_parameters(
    data: Dict[str, Any],
    age_min: int,
    age_max: int,
    weight_min: int,
    weight_max: int,
    height_min: int,
    height_max: int,
) -> Tuple[bool, List[str]]:
    """
    Validate input parameters for diet calculations.

    Args:
        data: Dictionary with user input
        age_min: Minimum allowed age
        age_max: Maximum allowed age
        weight_min: Minimum allowed weight
        weight_max: Maximum allowed weight
        height_min: Minimum allowed height
        height_max: Maximum allowed height

    Returns:
        Tuple of (is_valid, error_messages)
    """
    validation_errors = []

    age = int(data.get("age", 0))
    if age < age_min or age > age_max:
        validation_errors.append(f"Age must be between {age_min} and {age_max}")

    weight = int(data.get("weight", 0))
    if weight < weight_min or weight > weight_max:
        validation_errors.append(
            f"Weight must be between {weight_min} and {weight_max} kg"
        )

    if "height" in data:
        height = int(data.get("height", 0))
        if height < height_min or height > height_max:
            validation_errors.append(
                f"Height must be between {height_min} and {height_max} cm"
            )

    return len(validation_errors) == 0, validation_errors


def calculate_nutrition_requirements(
    gender: str,
    weight: int,
    height: int,
    age: int,
    pratio: float,
    cratio: float,
    fratio: float,
    activity_multiplier: float,
    percentage: float,
    smoking_status: str = "no",
) -> Dict[str, Any]:
    """
    Calculate nutritional requirements for a user.

    Args:
        gender: 'm' for male, 'f' for female
        weight: Weight in kg
        height: Height in cm
        age: Age in years
        pratio: Protein ratio (0.0-1.0)
        cratio: Carbohydrate ratio (0.0-1.0)
        fratio: Fat ratio (0.0-1.0)
        activity_multiplier: Activity multiplier
        percentage: Target percentage of TDEE
        smoking_status: 'yes' or 'no'

    Returns:
        Dictionary with nutritional requirements
    """
    bmr = calculate_bmr(gender, weight, height, age)
    tdee = calculate_tdee(bmr, activity_multiplier)
    daily_caloric_intake = round(percentage * tdee)

    protein, carbohydrate, fats, fibre, saturated_fats = calculate_macros(
        daily_caloric_intake, pratio, cratio, fratio
    )

    lower_bounds, upper_bounds = get_nutrient_bounds(age, gender)

    if smoking_status == "yes":
        vitamin_c_key = "Vitamin C (mg)"
        if vitamin_c_key in lower_bounds:
            lower_bounds[vitamin_c_key] += 35.0

    lower_bounds_dict = {
        k: float(v) for k, v in lower_bounds.to_dict().items() if pd.notna(v)
    }
    upper_bounds_dict = {
        k: float(v) for k, v in upper_bounds.to_dict().items() if pd.notna(v)
    }

    return {
        "bmr": bmr,
        "tdee": tdee,
        "daily_caloric_intake": daily_caloric_intake,
        "protein": protein,
        "carbohydrate": carbohydrate,
        "fats": fats,
        "fibre": fibre,
        "saturated_fats": saturated_fats,
        "lower_bounds": lower_bounds_dict,
        "upper_bounds": upper_bounds_dict,
    }


def adjust_nutrient_bounds(
    lower_bounds: pd.Series,
    upper_bounds: pd.Series,
    custom_lower_bounds: Optional[Dict[str, float]] = None,
    custom_upper_bounds: Optional[Dict[str, float]] = None,
    smoking_status: str = "no",
) -> Tuple[pd.Series, pd.Series]:
    """
    Adjust nutrient bounds based on custom values and smoking status.

    Args:
        lower_bounds: Default lower bounds
        upper_bounds: Default upper bounds
        custom_lower_bounds: Custom lower bounds (optional)
        custom_upper_bounds: Custom upper bounds (optional)
        smoking_status: 'yes' or 'no'

    Returns:
        Tuple of (adjusted_lower_bounds, adjusted_upper_bounds)
    """
    key_map = {"Fibre (g)": "fibre", "Saturated Fats (g)": "saturated_fats"}

    if custom_lower_bounds:
        for k, v in custom_lower_bounds.items():
            target_key = key_map.get(k, k)
            if target_key in lower_bounds or target_key in key_map.values():
                lower_bounds[target_key] = v

    if custom_upper_bounds:
        for k, v in custom_upper_bounds.items():
            target_key = key_map.get(k, k)
            if target_key in upper_bounds or target_key in key_map.values():
                upper_bounds[target_key] = v

    if smoking_status == "yes":
        vitamin_c_key = "Vitamin C (mg)"
        if vitamin_c_key in lower_bounds:
            if not custom_lower_bounds or vitamin_c_key not in custom_lower_bounds:
                lower_bounds[vitamin_c_key] = float(lower_bounds[vitamin_c_key]) + 35.0

    return lower_bounds, upper_bounds
