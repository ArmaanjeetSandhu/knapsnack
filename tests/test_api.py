import json
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd
import requests

from server.app import NUTRIENT_MAP, extract_nutrients


def test_extract_nutrients():
    """Test the nutrient extraction function"""
    sample_nutrients = [
        {"nutrientName": "Protein", "value": 25.8},
        {"nutrientName": "Total lipid (fat)", "value": 3.2},
        {"nutrientName": "Carbohydrate, by difference", "value": 0.0},
        {"nutrientName": "Fiber, total dietary", "value": 2.1},
        {"nutrientName": "Vitamin C, total ascorbic acid", "value": 0.0},
        {"nutrientName": "Calcium, Ca", "value": 27.0},
        {"nutrientName": "Iron, Fe", "value": 2.2},
        {"nutrientName": "Fatty acids, total saturated", "value": 0.9},
        {"nutrientName": "Non-mapped nutrient", "value": 100},
    ]

    nutrients = extract_nutrients(sample_nutrients)

    assert nutrients["protein"] == 25.8
    assert nutrients["fats"] == 3.2
    assert nutrients["carbohydrate"] == 0.0
    assert nutrients["fiber"] == 2.1
    assert nutrients["Vitamin C (mg)"] == 0.0
    assert nutrients["Calcium (mg)"] == 27.0
    assert nutrients["Iron (mg)"] == 2.2
    assert nutrients["saturated_fats"] == 0.9

    for our_name in NUTRIENT_MAP.keys():
        assert our_name in nutrients

    sample_nutrients_with_none = [
        {"nutrientName": "Protein", "value": None},
        {
            "nutrientName": "Total lipid (fat)",
            "value": 0,
        },
        {"nutrientName": "Carbohydrate, by difference"},
    ]

    nutrients = extract_nutrients(sample_nutrients_with_none)

    assert nutrients["protein"] == 0.0
    assert nutrients["fats"] == 0.0
    assert nutrients["carbohydrate"] == 0.0


def test_search_food_api(app_client, mock_usda_api_response):
    """Test the food search API endpoint with mocked USDA API response"""
    with patch("requests.get") as mock_get:
        mock_response = MagicMock()
        mock_response.json.return_value = mock_usda_api_response
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        response = app_client.post(
            "/api/search_food", json={"query": "chicken breast", "api_key": "test_key"}
        )

        assert response.status_code == 200
        data = json.loads(response.data)
        assert "results" in data
        assert len(data["results"]) == 2

        first_result = data["results"][0]
        assert first_result["fdcId"] == "123456"
        assert (
            first_result["description"]
            == "Chicken, broilers or fryers, breast, meat only, raw"
        )
        assert "nutrients" in first_result

        assert "protein" in first_result["nutrients"]
        assert first_result["nutrients"]["protein"] == 23.1
        assert first_result["nutrients"]["fats"] == 1.2
        assert first_result["nutrients"]["carbohydrate"] == 0.0


def test_search_food_api_no_query(app_client):
    """Test search API with missing query parameter"""
    response = app_client.post("/api/search_food", json={"api_key": "test_key"})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "No search term provided" in data["error"]


def test_search_food_api_no_key(app_client):
    """Test search API with missing API key"""
    response = app_client.post("/api/search_food", json={"query": "chicken"})
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "No API key provided" in data["error"]


def test_search_food_api_error_handling(app_client):
    """Test error handling in search API"""
    with patch("requests.get") as mock_get:
        mock_get.side_effect = requests.exceptions.RequestException("API unavailable")

        response = app_client.post(
            "/api/search_food", json={"query": "chicken", "api_key": "test_key"}
        )
        assert response.status_code == 500
        data = json.loads(response.data)
        assert "error" in data
        assert "API request failed" in data["error"]


@patch("server.app.nutrient_bounds")
@patch("server.app.calculate_bmr")
def test_calculate_api(mock_calculate_bmr, mock_nutrient_bounds, app_client):
    """Test the calculate API endpoint with mocked BMR calculation"""
    mock_calculate_bmr.return_value = 1648

    lower_bounds = pd.Series(
        {"Vitamin A (µg)": 900, "Vitamin C (mg)": 90, "Calcium (mg)": 1000}
    )
    upper_bounds = pd.Series(
        {"Vitamin A (µg)": 3000, "Vitamin C (mg)": 2000, "Calcium (mg)": 2500}
    )
    mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

    response = app_client.post(
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

    assert response.status_code == 200
    data = json.loads(response.data)

    assert "bmr" in data
    assert data["bmr"] == 1648
    assert "tdee" in data
    assert data["tdee"] == 2554
    assert "daily_caloric_intake" in data
    assert data["daily_caloric_intake"] == 2554

    assert "protein" in data
    assert 190 <= data["protein"] <= 192
    assert "carbohydrate" in data
    assert 254 <= data["carbohydrate"] <= 256
    assert "fats" in data
    assert 84 <= data["fats"] <= 86

    assert "lower_bounds" in data
    assert "upper_bounds" in data
    assert data["lower_bounds"]["Vitamin C (mg)"] == 90
    assert data["upper_bounds"]["Calcium (mg)"] == 2500


def test_calculate_api_invalid_data(app_client):
    """Test calculate API with invalid data"""
    response = app_client.post(
        "/api/calculate",
        json={
            "gender": "m",
            "weight": "70",
            "height": "175",
            "age": "15",
            "activity": "1.55",
            "percentage": "100",
            "protein": "30",
            "carbohydrate": "40",
            "fats": "30",
        },
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "messages" in data
    assert "Age must be between 19 and 100" in data["messages"]

    response = app_client.post(
        "/api/calculate",
        json={
            "gender": "m",
            "weight": "250",
            "height": "175",
            "age": "30",
            "activity": "1.55",
            "percentage": "100",
            "protein": "30",
            "carbohydrate": "40",
            "fats": "30",
        },
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "messages" in data
    assert "Weight must be between 30 and 200 kg" in data["messages"]

    response = app_client.post(
        "/api/calculate",
        json={
            "gender": "m",
            "weight": "70",
            "height": "220",
            "age": "30",
            "activity": "1.55",
            "percentage": "100",
            "protein": "30",
            "carbohydrate": "40",
            "fats": "30",
        },
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "messages" in data
    assert "Height must be between 135 and 200 cm" in data["messages"]


@patch("server.app.nutrient_bounds")
def test_calculate_api_smoker_adjustment(mock_nutrient_bounds, app_client):
    """Test Vitamin C adjustment for smokers"""
    lower_bounds = pd.Series({"Vitamin C (mg)": 90})
    upper_bounds = pd.Series({"Vitamin C (mg)": 2000})
    mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

    response = app_client.post(
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
    non_smoker_data = json.loads(response.data)

    response = app_client.post(
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
            "smokingStatus": "yes",
        },
    )
    smoker_data = json.loads(response.data)

    assert smoker_data["lower_bounds"]["Vitamin C (mg)"] == 125
    assert non_smoker_data["lower_bounds"]["Vitamin C (mg)"] == 90


@patch("server.app.linprog")
@patch("server.app.nutrient_bounds")
def test_optimize_api(mock_nutrient_bounds, mock_linprog, app_client, sample_food_data):
    """Test the optimize API endpoint"""
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

    mock_result = MagicMock()
    mock_result.success = True
    mock_result.x = np.array([2.0, 1.0, 0.5, 3.0])
    mock_linprog.return_value = mock_result

    test_data = {
        "selected_foods": sample_food_data,
        "nutrient_goals": {
            "protein": 150,
            "carbohydrate": 200,
            "fats": 67,
            "fiber": 28,
            "saturated_fats": 22,
        },
        "age": 30,
        "gender": "m",
    }

    response = app_client.post("/api/optimize", json=test_data)

    assert response.status_code == 200
    data = json.loads(response.data)
    assert data["success"] is True

    result = data["result"]
    assert "food_items" in result
    assert "servings" in result
    assert "total_cost" in result
    assert "nutrient_totals" in result
    assert "total_cost_sum" in result

    assert "overflow_by_nutrient" in result
    assert "total_overflow" in result

    assert len(result["food_items"]) == 4
    assert result["food_items"][0] == "Chicken Breast"
    assert result["food_items"][1] == "Brown Rice"

    assert len(result["servings"]) == 4
    assert result["servings"][0] == 2.0
    assert result["servings"][1] == 1.0
    assert result["servings"][2] == 0.5
    assert result["servings"][3] == 3.0

    assert result["total_cost_sum"] == 32.5


def test_optimize_api_no_foods(app_client):
    """Test optimize API with no foods selected"""
    response = app_client.post(
        "/api/optimize",
        json={
            "selected_foods": [],
            "nutrient_goals": {"protein": 150, "carbohydrate": 200, "fats": 67},
            "age": 30,
            "gender": "m",
        },
    )
    assert response.status_code == 400
    data = json.loads(response.data)
    assert "error" in data
    assert "No foods selected" in data["error"]


@patch("server.app.linprog")
@patch("server.app.nutrient_bounds")
@patch("server.app.product")
def test_optimize_grid_search(
    mock_product, mock_nutrient_bounds, mock_linprog, app_client, sample_food_data
):
    """Test the grid search optimization approach with full range of percentages"""
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

    test_combinations = [
        (0, 0, 0, 0),
        (1, 0, 0, 0),
        (0, 0, 3, 0),
        (0, 0, 0, 7),
        (2, 4, 0, 0),
        (1, 2, 3, 4),
        (10, 10, 10, 10),
    ]
    mock_product.return_value = test_combinations

    mock_fail = MagicMock()
    mock_fail.success = False

    mock_success = MagicMock()
    mock_success.success = True
    mock_success.x = np.array([2.0, 1.0, 0.5, 3.0])

    mock_linprog.side_effect = [mock_fail, mock_fail, mock_success] + [mock_fail] * (
        len(test_combinations) - 3
    )

    test_data = {
        "selected_foods": sample_food_data,
        "nutrient_goals": {
            "protein": 150,
            "carbohydrate": 200,
            "fats": 67,
            "fiber": 28,
            "saturated_fats": 22,
        },
        "age": 30,
        "gender": "m",
    }

    response = app_client.post("/api/optimize", json=test_data)

    assert response.status_code == 200
    data = json.loads(response.data)

    assert data["success"] is True
    assert "result" in data
    assert "overflow_by_nutrient" in data["result"]

    overflow = data["result"]["overflow_by_nutrient"]
    assert overflow["protein"] == 0
    assert overflow["carbohydrate"] == 0
    assert overflow["fats"] == 3
    assert overflow["fiber"] == 0

    assert data["result"]["total_overflow"] == 3


@patch("server.app.linprog")
@patch("server.app.nutrient_bounds")
@patch("server.app.product")
@patch("server.app.sorted", wraps=sorted)
def test_optimize_grid_search_sorting(
    mock_sorted,
    mock_product,
    mock_nutrient_bounds,
    mock_linprog,
    app_client,
    sample_food_data,
):
    """Test that combinations are properly sorted by total overflow using the full range of percentages"""
    lower_bounds = pd.Series({"Vitamin A (µg)": 900})
    upper_bounds = pd.Series({"Vitamin A (µg)": 3000})
    mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

    test_combinations = [
        (10, 10, 10, 10),
        (5, 5, 5, 5),
        (0, 0, 0, 0),
        (1, 2, 3, 4),
        (0, 9, 0, 0),
        (3, 3, 3, 0),
        (6, 0, 0, 0),
    ]
    mock_product.return_value = test_combinations

    mock_fail = MagicMock()
    mock_fail.success = False

    mock_success = MagicMock()
    mock_success.success = True
    mock_success.x = np.array([1.0, 1.0, 1.0, 1.0])

    sorted_combos = sorted(test_combinations, key=sum)
    success_index = sorted_combos.index((6, 0, 0, 0))

    side_effects = (
        [mock_fail] * success_index
        + [mock_success]
        + [mock_fail] * (len(test_combinations) - success_index - 1)
    )
    mock_linprog.side_effect = side_effects

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

    overflow = data["result"]["overflow_by_nutrient"]
    assert overflow["protein"] == 6
    assert overflow["carbohydrate"] == 0
    assert overflow["fats"] == 0
    assert overflow["fiber"] == 0

    assert data["result"]["total_overflow"] == 6


@patch("server.app.linprog")
@patch("server.app.nutrient_bounds")
def test_optimize_no_feasible_solution(
    mock_nutrient_bounds, mock_linprog, app_client, sample_food_data
):
    """Test the case where no feasible solution is found even with maximum overflow"""
    lower_bounds = pd.Series({"Vitamin A (µg)": 900})
    upper_bounds = pd.Series({"Vitamin A (µg)": 3000})
    mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

    mock_fail = MagicMock()
    mock_fail.success = False
    mock_linprog.return_value = mock_fail

    test_data = {
        "selected_foods": sample_food_data,
        "nutrient_goals": {
            "protein": 1000,
            "carbohydrate": 200,
            "fats": 67,
            "fiber": 28,
        },
        "age": 30,
        "gender": "m",
    }

    response = app_client.post("/api/optimize", json=test_data)

    assert response.status_code == 200
    data = json.loads(response.data)

    assert data["success"] is False
    assert "message" in data
    assert "No feasible solution" in data["message"]


@patch("server.app.linprog")
@patch("server.app.nutrient_bounds")
@patch("server.app.product")
def test_optimize_varying_nutrient_requirements(
    mock_product, mock_nutrient_bounds, mock_linprog, app_client, sample_food_data
):
    """Test optimization with varying nutrient requirements that need different flexibility levels"""
    lower_bounds = pd.Series({"Vitamin A (µg)": 900})
    upper_bounds = pd.Series({"Vitamin A (µg)": 3000})
    mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

    test_combinations = [
        (0, 0, 0, 0),
        (1, 0, 0, 0),
        (0, 1, 0, 0),
        (0, 0, 1, 0),
        (0, 0, 0, 1),
        (3, 7, 0, 0),
        (0, 3, 7, 2),
        (10, 10, 10, 10),
    ]
    mock_product.return_value = test_combinations

    mock_fail = MagicMock()
    mock_fail.success = False

    mock_success = MagicMock()
    mock_success.success = True
    mock_success.x = np.array([1.0, 2.0, 3.0, 0.5])

    sorted_combos = sorted(test_combinations, key=sum)
    success_index = sorted_combos.index((0, 3, 7, 2))

    side_effects = (
        [mock_fail] * success_index
        + [mock_success]
        + [mock_fail] * (len(test_combinations) - success_index - 1)
    )
    mock_linprog.side_effect = side_effects

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

    assert response.status_code == 200
    data = json.loads(response.data)

    assert data["success"] is True

    overflow = data["result"]["overflow_by_nutrient"]
    assert overflow["protein"] == 0
    assert overflow["carbohydrate"] == 3
    assert overflow["fats"] == 7
    assert overflow["fiber"] == 2

    assert data["result"]["total_overflow"] == 12
