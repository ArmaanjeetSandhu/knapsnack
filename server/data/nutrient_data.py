"""
Data access functions for nutrient databases.
"""

import os
from typing import Any, Callable, List, Tuple, cast

import pandas as pd

from server.config import (
    ELEMENTS_RDA_EXCLUDE,
    ELEMENTS_UL_EXCLUDE,
    EXCLUDED_AGE_GROUPS,
    MACROS_RDA_EXCLUDE,
    NUTRIENT_DB_PATH,
    VITAMINS_RDA_EXCLUDE,
    VITAMINS_UL_EXCLUDE,
)


def remove_excluded_age_groups(df: pd.DataFrame) -> pd.DataFrame:
    """
    Remove rows for excluded age groups from the dataframe.

    Args:
        df: DataFrame containing nutrient data with a 'Life-Stage Group' column

    Returns:
        DataFrame with excluded age groups removed
    """
    df_any = cast(Any, df)
    raw_mask = df_any["Life-Stage Group"].str.contains(
        "|".join(EXCLUDED_AGE_GROUPS), na=False
    )
    mask = cast("pd.Series[bool]", raw_mask)
    return df[~mask]


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
    pd_any: Any = pd
    df = pd_any.read_csv(os.path.join(NUTRIENT_DB_PATH, filename)).replace("ND", None)
    if columns_to_drop:
        df.drop(columns=columns_to_drop, inplace=True)
    return remove_excluded_age_groups(df)


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
    elif 9 <= age <= 13:
        return f"{gender_prefix} 9-13 y"
    elif 14 <= age <= 18:
        return f"{gender_prefix} 14-18 y"
    elif 19 <= age <= 30:
        return f"{gender_prefix} 19-30 y"
    elif 31 <= age <= 50:
        return f"{gender_prefix} 31-50 y"
    elif 51 <= age <= 70:
        return f"{gender_prefix} 51-70 y"
    else:
        return f"{gender_prefix} > 70 y"


def get_nutrient_bounds(
    age: int, gender: str
) -> Tuple[pd.Series[float], pd.Series[float]]:
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
    macros_rda = load_process_nutrient_data("macros-RDAs.csv", MACROS_RDA_EXCLUDE)

    vitamin_lower = vitamins_rda[vitamins_rda["Life-Stage Group"] == age_group]
    element_lower = elements_rda[elements_rda["Life-Stage Group"] == age_group]
    macro_lower = macros_rda[macros_rda["Life-Stage Group"] == age_group]
    vitamin_upper = vitamins_ul[vitamins_ul["Life-Stage Group"] == age_group]
    element_upper = elements_ul[elements_ul["Life-Stage Group"] == age_group]

    if (
        vitamin_lower.empty
        or element_lower.empty
        or macro_lower.empty
        or vitamin_upper.empty
        or element_upper.empty
    ):
        raise ValueError(f"No nutrient data found for age group: {age_group}")

    lower_series_list: List[pd.Series[Any]] = [
        vitamin_lower.iloc[0],
        element_lower.iloc[0],
        macro_lower.iloc[0],
    ]
    upper_series_list: List[pd.Series[Any]] = [
        vitamin_upper.iloc[0],
        element_upper.iloc[0],
    ]

    lower_bounds = pd.concat(lower_series_list)
    upper_bounds = pd.concat(upper_series_list)

    lower_bounds = lower_bounds.drop("Life-Stage Group")
    upper_bounds = upper_bounds.drop("Life-Stage Group")

    pd_any: Any = pd
    safe_to_numeric = cast("Callable[[Any, str], pd.Series[Any]]", pd_any.to_numeric)

    lower_bounds = safe_to_numeric(lower_bounds, "coerce")
    upper_bounds = safe_to_numeric(upper_bounds, "coerce")

    if "Total Water (L)" in lower_bounds:
        lower_bounds["Water (mL)"] = lower_bounds["Total Water (L)"] * 1000
        lower_bounds = lower_bounds.drop("Total Water (L)")

    for nutrient in ["Folate (µg)", "Niacin (mg)", "Vitamin E (mg)"]:
        if pd.notna(upper_bounds[nutrient]) and pd.notna(lower_bounds[nutrient]):
            upper_bounds[nutrient] += lower_bounds[nutrient]

    if pd.notna(upper_bounds["Magnesium (mg)"]) and pd.notna(
        lower_bounds["Magnesium (mg)"]
    ):
        upper_bounds["Magnesium (mg)"] += lower_bounds["Magnesium (mg)"]

    return lower_bounds, upper_bounds
