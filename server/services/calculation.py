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
    standardise_nutrient_bounds,
)


def validate_age(age: int, age_min: int, age_max: int) -> Optional[str]:
    """Validate age is within bounds."""
    if age < age_min or age > age_max:
        return f"Age must be between {age_min} and {age_max}"
    return None


def validate_weight(weight: int, weight_min: int, weight_max: int) -> Optional[str]:
    """Validate weight is within bounds."""
    if weight < weight_min or weight > weight_max:
        return f"Weight must be between {weight_min} and {weight_max} kg"
    return None


def validate_height(height: int, height_min: int, height_max: int) -> Optional[str]:
    """Validate height is within bounds."""
    if height < height_min or height > height_max:
        return f"Height must be between {height_min} and {height_max} cm"
    return None


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
    """
    validation_errors: List[str] = []

    age = int(data.get("age", 0))
    if error := validate_age(age, age_min, age_max):
        validation_errors.append(error)

    weight = int(data.get("weight", 0))
    if error := validate_weight(weight, weight_min, weight_max):
        validation_errors.append(error)

    if "height" in data:
        height = int(data["height"])
        if error := validate_height(height, height_min, height_max):
            validation_errors.append(error)

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
    """
    bmr = calculate_bmr(gender, weight, height, age)
    tdee = calculate_tdee(bmr, activity_multiplier)
    daily_caloric_intake = round(percentage * tdee)

    protein, carbohydrate, fats, fibre, saturated_fats = calculate_macros(
        daily_caloric_intake, pratio, cratio, fratio
    )

    lower_bounds, upper_bounds = get_nutrient_bounds(age, gender)

    lower_bounds, upper_bounds = adjust_nutrient_bounds(
        lower_bounds, upper_bounds, smoking_status=smoking_status
    )

    lower_bounds_dict, upper_bounds_dict = standardise_nutrient_bounds(
        lower_bounds, upper_bounds
    )

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
    lower_bounds: pd.Series[float],
    upper_bounds: pd.Series[float],
    custom_lower_bounds: Optional[Dict[str, float]] = None,
    custom_upper_bounds: Optional[Dict[str, float]] = None,
    smoking_status: str = "no",
) -> Tuple[pd.Series[float], pd.Series[float]]:
    """
    Adjust nutrient bounds based on custom values and smoking status.
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
