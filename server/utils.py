import pandas as pd
from typing import Dict

rowsToBeRemoved = [
    "Infants",
    "Children",
    "Lactation",
    "Pregnancy",
    "Males 9-13 y",
    "Males 14-18 y",
    "Females 9-13 y",
    "Females 14-18 y",
]


def remove_rows(df: pd.DataFrame) -> pd.DataFrame:
    return df[~df["Life-Stage Group"].str.contains("|".join(rowsToBeRemoved), na=False)]


def calculate_bmr(gender: str, weight: float, height: float, age: int) -> int:
    if gender.lower() == "m":
        return int(10 * weight + 6.25 * height - 5 * age + 5)
    else:
        return int(10 * weight + 6.25 * height - 5 * age - 161)


def calculate_tdee(bmr: int, activity_multiplier: float) -> int:
    return int(bmr * activity_multiplier)


def calculate_macros(
    daily_caloric_intake: int, pratio: float, cratio: float, fratio: float
) -> tuple[int, int, int, int, int]:
    protein = int(pratio * daily_caloric_intake / 4)
    carbohydrate = int(cratio * daily_caloric_intake / 4)
    fats = int(fratio * daily_caloric_intake / 9)
    fiber = int(0.014 * daily_caloric_intake)
    saturated_fats = int(0.10 * daily_caloric_intake / 9)
    return protein, carbohydrate, fats, fiber, saturated_fats


def nutrient_bounds(age: int, gender: str) -> tuple[pd.Series, pd.Series]:
    if gender.lower() == "m":
        gender_prefix = "Males"
    else:
        gender_prefix = "Females"

    if age <= 3:
        age_group = "Children 1-3 y"
    elif 4 <= age <= 8:
        age_group = "Children 4-8 y"
    elif 19 <= age <= 30:
        age_group = f"{gender_prefix} 19-30 y"
    elif 31 <= age <= 50:
        age_group = f"{gender_prefix} 31-50 y"
    elif 51 <= age <= 70:
        age_group = f"{gender_prefix} 51-70 y"
    else:
        age_group = f"{gender_prefix} > 70 y"

    vitaminsRDA = pd.read_csv("nutrient-databases/vitamins-RDAs.csv").replace(
        "ND", None
    )
    vitaminsRDA.drop(columns=["Biotin (µg)"], inplace=True)
    vitaminsRDA = remove_rows(vitaminsRDA)

    vitaminsUL = pd.read_csv("nutrient-databases/vitamins-ULs.csv").replace("ND", None)
    vitaminsUL = remove_rows(vitaminsUL)

    elementsRDA = pd.read_csv("nutrient-databases/elements-RDAs.csv").replace(
        "ND", None
    )
    elementsRDA.drop(
        columns=[
            "Chromium (µg)",
            "Molybdenum (µg)",
            "Chloride (g)",
            "Fluoride (mg)",
            "Iodine (µg)",
        ],
        inplace=True,
    )
    elementsRDA = remove_rows(elementsRDA)

    elementsUL = pd.read_csv("nutrient-databases/elements-ULs.csv").replace("ND", None)
    elementsUL.drop(
        columns=[
            "Boron (mg)",
            "Molybdenum (µg)",
            "Chloride (g)",
            "Fluoride (mg)",
            "Iodine (µg)",
            "Nickel (mg)",
            "Vanadium (µg)",
        ],
        inplace=True,
    )
    elementsUL = remove_rows(elementsUL)

    vitamin_lower = vitaminsRDA[vitaminsRDA["Life-Stage Group"] == age_group]
    element_lower = elementsRDA[elementsRDA["Life-Stage Group"] == age_group]

    vitamin_upper = vitaminsUL[vitaminsUL["Life-Stage Group"] == age_group]
    element_upper = elementsUL[elementsUL["Life-Stage Group"] == age_group]

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


def adjust_nutrients_for_serving(
    nutrients: Dict[str, float], serving_size: float
) -> Dict[str, float]:
    """
    Adjust nutrient values based on serving size.
    Base nutrients are per 100g, adjust according to specified serving size.
    """
    adjusted_nutrients = {}
    for nutrient, value in nutrients.items():
        adjusted_nutrients[nutrient] = (value * serving_size) / 100.0
    return adjusted_nutrients
