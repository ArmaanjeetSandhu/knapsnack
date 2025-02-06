import pandas as pd

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
    """
    Returns nutrient lower bounds (RDAs) and upper bounds (ULs) for the given age and gender.

    Args:
        age: Age in years
        gender: 'm' for male or 'f' for female

    Returns:
        Tuple of (lower_bounds, upper_bounds) as pandas Series
    """
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

    vitaminsRDA = pd.read_csv("nutrient-databases/vitamins-RDAs.csv").replace("ND", None)
    vitaminsRDA.drop(columns=["Biotin (µg)"], inplace=True)
    vitaminsRDA = remove_rows(vitaminsRDA)

    vitaminsUL = pd.read_csv("nutrient-databases/vitamins-ULs.csv").replace("ND", None)
    vitaminsUL = remove_rows(vitaminsUL)

    elementsRDA = pd.read_csv("nutrient-databases/elements-RDAs.csv").replace("ND", None)
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

    return lower_bounds, upper_bounds
