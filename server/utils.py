"""
Utility functions for nutrition calculations and diet optimization.
"""

import os
from typing import List

import pandas as pd

NUTRIENT_DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "nutrient-databases")
)

EXCLUDED_AGE_GROUPS = [
    "Infants",
    "Children",
    "Lactation",
    "Pregnancy",
    "Males 9-13 y",
    "Males 14-18 y",
    "Females 9-13 y",
    "Females 14-18 y",
]

PROTEIN_CALORIES_PER_GRAM = 4
CARB_CALORIES_PER_GRAM = 4
FAT_CALORIES_PER_GRAM = 9
FIBER_RATIO = 0.014  # 14g per 1000 kcal
SATURATED_FAT_RATIO = 0.10  # 10% of calories

VITAMINS_RDA_EXCLUDE = ["Biotin (µg)", "Vitamin D (µg)", "Vitamin B12 (µg)"]
VITAMINS_UL_EXCLUDE = ["Vitamin D (µg)"]
ELEMENTS_RDA_EXCLUDE = [
    "Chromium (µg)",
    "Molybdenum (µg)",
    "Chloride (g)",
    "Fluoride (mg)",
    "Iodine (µg)",
    "Copper (µg)",
]
ELEMENTS_UL_EXCLUDE = [
    "Boron (mg)",
    "Molybdenum (µg)",
    "Chloride (g)",
    "Fluoride (mg)",
    "Iodine (µg)",
    "Nickel (mg)",
    "Vanadium (µg)",
    "Copper (µg)",
]


def remove_excluded_age_groups(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows for excluded age groups from the dataframe.

    Args:
        df: DataFrame containing nutrient data with a 'Life-Stage Group' column

    Returns:
        DataFrame with excluded age groups removed
    """
    return df[
        ~df["Life-Stage Group"].str.contains("|".join(EXCLUDED_AGE_GROUPS), na=False)
    ]


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
) -> tuple[int, int, int, int, int]:
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


def get_age_group(age: int, gender: str) -> str:
    """
    Determine the appropriate age-gender group for nutrient recommendations.

    Args:
        age: Age in years
        gender: 'm' for male, 'f' for female

    Returns:
        Age group string used in nutrient databases
    """
    gender_prefix = "Males" if gender.lower() == "m" else "Females"

    if age <= 3:
        return "Children 1-3 y"
    elif 4 <= age <= 8:
        return "Children 4-8 y"
    elif 19 <= age <= 30:
        return f"{gender_prefix} 19-30 y"
    elif 31 <= age <= 50:
        return f"{gender_prefix} 31-50 y"
    elif 51 <= age <= 70:
        return f"{gender_prefix} 51-70 y"
    else:
        return f"{gender_prefix} > 70 y"


def load_process_nutrient_data(
    filename: str, columns_to_drop: List[str]
) -> pd.DataFrame:
    """
    Load and process a nutrient dataframe with standard processing.

    Args:
        filename: CSV filename in the nutrient database directory
        columns_to_drop: List of column names to drop

    Returns:
        Processed DataFrame
    """
    df = pd.read_csv(os.path.join(NUTRIENT_DB_PATH, filename)).replace("ND", None)
    if columns_to_drop:
        df.drop(columns=columns_to_drop, inplace=True)
    return remove_excluded_age_groups(df)


def nutrient_bounds(age: int, gender: str) -> tuple[pd.Series, pd.Series]:
    """
    Calculate lower and upper bounds for nutrients based on age and gender.

    Args:
        age: Age in years
        gender: 'm' for male, 'f' for female

    Returns:
        Tuple of (lower_bounds, upper_bounds) as pandas Series
    """
    age_group = get_age_group(age, gender)

    vitamins_rda = load_process_nutrient_data("vitamins-RDAs.csv", VITAMINS_RDA_EXCLUDE)
    vitamins_ul = load_process_nutrient_data("vitamins-ULs.csv", VITAMINS_UL_EXCLUDE)
    elements_rda = load_process_nutrient_data("elements-RDAs.csv", ELEMENTS_RDA_EXCLUDE)
    elements_ul = load_process_nutrient_data("elements-ULs.csv", ELEMENTS_UL_EXCLUDE)

    vitamin_lower = vitamins_rda[vitamins_rda["Life-Stage Group"] == age_group]
    element_lower = elements_rda[elements_rda["Life-Stage Group"] == age_group]
    vitamin_upper = vitamins_ul[vitamins_ul["Life-Stage Group"] == age_group]
    element_upper = elements_ul[elements_ul["Life-Stage Group"] == age_group]

    if (
        vitamin_lower.empty
        or element_lower.empty
        or vitamin_upper.empty
        or element_upper.empty
    ):
        raise ValueError(f"No nutrient data found for age group: {age_group}")

    lower_bounds = pd.concat([vitamin_lower.iloc[0], element_lower.iloc[0]])
    upper_bounds = pd.concat([vitamin_upper.iloc[0], element_upper.iloc[0]])

    lower_bounds = lower_bounds.drop("Life-Stage Group")
    upper_bounds = upper_bounds.drop("Life-Stage Group")
    lower_bounds = pd.to_numeric(lower_bounds, errors="coerce")
    upper_bounds = pd.to_numeric(upper_bounds, errors="coerce")

    for nutrient in ["Folate (µg)", "Niacin (mg)", "Vitamin E (mg)"]:
        if pd.notna(upper_bounds[nutrient]) and pd.notna(lower_bounds[nutrient]):
            upper_bounds[nutrient] += lower_bounds[nutrient]

    if pd.notna(upper_bounds["Magnesium (mg)"]) and pd.notna(
        lower_bounds["Magnesium (mg)"]
    ):
        upper_bounds["Magnesium (mg)"] += lower_bounds["Magnesium (mg)"]

    return lower_bounds, upper_bounds
