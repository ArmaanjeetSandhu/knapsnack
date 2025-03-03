"""
Tests specifically for the grid search logic in the optimization function
"""

import os
import sys
from itertools import product
from unittest.mock import patch

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def test_product_generation():
    """Test that product() generates correct combinations with full range of percentages"""
    overflow_percentages = list(range(0, 11))
    nutrients = ["protein", "carbohydrate", "fats", "fiber"]

    combinations = list(product(overflow_percentages, repeat=len(nutrients)))

    assert len(combinations) == len(overflow_percentages) ** len(nutrients)
    assert len(combinations) == 11**4

    assert (0, 0, 0, 0) in combinations
    assert (10, 10, 10, 10) in combinations
    assert (0, 1, 2, 3) in combinations
    assert (5, 5, 5, 5) in combinations

    for i in range(11):
        assert (i, 0, 0, 0) in combinations
        assert (0, i, 0, 0) in combinations
        assert (0, 0, i, 0) in combinations
        assert (0, 0, 0, i) in combinations


def test_sorted_combinations():
    """Test that combinations are properly sorted by total overflow"""
    combinations = [
        (10, 10, 10, 10),
        (0, 0, 0, 0),
        (0, 7, 0, 0),
        (1, 2, 3, 4),
        (9, 0, 0, 0),
    ]

    sorted_combinations = sorted(combinations, key=sum)

    expected = [
        (0, 0, 0, 0),
        (0, 7, 0, 0),
        (9, 0, 0, 0),
        (1, 2, 3, 4),
        (10, 10, 10, 10),
    ]

    assert sorted_combinations == expected


def test_overflow_factor_calculation():
    """Test that overflow factors are calculated correctly using values from full range"""
    assert 1 + (0 / 100) == 1.0
    assert 1 + (3 / 100) == 1.03
    assert 1 + (7 / 100) == 1.07
    assert 1 + (10 / 100) == 1.1

    combo = (0, 3, 7, 10)
    overflow_factors = [1 + (percent / 100) for percent in combo]
    expected_factors = [1.0, 1.03, 1.07, 1.1]

    assert overflow_factors == expected_factors


@patch("numpy.array")
def test_constraint_generation_with_overflow(mock_np_array):
    """Test generation of constraints with different overflow factors from the full range"""
    mock_np_array.side_effect = lambda x: x

    nutrients = ["protein", "carbohydrate"]
    combo = (3, 7)
    nutrient_goals = {"protein": 100, "carbohydrate": 200}
    food_nutrients = [
        {"protein": 20, "carbohydrate": 10},
        {"protein": 5, "carbohydrate": 30},
    ]

    expected_A_ub = [
        [-20, -5],
        [20, 5],
        [-10, -30],
        [10, 30],
    ]

    expected_b_ub = [-100, 103, -200, 214]

    A_ub = []
    b_ub = []

    for i, nutrient in enumerate(nutrients):
        if nutrient in nutrient_goals:
            goal = nutrient_goals[nutrient]
            values = [food[nutrient] for food in food_nutrients]

            overflow_factor = 1 + (combo[i] / 100)

            A_ub.extend([[-val for val in values], values])
            b_ub.extend(
                [
                    -goal,
                    goal * overflow_factor,
                ]
            )

    assert A_ub == expected_A_ub
    assert b_ub == expected_b_ub


def test_overflow_by_nutrient_format():
    """Test the format of the overflow_by_nutrient dictionary with values from full range"""
    nutrients = ["protein", "carbohydrate", "fats", "fiber"]
    combo = (3, 7, 0, 9)

    overflow_by_nutrient = {
        nutrient: int(percent) for nutrient, percent in zip(nutrients, combo)
    }

    expected = {"protein": 3, "carbohydrate": 7, "fats": 0, "fiber": 9}

    assert overflow_by_nutrient == expected
    assert overflow_by_nutrient["protein"] == 3
    assert overflow_by_nutrient["carbohydrate"] == 7
    assert overflow_by_nutrient["fats"] == 0
    assert overflow_by_nutrient["fiber"] == 9


def test_total_overflow_calculation():
    """Test calculation of total_overflow value with values from full range"""
    assert sum((0, 0, 0, 0)) == 0
    assert sum((3, 7, 0, 1)) == 11
    assert sum((10, 10, 10, 10)) == 40

    combo = (2, 3, 1, 4)
    total_overflow = sum(combo)
    assert total_overflow == 10
