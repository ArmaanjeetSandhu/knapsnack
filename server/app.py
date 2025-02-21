from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import numpy as np
from scipy.optimize import linprog
from server.utils import *
import os
import requests
from typing import Dict, List
import logging

logging.basicConfig(
    level=logging.ERROR,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)

static_folder = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "client", "dist")
)
app = Flask(__name__)
CORS(app)


@app.route("/")
def serve():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/<path:path>")
def serve_static(path):
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")


# Store selected foods in memory (in production, this should be a database)
selected_foods = []

API_ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search"

NUTRIENT_MAP = {
    "Vitamin A (µg)": "Vitamin A, RAE",
    "Vitamin C (mg)": "Vitamin C, total ascorbic acid",
    "Vitamin D (µg)": "Vitamin D3 (cholecalciferol)",
    "Vitamin E (mg)": "Vitamin E (alpha-tocopherol)",
    "Vitamin K (µg)": "Vitamin K (phylloquinone)",
    "Thiamin (mg)": "Thiamin",
    "Riboflavin (mg)": "Riboflavin",
    "Niacin (mg)": "Niacin",
    "Vitamin B6 (mg)": "Vitamin B-6",
    "Folate (µg)": "Folate, total",
    "Vitamin B12 (µg)": "Vitamin B-12",
    "Calcium (mg)": "Calcium, Ca",
    "carbohydrate": "Carbohydrate, by difference",
    "Choline (mg)": "Choline, total",
    "protein": "Protein",
    "fats": "Total lipid (fat)",
    "saturated_fats": "Fatty acids, total saturated",
    "fiber": "Fiber, total dietary",
    "Copper (µg)": "Copper, Cu",
    "Iron (mg)": "Iron, Fe",
    "Magnesium (mg)": "Magnesium, Mg",
    "Manganese (mg)": "Manganese, Mn",
    "Phosphorus (mg)": "Phosphorus, P",
    "Selenium (µg)": "Selenium, Se",
    "Zinc (mg)": "Zinc, Zn",
    "Potassium (mg)": "Potassium, K",
    "Sodium (mg)": "Sodium, Na",
    "Pantothenic Acid (mg)": "Pantothenic acid",
}


def extract_nutrients(nutrients_data: List[Dict]) -> Dict[str, float]:
    """
    Extract relevant nutrients from the API response and convert to our format.
    Returns nutrients per 100g.
    """
    result = {}

    reverse_map = {v: k for k, v in NUTRIENT_MAP.items()}

    for nutrient in nutrients_data:
        api_name = nutrient.get("nutrientName")
        if api_name in reverse_map:
            our_name = reverse_map[api_name]
            value = nutrient.get("value", 0)
            if value is not None:
                result[our_name] = float(value)

    for our_name in NUTRIENT_MAP.keys():
        if our_name not in result:
            result[our_name] = 0.0

    return result


@app.route("/api/search_food", methods=["POST"])
def search_food():
    try:
        data = request.json
        search_term = data.get("query")
        api_key = data.get("api_key")

        if not search_term:
            return jsonify({"error": "No search term provided"}), 400

        if not api_key:
            return jsonify({"error": "No API key provided"}), 400

        params = {
            "api_key": api_key,
            "query": search_term,
            "dataType": ["SR Legacy"],
            "pageSize": 25,
            "requireAllWords": True,
        }

        response = requests.get(API_ENDPOINT, params=params)
        response.raise_for_status()

        search_results = []
        for food in response.json().get("foods", []):
            search_results.append(
                {
                    "fdcId": food.get("fdcId"),
                    "description": food.get("description"),
                    "nutrients": extract_nutrients(food.get("foodNutrients", [])),
                }
            )

        return jsonify({"results": search_results})

    except requests.exceptions.RequestException as e:
        logging.error(f"API request failed: {str(e)}")
        return jsonify({"error": "API request failed"}), 500
    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error has occurred"}), 500


@app.route("/api/add_food", methods=["POST"])
def add_food():
    """
    Add a selected food item to the list.
    Expected request body: {
        "fdcId": "food_id",
        "description": "food name",
        "price": float,
        "servingSize": float,
        "nutrients": {...}
    }
    """
    try:
        food_data = request.json
        required_fields = ["fdcId", "description", "price", "servingSize", "nutrients"]

        if not all(field in food_data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        selected_foods.append(food_data)

        return jsonify(
            {"message": "Food added successfully", "selected_foods": selected_foods}
        )

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error has occurred"}), 500


@app.route("/api/remove_food", methods=["POST"])
def remove_food():
    """
    Remove a food item from the selected foods list.
    Expected request body: {"fdcId": "food_id"}
    """
    try:
        data = request.json
        fdc_id = data.get("fdcId")

        if not fdc_id:
            return jsonify({"error": "No food ID provided"}), 400

        global selected_foods
        selected_foods = [food for food in selected_foods if food["fdcId"] != fdc_id]

        return jsonify(
            {"message": "Food removed successfully", "selected_foods": selected_foods}
        )

    except Exception as e:
        logging.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An internal error has occurred"}), 500


@app.route("/api/calculate", methods=["POST"])
def calculate():
    try:
        data = request.json
        print("Received data:", data)

        gender = data["gender"]
        weight = int(data["weight"])
        height = int(data["height"])
        age = int(data["age"])
        pratio = float(data["protein"]) / 100
        cratio = float(data["carbohydrate"]) / 100
        fratio = float(data["fats"]) / 100
        activity_multiplier = float(data["activity"])
        percentage = float(data["percentage"]) / 100
        smoking_status = data.get("smokingStatus", "no")

        validation_errors = []

        if age < 19 or age > 100:
            validation_errors.append("Age must be between 19 and 100")
        if weight < 30 or weight > 200:
            validation_errors.append("Weight must be between 30 and 200 kg")
        if height < 135 or height > 200:
            validation_errors.append("Height must be between 135 and 200 cm")

        if validation_errors:
            return (
                jsonify({"error": "Validation failed", "messages": validation_errors}),
                400,
            )

        bmr = calculate_bmr(gender, weight, height, age)
        tdee = calculate_tdee(bmr, activity_multiplier)
        daily_caloric_intake = percentage * tdee

        protein, carbohydrate, fats, fiber, saturated_fats = calculate_macros(
            int(daily_caloric_intake), pratio, cratio, fratio
        )

        lower_bounds, upper_bounds = nutrient_bounds(age, gender)

        if smoking_status == "yes":
            vitamin_c_key = "Vitamin C (mg)"
            if vitamin_c_key in lower_bounds:
                lower_bounds[vitamin_c_key] += 35.0

        lower_bounds_dict = lower_bounds.to_dict()
        upper_bounds_dict = upper_bounds.to_dict()

        lower_bounds_dict = {
            k: float(v) for k, v in lower_bounds_dict.items() if pd.notna(v)
        }
        upper_bounds_dict = {
            k: float(v) for k, v in upper_bounds_dict.items() if pd.notna(v)
        }

        result = {
            "bmr": bmr,
            "tdee": tdee,
            "daily_caloric_intake": int(daily_caloric_intake),
            "protein": protein,
            "carbohydrate": carbohydrate,
            "fats": fats,
            "fiber": fiber,
            "saturated_fats": saturated_fats,
            "lower_bounds": lower_bounds_dict,
            "upper_bounds": upper_bounds_dict,
        }
        print("Calculated result:", result)
        return jsonify(result)

    except KeyError as e:
        app.logger.error("Missing required field: %s", str(e))
        return jsonify({"error": "A required field is missing."}), 400
    except ValueError as e:
        app.logger.error("Invalid value: %s", str(e))
        return jsonify({"error": "An invalid value was provided."}), 400
    except Exception as e:
        app.logger.error("Error occurred: %s", str(e))
        return jsonify({"error": "An internal server error has occurred."}), 500


@app.route("/api/optimize", methods=["POST"])
def optimize():
    try:
        data = request.json
        nutrient_goals = data["nutrient_goals"]
        selected_foods_data = data["selected_foods"]
        age = int(data["age"])
        gender = data["gender"]
        smoking_status = data.get("smokingStatus", "no")
        default_max_serving = data.get("max_serving_size", 500)

        if age < 19 or age > 100:
            return jsonify({"error": "Age must be between 19 and 100"}), 400

        if not selected_foods_data:
            return jsonify({"error": "No foods selected"}), 400

        c = np.array([food["price"] for food in selected_foods_data])

        max_servings = np.array(
            [
                food.get("maxServing", default_max_serving) / food["servingSize"]
                for food in selected_foods_data
            ]
        )

        lower_bounds, upper_bounds = nutrient_bounds(age, gender)

        if smoking_status == "yes":
            vitamin_c_key = "Vitamin C (mg)"
            if vitamin_c_key in lower_bounds:
                lower_bounds[vitamin_c_key] = float(lower_bounds[vitamin_c_key]) + 35.0

        for overflow_percent in range(0, 11):
            overflow_factor = 1 + (overflow_percent / 100)

            A_ub = []
            b_ub = []

            nutrients = ["protein", "carbohydrate", "fats", "fiber"]
            for nutrient in nutrients:
                if nutrient.lower().replace(" ", "_") in nutrient_goals:
                    goal = nutrient_goals[nutrient.lower().replace(" ", "_")]
                    values = [
                        food["nutrients"].get(nutrient, 0)
                        for food in selected_foods_data
                    ]
                    A_ub.extend([[-val for val in values], values])
                    b_ub.extend(
                        [
                            -goal,
                            goal * overflow_factor,
                        ]
                    )

            if "saturated_fats" in nutrient_goals:
                sat_fat_goal = nutrient_goals["saturated_fats"]
                sat_fat_values = [
                    food["nutrients"].get("saturated_fats", 0)
                    for food in selected_foods_data
                ]
                A_ub.append(sat_fat_values)
                b_ub.append(sat_fat_goal)

            for nutrient, api_name in NUTRIENT_MAP.items():
                if nutrient not in nutrients:
                    values = [
                        food["nutrients"].get(nutrient, 0)
                        for food in selected_foods_data
                    ]

                    rda_key = nutrient
                    if rda_key in lower_bounds and pd.notna(lower_bounds[rda_key]):
                        A_ub.append([-val for val in values])
                        b_ub.append(-float(lower_bounds[rda_key]))

                    if rda_key in upper_bounds and pd.notna(upper_bounds[rda_key]):
                        A_ub.append(values)
                        b_ub.append(float(upper_bounds[rda_key]))

            A_ub = np.array(A_ub)
            b_ub = np.array(b_ub)
            bounds = [(0, max_serving) for max_serving in max_servings]

            result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

            if result.success:
                servings = np.round(result.x, 1)
                food_items = [food["description"] for food in selected_foods_data]
                total_cost = np.round(result.x * c, 2)

                nutrient_totals = {}
                for nutrient in NUTRIENT_MAP.keys():
                    values = [
                        food["nutrients"].get(nutrient, 0)
                        for food in selected_foods_data
                    ]
                    nutrient_totals[nutrient] = float(
                        np.round(np.sum(servings * values), 1)
                    )

                result_data = {
                    "food_items": food_items,
                    "servings": servings.tolist(),
                    "total_cost": total_cost.tolist(),
                    "nutrient_totals": nutrient_totals,
                    "total_cost_sum": float(np.sum(total_cost)),
                    "overflow_percent": overflow_percent,
                }

                return jsonify({"success": True, "result": result_data})

        return jsonify(
            {
                "success": False,
                "message": "Optimization failed! No feasible solution found even with 10% overflow.",
            }
        )

    except Exception as e:
        app.logger.error("Error occurred: %s", str(e))
        return (
            jsonify(
                {"error": "An internal error has occurred. Please try again later."}
            ),
            500,
        )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() in ["true", "1"]
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
