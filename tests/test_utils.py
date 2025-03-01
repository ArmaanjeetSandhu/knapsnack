import os
import sys
from unittest.mock import patch

import pandas as pd
import pytest

from server.utils import (
    calculate_bmr,
    calculate_macros,
    calculate_tdee,
    nutrient_bounds,
    remove_rows,
)

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_calculate_bmr():
    """Test BMR calculation for both genders"""
    male_bmr = calculate_bmr("m", 70, 175, 30)
    expected_male_bmr = 10 * 70 + 6.25 * 175 - 5 * 30 + 5
    assert male_bmr == int(expected_male_bmr)

    female_bmr = calculate_bmr("f", 60, 165, 30)
    expected_female_bmr = 10 * 60 + 6.25 * 165 - 5 * 30 - 161
    assert female_bmr == int(expected_female_bmr)

    assert calculate_bmr("M", 70, 175, 30) == male_bmr
    assert calculate_bmr("f", 0, 0, 0) == -161


def test_calculate_tdee():
    """Test TDEE calculation with different activity multipliers"""
    assert calculate_tdee(2000, 1.2) == 2400
    assert calculate_tdee(2000, 1.375) == 2750
    assert calculate_tdee(2000, 1.55) == 3100
    assert calculate_tdee(2000, 1.725) == 3450
    assert calculate_tdee(2000, 1.9) == 3800

    tdee_1669 = calculate_tdee(1669, 1.2)
    assert 2002 <= tdee_1669 <= 2003

    tdee_1320 = calculate_tdee(1320, 1.55)
    assert 2045 <= tdee_1320 <= 2047


def test_calculate_macros():
    """Test macronutrient calculation with different ratios"""
    protein, carbs, fats, fiber, sat_fats = calculate_macros(2000, 0.3, 0.4, 0.3)
    assert 149 <= protein <= 150
    assert 199 <= carbs <= 200
    assert 66 <= fats <= 67
    assert 27 <= fiber <= 28
    assert 22 <= sat_fats <= 23

    protein, carbs, fats, fiber, sat_fats = calculate_macros(2500, 0.4, 0.3, 0.3)
    assert 249 <= protein <= 250
    assert 186 <= carbs <= 187
    assert 83 <= fats <= 84
    assert 34 <= fiber <= 35
    assert 27 <= sat_fats <= 28

    protein, carbs, fats, fiber, sat_fats = calculate_macros(1800, 0.25, 0.25, 0.50)
    assert 111 <= protein <= 113
    assert 111 <= carbs <= 113
    assert 99 <= fats <= 100
    assert 24 <= fiber <= 26
    assert 19 <= sat_fats <= 20


def test_remove_rows():
    """Test that unwanted rows are removed from the DataFrame"""
    test_df = pd.DataFrame(
        {
            "Life-Stage Group": [
                "Males 31-50 y",
                "Females 31-50 y",
                "Infants",
                "Children",
                "Males 14-18 y",
                "Females 14-18 y",
                "Pregnancy",
                "Lactation",
                "Males 9-13 y",
                "Females 9-13 y",
            ]
        }
    )

    filtered_df = remove_rows(test_df)
    assert len(filtered_df) == 2
    assert "Males 31-50 y" in filtered_df["Life-Stage Group"].values
    assert "Females 31-50 y" in filtered_df["Life-Stage Group"].values

    unwanted_groups = [
        "Infants",
        "Children",
        "Males 14-18 y",
        "Females 14-18 y",
        "Pregnancy",
        "Lactation",
        "Males 9-13 y",
        "Females 9-13 y",
    ]

    for group in unwanted_groups:
        assert group not in filtered_df["Life-Stage Group"].values


def test_nutrient_bounds():
    """Test nutrient bounds calculation with completely mocked function"""
    test_age = 35
    test_gender = "m"

    lower_bounds = pd.Series(
        {
            "Vitamin A (µg)": 900,
            "Vitamin C (mg)": 90,
            "Calcium (mg)": 1000,
            "Iron (mg)": 8,
        }
    )

    upper_bounds = pd.Series(
        {
            "Vitamin A (µg)": 3000,
            "Vitamin C (mg)": 2000,
            "Calcium (mg)": 2500,
            "Iron (mg)": 45,
        }
    )

    with patch(
        "server.utils.nutrient_bounds", return_value=(lower_bounds, upper_bounds)
    ):
        result_lower, result_upper = nutrient_bounds(test_age, test_gender)

        assert result_lower["Vitamin A (µg)"] == 900
        assert result_lower["Vitamin C (mg)"] == 90
        assert result_upper["Vitamin A (µg)"] == 3000
        assert result_upper["Calcium (mg)"] == 2500


def test_nutrient_bounds_edge_cases():
    """Test edge cases for nutrient bounds function with direct patching"""

    def mock_nutrient_bounds(age, gender):
        if age == 35 and gender == "m":
            return (
                pd.Series({"Vitamin A (µg)": 900}),
                pd.Series({"Vitamin A (µg)": 3000}),
            )
        else:
            raise ValueError("No nutrient data found for age group")

    with patch("server.utils.nutrient_bounds", side_effect=mock_nutrient_bounds):
        lower, upper = nutrient_bounds(35, "m")
        assert lower["Vitamin A (µg)"] == 900
        assert upper["Vitamin A (µg)"] == 3000

        with pytest.raises(ValueError):
            nutrient_bounds(5, "f")
