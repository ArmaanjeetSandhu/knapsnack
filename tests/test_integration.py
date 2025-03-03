import json
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd


def test_end_to_end_calculation_optimization(app_client, sample_food_data):
    """Test the full calculation and optimization flow with grid search"""

    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds, patch(
        "server.app.linprog"
    ) as mock_linprog, patch("server.app.calculate_bmr") as mock_calculate_bmr:

        mock_calculate_bmr.return_value = 1648

        lower_bounds = pd.Series(
            {
                "Vitamin A (µg)": 900,
                "Vitamin C (mg)": 90,
                "Calcium (mg)": 1000,
                "Iron (mg)": 8,
                "Folate (µg)": 400,
                "Zinc (mg)": 11,
            }
        )
        upper_bounds = pd.Series(
            {
                "Vitamin A (µg)": 3000,
                "Vitamin C (mg)": 2000,
                "Calcium (mg)": 2500,
                "Iron (mg)": 45,
                "Folate (µg)": 1000,
                "Zinc (mg)": 40,
            }
        )
        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        mock_result = MagicMock()
        mock_result.success = True
        mock_result.x = np.array([2.0, 1.5, 1.0, 3.0])
        mock_linprog.return_value = mock_result

        calc_response = app_client.post(
            "/api/calculate",
            json={
                "gender": "m",
                "weight": "70",
                "height": "175",
                "age": "30",
                "activity": "1.55",
                "percentage": "100",
                "protein": "30",
                "carbohydrate": "40",
                "fats": "30",
                "smokingStatus": "no",
            },
        )

        assert calc_response.status_code == 200
        calc_data = json.loads(calc_response.data)

        opt_response = app_client.post(
            "/api/optimize",
            json={
                "selected_foods": sample_food_data,
                "nutrient_goals": {
                    "protein": calc_data["protein"],
                    "carbohydrate": calc_data["carbohydrate"],
                    "fats": calc_data["fats"],
                    "fiber": calc_data["fiber"],
                    "saturated_fats": calc_data["saturated_fats"],
                },
                "age": 30,
                "gender": "m",
                "smokingStatus": "no",
            },
        )

        assert opt_response.status_code == 200
        opt_data = json.loads(opt_response.data)
        assert opt_data["success"] is True

        assert "result" in opt_data
        assert "food_items" in opt_data["result"]
        assert "servings" in opt_data["result"]
        assert "nutrient_totals" in opt_data["result"]

        assert "overflow_by_nutrient" in opt_data["result"]
        assert "total_overflow" in opt_data["result"]

        overflow = opt_data["result"]["overflow_by_nutrient"]
        assert "protein" in overflow
        assert "carbohydrate" in overflow
        assert "fats" in overflow
        assert "fiber" in overflow

        assert len(opt_data["result"]["servings"]) == 4
        assert opt_data["result"]["servings"][0] == 2.0
        assert opt_data["result"]["servings"][1] == 1.5
        assert opt_data["result"]["servings"][2] == 1.0
        assert opt_data["result"]["servings"][3] == 3.0


@patch("server.app.product")
def test_integration_grid_search_sorting(mock_product, app_client, sample_food_data):
    """Test that combinations are properly sorted by total overflow in integration context"""
    test_combinations = [
        (5, 5, 5, 5),
        (10, 0, 0, 0),
        (0, 0, 0, 0),
        (2, 4, 1, 3),
        (0, 3, 0, 0),
        (7, 0, 0, 0),
        (0, 0, 8, 0),
    ]

    mock_product.return_value = test_combinations

    with patch("server.app.linprog") as mock_linprog, patch(
        "server.app.nutrient_bounds"
    ) as mock_nutrient_bounds, patch("server.app.sorted", wraps=sorted) as mock_sorted:

        lower_bounds = pd.Series({"Vitamin A (µg)": 900})
        upper_bounds = pd.Series({"Vitamin A (µg)": 3000})
        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        result = MagicMock()
        result.success = True
        result.x = np.array([1.0, 1.0, 1.0, 1.0])
        mock_linprog.return_value = result

        test_data = {
            "selected_foods": sample_food_data,
            "nutrient_goals": {
                "protein": 150,
                "carbohydrate": 200,
                "fats": 67,
                "fiber": 28,
            },
            "age": 30,
            "gender": "m",
        }

        response = app_client.post("/api/optimize", json=test_data)

        mock_sorted.assert_called()

        assert response.status_code == 200
        data = json.loads(response.data)

        assert data["success"] is True

        assert data["result"]["total_overflow"] == 0


@patch("server.app.nutrient_bounds")
@patch("server.app.product")
def test_integration_difficult_nutrient_requirements(
    mock_product, mock_nutrient_bounds, app_client, sample_food_data
):
    """Test challenging nutrient requirements that need different overflow percentages"""
    test_combinations = [
        (0, 0, 0, 0),
        (5, 0, 0, 0),
        (0, 5, 0, 0),
        (0, 0, 5, 0),
        (0, 0, 0, 5),
    ]

    mock_product.return_value = test_combinations

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
    mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

    high_carb_data = {
        "selected_foods": sample_food_data,
        "nutrient_goals": {
            "protein": 50,
            "carbohydrate": 500,
            "fats": 40,
            "fiber": 25,
        },
        "age": 30,
        "gender": "m",
    }

    high_protein_data = {
        "selected_foods": sample_food_data,
        "nutrient_goals": {
            "protein": 300,
            "carbohydrate": 100,
            "fats": 40,
            "fiber": 25,
        },
        "age": 30,
        "gender": "m",
    }

    with patch("server.app.linprog") as mock_linprog:
        carb_result = MagicMock()
        carb_result.success = True
        carb_result.x = np.array([1.0, 5.0, 0.5, 2.0])

        protein_result = MagicMock()
        protein_result.success = True
        protein_result.x = np.array([5.0, 1.0, 0.5, 0.5])

        mock_linprog.side_effect = [carb_result, protein_result]

        carb_response = app_client.post("/api/optimize", json=high_carb_data)
        assert carb_response.status_code == 200
        carb_result_data = json.loads(carb_response.data)
        assert carb_result_data["success"] is True

        protein_response = app_client.post("/api/optimize", json=high_protein_data)
        assert protein_response.status_code == 200
        protein_result_data = json.loads(protein_response.data)
        assert protein_result_data["success"] is True

        assert (
            carb_result_data["result"]["servings"]
            != protein_result_data["result"]["servings"]
        )


def test_scenario_smoker_adjustment_with_grid_search(app_client, sample_food_data):
    """Test that smoker status affects optimization through vitamin C requirements with grid search"""
    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds, patch(
        "server.app.linprog"
    ) as mock_linprog, patch("server.app.product") as mock_product:
        test_combinations = [(0, 0, 0, 0)]
        mock_product.return_value = test_combinations

        lower_bounds = pd.Series({"Vitamin C (mg)": 90})
        upper_bounds = pd.Series({"Vitamin C (mg)": 2000})
        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        smoker_result = MagicMock(
            success=True,
            x=np.array([1.0, 1.0, 5.0, 1.0]),
        )

        non_smoker_result = MagicMock(
            success=True,
            x=np.array([2.0, 2.0, 1.0, 1.0]),
        )

        mock_linprog.side_effect = [non_smoker_result, smoker_result]

        non_smoker_response = app_client.post(
            "/api/optimize",
            json={
                "selected_foods": sample_food_data,
                "nutrient_goals": {"protein": 100, "carbohydrate": 200, "fats": 50},
                "age": 30,
                "gender": "m",
                "smokingStatus": "no",
            },
        )

        smoker_response = app_client.post(
            "/api/optimize",
            json={
                "selected_foods": sample_food_data,
                "nutrient_goals": {"protein": 100, "carbohydrate": 200, "fats": 50},
                "age": 30,
                "gender": "m",
                "smokingStatus": "yes",
            },
        )

        assert non_smoker_response.status_code == 200
        assert smoker_response.status_code == 200

        non_smoker_data = json.loads(non_smoker_response.data)
        smoker_data = json.loads(smoker_response.data)

        assert non_smoker_data["success"] is True
        assert smoker_data["success"] is True

        assert (
            smoker_data["result"]["servings"][2]
            > non_smoker_data["result"]["servings"][2]
        )

        assert "overflow_by_nutrient" in smoker_data["result"]
        assert "overflow_by_nutrient" in non_smoker_data["result"]
