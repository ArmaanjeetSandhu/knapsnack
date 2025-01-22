from flask import Flask, request, jsonify, render_template
from whitenoise import WhiteNoise
import pandas as pd
import numpy as np
from scipy.optimize import linprog
import calculator_functions as cf
import helper_functions as hf
import os
from dotenv import load_dotenv
import requests
from typing import Dict, List, Optional
import json

app = Flask(__name__)
app.wsgi_app = WhiteNoise(app.wsgi_app, root="static/", prefix="static/")

load_dotenv()

# Store selected foods in memory (in production, this should be a database)
selected_foods = []

# API configuration
API_KEY = os.environ.get("USDA_API_KEY")
API_ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search"

# Nutrient ID mapping
NUTRIENT_MAP = {
    "Vitamin A": "Vitamin A, RAE",
    "Vitamin C": "Vitamin C, total ascorbic acid",
    "Vitamin D": "Vitamin D3 (cholecalciferol)",
    "Vitamin E": "Vitamin E (alpha-tocopherol)",
    "Vitamin K": "Vitamin K (phylloquinone)",
    "Thiamin": "Thiamin",
    "Riboflavin": "Riboflavin",
    "Niacin": "Niacin",
    "Vitamin B6": "Vitamin B-6",
    "Folate": "Folate, total",
    "Vitamin B12": "Vitamin B-12",
    "Calcium": "Calcium, Ca",
    "Carbohydrates": "Carbohydrate, by difference",
    "Protein": "Protein",
    "Fats": "Total lipid (fat)",
    "Saturated Fats": "Fatty acids, total saturated",
    "Fibre": "Fiber, total dietary",
    "Copper": "Copper, Cu",
    "Iodine": "Iodine, I",
    "Iron": "Iron, Fe",
    "Magnesium": "Magnesium, Mg",
    "Manganese": "Manganese, Mn",
    "Phosphorus": "Phosphorus, P",
    "Selenium": "Selenium, Se",
    "Zinc": "Zinc, Zn",
    "Potassium": "Potassium, K",
    "Sodium": "Sodium, Na",
}


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/search_food", methods=["POST"])
def search_food():
    """
    Search for foods using the USDA API.
    Expected request body: {"query": "search term"}
    """
    try:
        data = request.json
        search_term = data.get("query")

        if not search_term:
            return jsonify({"error": "No search term provided"}), 400

        params = {
            "api_key": API_KEY,
            "query": search_term,
            "dataType": ["SR Legacy"],
            "pageSize": 25,
            "requireAllWords": True,
        }

        response = requests.get(API_ENDPOINT, params=params)
        response.raise_for_status()

        # Extract relevant information from each food item
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
        return jsonify({"error": f"API request failed: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/add_food", methods=["POST"])
def add_food():
    """
    Add a selected food item to the list.
    Expected request body: {
        "fdcId": "food_id",
        "description": "food name",
        "price": float,
        "nutrients": {...}
    }
    """
    try:
        food_data = request.json
        required_fields = ["fdcId", "description", "price", "nutrients"]

        if not all(field in food_data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400

        # Add the food to our selected foods list
        selected_foods.append(food_data)

        return jsonify(
            {"message": "Food added successfully", "selected_foods": selected_foods}
        )

    except Exception as e:
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/remove_food", methods=["POST"])
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
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


@app.route("/calculate", methods=["POST"])
def calculate():
    try:
        data = request.json
        print("Received data:", data)
        gender = data["gender"]
        weight = int(data["weight"])
        height = int(data["height"])
        age = int(data["age"])

        if age < 19:
            return jsonify({"error": "Age must be 19 or older"}), 400
        if age > 100:
            return jsonify({"error": "Age must be 100 or younger"}), 400

        activity_multiplier = float(data["activity"])
        goal = data["goal"]

        bmr = cf.bmr(gender, weight, height, age)
        tdee = cf.tdee(bmr, activity_multiplier)
        daily_caloric_intake = {
            "cutting": 0.75 * tdee,
            "bulking": 1.10 * tdee,
            "maintaining": tdee,
        }.get(goal, tdee)

        protein, carbohydrates, fats, fibre, saturated_fats = cf.macros(
            int(daily_caloric_intake), goal
        )

        result = {
            "bmr": bmr,
            "tdee": tdee,
            "daily_caloric_intake": int(daily_caloric_intake),
            "protein": protein,
            "carbohydrates": carbohydrates,
            "fats": fats,
            "fibre": fibre,
            "saturated_fats": saturated_fats,
        }
        print("Calculated result:", result)
        return jsonify(result)
    except Exception as e:
        app.logger.error("Error occurred: %s", str(e))
        return jsonify({"error": "An internal error has occurred."}), 400


@app.route("/optimize", methods=["POST"])
def optimize():
    try:
        data = request.json
        nutrient_goals = data["nutrient_goals"]
        age = int(data["age"])
        gender = data["gender"]

        if age < 19:
            return jsonify({"error": "Age must be 19 or older"}), 400
        if age > 100:
            return jsonify({"error": "Age must be 100 or younger"}), 400

        if not selected_foods:
            return jsonify({"error": "No foods selected"}), 400

        # Create arrays for optimization
        c = np.array([food["price"] for food in selected_foods])

        A_ub = []
        b_ub = []

        # Handle macronutrient constraints
        nutrients = ["Protein", "Carbohydrates", "Fats", "Fibre", "Saturated Fats"]
        for nutrient in nutrients:
            if nutrient.lower().replace(" ", "_") in nutrient_goals:
                goal = nutrient_goals[nutrient.lower().replace(" ", "_")]
                values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
                A_ub.extend(
                    [[-val for val in values], values]  # Lower bound  # Upper bound
                )
                b_ub.extend([-goal, goal * 1.01])  # Allow 1% overflow

        # Handle micronutrient constraints based on RDA/UL
        nutrient_bounds = cf.nutrient_bounds(age, gender)
        for nutrient, api_name in NUTRIENT_MAP.items():
            if nutrient not in nutrients:  # Skip macronutrients already handled
                values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]

                # RDA constraint
                rda_key = f"{nutrient}_RDA"
                if rda_key in nutrient_bounds:
                    A_ub.append([-val for val in values])
                    b_ub.append(-nutrient_bounds[rda_key])

                # UL constraint
                ul_key = f"{nutrient}_UL"
                if ul_key in nutrient_bounds:
                    A_ub.append(values)
                    b_ub.append(nutrient_bounds[ul_key])

        A_ub = np.array(A_ub)
        b_ub = np.array(b_ub)

        # Solve optimization problem
        bounds = [(0, None) for _ in range(len(selected_foods))]
        result = linprog(c, A_ub=A_ub, b_ub=b_ub, bounds=bounds, method="highs")

        if result.success:
            servings = np.round(result.x, 1)
            food_items = [food["description"] for food in selected_foods]
            total_cost = np.round(result.x * c, 2)

            # Calculate nutrient totals
            nutrient_totals = {}
            for nutrient in NUTRIENT_MAP.keys():
                values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
                nutrient_totals[nutrient] = float(
                    np.round(np.sum(servings * values), 1)
                )

            result_data = {
                "food_items": food_items,
                "servings": servings.tolist(),
                "total_cost": total_cost.tolist(),
                "nutrient_totals": nutrient_totals,
                "total_cost_sum": float(np.sum(total_cost)),
            }

            return jsonify({"success": True, "result": result_data})
        else:
            return jsonify(
                {
                    "success": False,
                    "message": "Optimization failed! No feasible solution found.",
                }
            )

    except Exception as e:
        app.logger.error("Error occurred: %s", str(e))
        return jsonify({"error": f"An error occurred: {str(e)}"}), 500


def extract_nutrients(nutrients_data: List[Dict]) -> Dict[str, float]:
    """
    Extract relevant nutrients from the API response and convert to our format.
    """
    result = {}

    # Create reverse mapping for easier lookup
    reverse_map = {v: k for k, v in NUTRIENT_MAP.items()}

    for nutrient in nutrients_data:
        api_name = nutrient.get("nutrientName")
        if api_name in reverse_map:
            our_name = reverse_map[api_name]
            value = nutrient.get("value", 0)
            if value is not None:
                result[our_name] = float(value)

    # Fill in missing nutrients with 0
    for our_name in NUTRIENT_MAP.keys():
        if our_name not in result:
            result[our_name] = 0.0

    return result


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
