import logging
import mimetypes
import os
from itertools import product
from typing import Dict, List
import numpy as np
import pandas as pd
import pulp
import requests
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from server.utils import (
    calculate_bmr_mifflin_st_jeor,
    calculate_macros,
    calculate_tdee,
    nutrient_bounds,
)

logging.basicConfig(
    level=logging.ERROR,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[logging.FileHandler("app.log"), logging.StreamHandler()],
)
static_folder = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "client", "dist")
)
app = Flask(__name__, static_folder=static_folder, static_url_path="")
CORS(app)
mimetypes.add_type("video/mp4", ".mp4")


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    static_folder_str = str(app.static_folder) if app.static_folder is not None else ""
    normalized_path = os.path.normpath(os.path.join(static_folder_str, str(path)))
    if not normalized_path.startswith(static_folder_str):
        return "Forbidden", 403
    if path != "" and os.path.exists(normalized_path):
        if path.endswith(".mp4"):
            return send_file(normalized_path, mimetype="video/mp4")
        return send_from_directory(static_folder_str, path)
    else:
        return send_from_directory(static_folder_str, "index.html")


API_ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search"
NUTRIENT_MAP = {
    "Vitamin A (µg)": "Vitamin A, RAE",
    "Vitamin C (mg)": "Vitamin C, total ascorbic acid",
    "Vitamin E (mg)": "Vitamin E (alpha-tocopherol)",
    "Vitamin K (µg)": "Vitamin K (phylloquinone)",
    "Thiamin (mg)": "Thiamin",
    "Riboflavin (mg)": "Riboflavin",
    "Niacin (mg)": "Niacin",
    "Vitamin B6 (mg)": "Vitamin B-6",
    "Folate (µg)": "Folate, total",
    "Calcium (mg)": "Calcium, Ca",
    "carbohydrate": "Carbohydrate, by difference",
    "Choline (mg)": "Choline, total",
    "protein": "Protein",
    "fats": "Total lipid (fat)",
    "saturated_fats": "Fatty acids, total saturated",
    "fiber": "Fiber, total dietary",
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
        if data is None:
            return (
                jsonify(
                    {
                        "error": "No JSON data provided or Content-Type not set to application/json"
                    }
                ),
                400,
            )
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
                    "fdcId": str(food.get("fdcId")),
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


@app.route("/api/calculate", methods=["POST"])
def calculate():
    try:
        data = request.json
        print("Received data:", data)
        if data is None:
            return (
                jsonify(
                    {
                        "error": "No JSON data provided or Content-Type not set to application/json"
                    }
                ),
                400,
            )
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
        bmr = calculate_bmr_mifflin_st_jeor(gender, weight, height, age)
        tdee = calculate_tdee(bmr, activity_multiplier)
        daily_caloric_intake = int(percentage * tdee)
        protein, carbohydrate, fats, fiber, saturated_fats = calculate_macros(
            daily_caloric_intake, pratio, cratio, fratio
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
            "daily_caloric_intake": daily_caloric_intake,
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


def perform_feasibility_analysis(
    selected_foods, max_servings, lower_bounds, upper_bounds, nutrient_goals
):
    if isinstance(lower_bounds, pd.Series):
        lower_bounds = lower_bounds.to_dict()
    if isinstance(upper_bounds, pd.Series):
        upper_bounds = upper_bounds.to_dict()
    lower_bounds = {k: float(v) for k, v in lower_bounds.items() if pd.notna(v)}
    upper_bounds = {k: float(v) for k, v in upper_bounds.items() if pd.notna(v)}
    lower_bound_issues = []
    upper_bound_issues = []
    for nutrient, min_value in lower_bounds.items():
        try:
            min_value = float(min_value)
            if np.isnan(min_value):
                continue
        except (ValueError, TypeError):
            continue
        max_possible = 0
        for i, food in enumerate(selected_foods):
            if nutrient in food["nutrients"]:
                max_possible += food["nutrients"][nutrient] * max_servings[i]
        if max_possible < min_value:
            shortfall = min_value - max_possible
            shortfall_percentage = (shortfall / min_value) * 100 if min_value > 0 else 0
            lower_bound_issues.append(
                {
                    "nutrient": nutrient,
                    "required": min_value,
                    "achievable": max_possible,
                    "shortfall": shortfall,
                    "shortfallPercentage": shortfall_percentage,
                }
            )
    for nutrient, max_value in upper_bounds.items():
        try:
            max_value = float(max_value)
            if np.isnan(max_value):
                continue
        except (ValueError, TypeError):
            continue
        min_possible = 0
        has_nutrient = False
        for food in selected_foods:
            if nutrient in food["nutrients"] and food["nutrients"][nutrient] > 0:
                has_nutrient = True
                min_possible += food["nutrients"][nutrient]
        if has_nutrient and min_possible > max_value:
            excess = min_possible - max_value
            excess_percentage = (excess / max_value) * 100 if max_value > 0 else 0
            upper_bound_issues.append(
                {
                    "nutrient": nutrient,
                    "limit": max_value,
                    "minimum": min_possible,
                    "excess": excess,
                    "excessPercentage": excess_percentage,
                }
            )
    for nutrient in ["protein", "carbohydrate", "fats", "fiber"]:
        if nutrient in nutrient_goals:
            min_value = nutrient_goals[nutrient]
            max_possible = 0
            for i, food in enumerate(selected_foods):
                if nutrient in food["nutrients"]:
                    max_possible += food["nutrients"][nutrient] * max_servings[i]
            if max_possible < min_value:
                shortfall = min_value - max_possible
                shortfall_percentage = (
                    (shortfall / min_value) * 100 if min_value > 0 else 0
                )
                lower_bound_issues.append(
                    {
                        "nutrient": nutrient,
                        "required": min_value,
                        "achievable": max_possible,
                        "shortfall": shortfall,
                        "shortfallPercentage": shortfall_percentage,
                    }
                )
    is_lower_bounds_feasible = len(lower_bound_issues) == 0
    is_upper_bounds_feasible = len(upper_bound_issues) == 0
    is_feasible = is_lower_bounds_feasible and is_upper_bounds_feasible
    lower_bound_issues.sort(key=lambda x: x["shortfallPercentage"], reverse=True)
    upper_bound_issues.sort(key=lambda x: x["excessPercentage"], reverse=True)
    return {
        "analysis": "Feasibility analysis completed",
        "isLowerBoundsFeasible": is_lower_bounds_feasible,
        "isUpperBoundsFeasible": is_upper_bounds_feasible,
        "isFeasible": is_feasible,
        "lowerBoundIssues": lower_bound_issues,
        "upperBoundIssues": upper_bound_issues,
    }


@app.route("/api/optimize", methods=["POST"])
def optimize():
    try:
        data = request.json
        if data is None:
            return (
                jsonify(
                    {
                        "error": "No JSON data provided or Content-Type not set to application/json"
                    }
                ),
                400,
            )
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
        costs = np.array([food["price"] for food in selected_foods_data])
        max_servings = np.array(
            [
                food.get("maxServing", default_max_serving) / food["servingSize"]
                for food in selected_foods_data
            ]
        )
        custom_lower_bounds = None
        custom_upper_bounds = None
        if "lower_bounds" in nutrient_goals and nutrient_goals["lower_bounds"]:
            custom_lower_bounds = pd.Series(nutrient_goals["lower_bounds"])
        if "upper_bounds" in nutrient_goals and nutrient_goals["upper_bounds"]:
            custom_upper_bounds = pd.Series(nutrient_goals["upper_bounds"])
        if custom_lower_bounds is not None and custom_upper_bounds is not None:
            lower_bounds = custom_lower_bounds
            upper_bounds = custom_upper_bounds
            app.logger.info("Using custom nutrient bounds from request")
        else:
            lower_bounds, upper_bounds = nutrient_bounds(age, gender)
            app.logger.info("Using default nutrient bounds")
        if smoking_status == "yes":
            vitamin_c_key = "Vitamin C (mg)"
            if vitamin_c_key in lower_bounds:
                if custom_lower_bounds is None:
                    lower_bounds[vitamin_c_key] = (
                        float(lower_bounds[vitamin_c_key]) + 35.0
                    )
                    app.logger.info(
                        f"Adjusted Vitamin C for smoking: {lower_bounds[vitamin_c_key]}"
                    )
        feasibility_analysis = perform_feasibility_analysis(
            selected_foods_data,
            max_servings,
            lower_bounds,
            upper_bounds,
            nutrient_goals,
        )
        if not feasibility_analysis["isFeasible"]:
            return jsonify(
                {
                    "success": False,
                    "message": "Diet optimization is not feasible with the selected foods and nutrient goals.",
                    "feasibilityAnalysis": feasibility_analysis,
                }
            )
        overflow_percentages = list(range(0, 11))
        nutrients = ["protein", "carbohydrate", "fats", "fiber"]
        all_combinations = list(product(overflow_percentages, repeat=len(nutrients)))
        sorted_combinations = sorted(all_combinations, key=sum)
        for combo in sorted_combinations:
            prob = pulp.LpProblem("Diet_Optimization", pulp.LpMinimize)
            num_foods = len(selected_foods_data)
            x = [
                pulp.LpVariable(f"x_{i}", 0, max_servings[i]) for i in range(num_foods)
            ]
            y = [pulp.LpVariable(f"y_{i}", cat=pulp.LpBinary) for i in range(num_foods)]
            prob += pulp.lpSum([costs[i] * x[i] for i in range(num_foods)])
            for i in range(num_foods):
                prob += x[i] <= max_servings[i] * y[i]
                prob += x[i] >= y[i]
            for i, nutrient in enumerate(nutrients):
                nutrient_key = nutrient.lower().replace(" ", "_")
                if nutrient_key in nutrient_goals:
                    goal = nutrient_goals[nutrient_key]
                    values = [
                        food["nutrients"].get(nutrient, 0)
                        for food in selected_foods_data
                    ]
                    overflow_factor = 1 + (combo[i] / 100)
                    prob += (
                        pulp.lpSum([values[j] * x[j] for j in range(num_foods)]) >= goal
                    )
                    prob += pulp.lpSum(
                        [values[j] * x[j] for j in range(num_foods)]
                    ) <= int(goal * overflow_factor)
            if "saturated_fats" in nutrient_goals:
                sat_fat_goal = nutrient_goals["saturated_fats"]
                sat_fat_values = [
                    food["nutrients"].get("saturated_fats", 0)
                    for food in selected_foods_data
                ]
                prob += (
                    pulp.lpSum([sat_fat_values[j] * x[j] for j in range(num_foods)])
                    <= sat_fat_goal
                )
            for nutrient, _ in NUTRIENT_MAP.items():
                if nutrient not in nutrients:
                    values = [
                        food["nutrients"].get(nutrient, 0)
                        for food in selected_foods_data
                    ]
                    rda_key = nutrient
                    if rda_key in lower_bounds and pd.notna(lower_bounds[rda_key]):
                        prob += pulp.lpSum(
                            [values[j] * x[j] for j in range(num_foods)]
                        ) >= float(lower_bounds[rda_key])
                    if rda_key in upper_bounds and pd.notna(upper_bounds[rda_key]):
                        prob += pulp.lpSum(
                            [values[j] * x[j] for j in range(num_foods)]
                        ) <= float(upper_bounds[rda_key])
            prob.solve(pulp.PULP_CBC_CMD(msg=False))
            if prob.status == pulp.LpStatusOptimal:
                servings = np.array([x[i].value() for i in range(num_foods)])
                servings = np.round(servings, 1)
                food_items = [food["description"] for food in selected_foods_data]
                total_cost = np.round(servings * costs, 1)
                nutrient_totals = {}
                for nutrient in NUTRIENT_MAP.keys():
                    values = [
                        food["nutrients"].get(nutrient, 0)
                        for food in selected_foods_data
                    ]
                    nutrient_totals[nutrient] = float(
                        np.round(np.sum(servings * values), 1)
                    )
                overflow_by_nutrient = {
                    nutrient: int(percent)
                    for nutrient, percent in zip(nutrients, combo)
                }
                result_data = {
                    "food_items": food_items,
                    "servings": servings.tolist(),
                    "total_cost": total_cost.tolist(),
                    "nutrient_totals": nutrient_totals,
                    "total_cost_sum": float(np.sum(total_cost)),
                    "overflow_by_nutrient": overflow_by_nutrient,
                    "total_overflow": sum(combo),
                    "using_custom_bounds": custom_lower_bounds is not None,
                }
                return jsonify({"success": True, "result": result_data})
        return jsonify(
            {
                "success": False,
                "message": "Optimization failed! No feasible solution found even with maximum allowed nutrient flexibility.",
                "feasibilityAnalysis": feasibility_analysis,
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
