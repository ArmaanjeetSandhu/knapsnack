import json
from unittest.mock import MagicMock, patch

import numpy as np
import pandas as pd


def test_end_to_end_calculation_optimization(app_client, sample_food_data):
    """Test the full calculation and optimization flow"""

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

        assert len(opt_data["result"]["servings"]) == 4
        assert opt_data["result"]["servings"][0] == 2.0
        assert opt_data["result"]["servings"][1] == 1.5
        assert opt_data["result"]["servings"][2] == 1.0
        assert opt_data["result"]["servings"][3] == 3.0


@patch("server.app.calculate_bmr")
def test_edge_case_extreme_activity(mock_calculate_bmr, app_client):
    """Test calculation with extreme activity levels"""
    mock_calculate_bmr.return_value = 1500

    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds:
        lower_bounds = pd.Series({"Vitamin A (µg)": 900})
        upper_bounds = pd.Series({"Vitamin A (µg)": 3000})
        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        low_response = app_client.post(
            "/api/calculate",
            json={
                "gender": "m",
                "weight": "70",
                "height": "175",
                "age": "30",
                "activity": "1.2",
                "percentage": "100",
                "protein": "30",
                "carbohydrate": "40",
                "fats": "30",
            },
        )

        high_response = app_client.post(
            "/api/calculate",
            json={
                "gender": "m",
                "weight": "70",
                "height": "175",
                "age": "30",
                "activity": "1.9",
                "percentage": "100",
                "protein": "30",
                "carbohydrate": "40",
                "fats": "30",
            },
        )

        assert low_response.status_code == 200
        assert high_response.status_code == 200

        low_data = json.loads(low_response.data)
        high_data = json.loads(high_response.data)

        assert high_data["tdee"] > low_data["tdee"]
        assert high_data["daily_caloric_intake"] > low_data["daily_caloric_intake"]

        activity_ratio = 1.9 / 1.2
        tdee_ratio = high_data["tdee"] / low_data["tdee"]
        assert abs(activity_ratio - tdee_ratio) < 0.05


@patch("server.app.calculate_bmr")
def test_edge_case_varying_caloric_goals(mock_calculate_bmr, app_client):
    """Test calculation with different caloric intake goals"""
    mock_calculate_bmr.return_value = 1600

    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds:
        lower_bounds = pd.Series({"Vitamin A (µg)": 900})
        upper_bounds = pd.Series({"Vitamin A (µg)": 3000})
        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        base_data = {
            "gender": "m",
            "weight": "70",
            "height": "175",
            "age": "30",
            "activity": "1.55",
            "protein": "30",
            "carbohydrate": "40",
            "fats": "30",
        }

        percentages = [50, 75, 100, 125, 150]
        responses = []

        for percentage in percentages:
            test_data = base_data.copy()
            test_data["percentage"] = str(percentage)
            response = app_client.post("/api/calculate", json=test_data)
            assert response.status_code == 200
            responses.append(json.loads(response.data))

        base_tdee = responses[2]["tdee"]

        for i, percentage in enumerate(percentages):
            expected_intake = base_tdee * (percentage / 100)
            actual_intake = responses[i]["daily_caloric_intake"]
            assert abs(expected_intake - actual_intake) < 1

            assert responses[i]["bmr"] == responses[0]["bmr"]
            assert responses[i]["tdee"] == responses[0]["tdee"]

            protein_ratio = responses[i]["protein"] / responses[0]["protein"]
            carb_ratio = responses[i]["carbohydrate"] / responses[0]["carbohydrate"]
            fat_ratio = responses[i]["fats"] / responses[0]["fats"]

            expected_ratio = percentage / percentages[0]
            assert abs(protein_ratio - expected_ratio) < 0.05
            assert abs(carb_ratio - expected_ratio) < 0.05
            assert abs(fat_ratio - expected_ratio) < 0.05


def test_scenario_dietary_restrictions(app_client, sample_food_data):
    """Test optimization with limited food choices (dietary restrictions)"""
    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds, patch(
        "server.app.linprog"
    ) as mock_linprog:

        lower_bounds = pd.Series(
            {"Vitamin A (µg)": 900, "Vitamin C (mg)": 90, "Calcium (mg)": 1000}
        )
        upper_bounds = pd.Series(
            {"Vitamin A (µg)": 3000, "Vitamin C (mg)": 2000, "Calcium (mg)": 2500}
        )
        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        mock_success = MagicMock()
        mock_success.success = True
        mock_success.x = np.array([0.0, 3.0, 2.0])

        mock_fail = MagicMock()
        mock_fail.success = False

        vegan_foods = sample_food_data[1:]

        mock_linprog.return_value = mock_success

        vegan_response = app_client.post(
            "/api/optimize",
            json={
                "selected_foods": vegan_foods,
                "nutrient_goals": {"protein": 100, "carbohydrate": 200, "fats": 50},
                "age": 30,
                "gender": "m",
            },
        )

        assert vegan_response.status_code == 200
        vegan_data = json.loads(vegan_response.data)
        assert vegan_data["success"] is True

        mock_linprog.return_value = mock_fail

        limited_foods = sample_food_data[1:2]
        limited_response = app_client.post(
            "/api/optimize",
            json={
                "selected_foods": limited_foods,
                "nutrient_goals": {"protein": 100, "carbohydrate": 200, "fats": 50},
                "age": 30,
                "gender": "m",
            },
        )

        assert limited_response.status_code == 200
        limited_data = json.loads(limited_response.data)
        assert limited_data["success"] is False
        assert "message" in limited_data
        assert "No feasible solution" in limited_data["message"]


@patch("server.app.calculate_bmr")
def test_scenario_different_genders(mock_calculate_bmr, app_client):
    """Test different calculations based on gender"""

    def bmr_side_effect(gender, *args):
        return 1600 if gender.lower() == "m" else 1400

    mock_calculate_bmr.side_effect = bmr_side_effect

    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds:
        male_lower = pd.Series(
            {"Iron (mg)": 8, "Vitamin A (µg)": 900, "Calcium (mg)": 1000}
        )
        male_upper = pd.Series(
            {"Iron (mg)": 45, "Vitamin A (µg)": 3000, "Calcium (mg)": 2500}
        )

        female_lower = pd.Series(
            {
                "Iron (mg)": 18,
                "Vitamin A (µg)": 700,
                "Calcium (mg)": 1000,
            }
        )
        female_upper = pd.Series(
            {"Iron (mg)": 45, "Vitamin A (µg)": 3000, "Calcium (mg)": 2500}
        )

        mock_nutrient_bounds.side_effect = [
            (male_lower, male_upper),
            (female_lower, female_upper),
        ]

        male_data = {
            "gender": "m",
            "weight": "70",
            "height": "175",
            "age": "30",
            "activity": "1.55",
            "percentage": "100",
            "protein": "30",
            "carbohydrate": "40",
            "fats": "30",
        }

        female_data = male_data.copy()
        female_data["gender"] = "f"

        male_response = app_client.post("/api/calculate", json=male_data)
        female_response = app_client.post("/api/calculate", json=female_data)

        assert male_response.status_code == 200
        assert female_response.status_code == 200

        male_result = json.loads(male_response.data)
        female_result = json.loads(female_response.data)

        assert male_result["bmr"] > female_result["bmr"]

        assert male_result["lower_bounds"]["Iron (mg)"] == 8
        assert female_result["lower_bounds"]["Iron (mg)"] == 18

        assert male_result["lower_bounds"]["Vitamin A (µg)"] == 900
        assert female_result["lower_bounds"]["Vitamin A (µg)"] == 700


def test_scenario_smoker_adjustment_optimization(app_client, sample_food_data):
    """Test that smoker status affects optimization through vitamin C requirements"""
    with patch("server.app.nutrient_bounds") as mock_nutrient_bounds, patch(
        "server.app.linprog"
    ) as mock_linprog:

        lower_bounds = pd.Series({"Vitamin C (mg)": 90})
        upper_bounds = pd.Series({"Vitamin C (mg)": 2000})

        mock_nutrient_bounds.return_value = (lower_bounds, upper_bounds)

        mock_linprog.return_value = MagicMock(
            success=True, x=np.array([1.0, 1.0, 2.0, 1.0])
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

        assert smoker_response.status_code == 200
        assert non_smoker_response.status_code == 200

        smoker_data = json.loads(smoker_response.data)
        non_smoker_data = json.loads(non_smoker_response.data)

        assert smoker_data["success"] is True
        assert non_smoker_data["success"] is True
