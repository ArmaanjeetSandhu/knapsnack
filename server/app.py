"""
Main Flask application for diet optimization service.
"""

import logging
import mimetypes
import os
from datetime import datetime, timedelta
from itertools import product
from typing import Any, Dict, List, Optional, Tuple, Union

import numpy as np
import pandas as pd
import pulp
import requests
from flask import Flask, jsonify, make_response, request, send_file, send_from_directory
from flask_cors import CORS

from server.utils import (
    calculate_bmr_mifflin_st_jeor,
    calculate_macros,
    calculate_tdee,
    nutrient_bounds,
)

DEFAULT_PORT = 5000
API_ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search"
DEFAULT_MAX_SERVING = 500

AGE_MIN = 19
AGE_MAX = 100
WEIGHT_MIN = 30
WEIGHT_MAX = 200
HEIGHT_MIN = 135
HEIGHT_MAX = 200

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


@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    response.headers["Strict-Transport-Security"] = (
        "max-age=31536000; includeSubDomains"
    )
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    csp = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
        "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; "
        "img-src 'self' data:; "
        "font-src 'self'; "
        "connect-src 'self' https://api.nal.usda.gov; "
        "media-src 'self'; "
        "object-src 'none'; "
        "child-src 'none'; "
        "form-action 'self'; "
        "frame-ancestors 'none';"
    )
    response.headers["Content-Security-Policy"] = csp
    if "Cache-Control" not in response.headers:
        if response.mimetype in ["text/html"]:
            response.headers["Cache-Control"] = "public, max-age=300"
        elif response.mimetype in ["application/json"]:
            response.headers["Cache-Control"] = "public, max-age=60"
        elif response.mimetype in [
            "text/css",
            "application/javascript",
            "image/svg+xml",
        ]:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        elif response.mimetype in [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
            "video/mp4",
        ]:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        else:
            response.headers["Cache-Control"] = "public, max-age=86400"
    return response


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    """Serve static files or fallback to index.html for SPA routing."""
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


@app.route("/robots.txt")
def robots():
    """Serve robots.txt file"""
    response = make_response(
        """
User-agent: *
Allow: /
Disallow: /api/

User-agent: *
Disallow: /api/

Sitemap: https://goal-ith-4c1eb8835462.herokuapp.com/sitemap.xml
    """.strip()
    )
    response.headers["Content-Type"] = "text/plain"
    return response


@app.route("/sitemap.xml")
def sitemap():
    """Generate a simple sitemap"""
    host_url = request.host_url.rstrip("/")

    xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        f"  <url><loc>{host_url}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>",
        "</urlset>",
    ]

    response = make_response("\n".join(xml))
    response.headers["Content-Type"] = "application/xml"
    return response


@app.route("/.well-known/security.txt")
def security_txt():
    """Serve security.txt file"""
    expires_date = (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%dT%H:%M:%SZ")

    response = make_response(
        f"""
Contact: armaanjeetsandhu430@gmail.com
Expires: {expires_date}
Preferred-Languages: en
Canonical: https://goal-ith-4c1eb8835462.herokuapp.com/.well-known/security.txt
Policy: https://goal-ith-4c1eb8835462.herokuapp.com/security-policy
    """.strip()
    )
    response.headers["Content-Type"] = "text/plain"
    return response


def extract_nutrients(nutrients_data: List[Dict]) -> Dict[str, float]:
    """
    Extract relevant nutrients from the API response and convert to our format.
    Returns nutrients per 100g.

    Args:
        nutrients_data: List of nutrient dictionaries from USDA API

    Returns:
        Dictionary with our nutrient names as keys and values per 100g
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


def validate_input_parameters(data: Dict) -> Tuple[bool, List[str]]:
    """
    Validate input parameters for diet calculations.

    Args:
        data: Dictionary with user input

    Returns:
        Tuple of (is_valid, error_messages)
    """
    validation_errors = []

    age = int(data.get("age", 0))
    if age < AGE_MIN or age > AGE_MAX:
        validation_errors.append(f"Age must be between {AGE_MIN} and {AGE_MAX}")

    weight = int(data.get("weight", 0))
    if weight < WEIGHT_MIN or weight > WEIGHT_MAX:
        validation_errors.append(
            f"Weight must be between {WEIGHT_MIN} and {WEIGHT_MAX} kg"
        )

    if "height" in data:
        height = int(data.get("height", 0))
        if height < HEIGHT_MIN or height > HEIGHT_MAX:
            validation_errors.append(
                f"Height must be between {HEIGHT_MIN} and {HEIGHT_MAX} cm"
            )

    return len(validation_errors) == 0, validation_errors


def create_error_response(
    message: str, details: Optional[List[str]] = None, status_code: int = 400
):
    """
    Create a standardized error response.

    Args:
        message: Main error message
        details: List of detailed error messages
        status_code: HTTP status code

    Returns:
        Flask response with JSON and status code
    """
    response = {"error": message}
    if details:
        response["messages"] = "; ".join(details)
    return jsonify(response), status_code


@app.route("/api/search_food", methods=["POST"])
def search_food():
    """API endpoint to search for foods using the USDA API."""
    try:
        data = request.json
        if data is None:
            return create_error_response(
                "No JSON data provided or Content-Type not set to application/json"
            )

        search_term = data.get("query")
        api_key = data.get("api_key")

        if not search_term:
            return create_error_response("No search term provided")
        if not api_key:
            return create_error_response("No API key provided")

        params = {
            "api_key": api_key,
            "query": search_term,
            "dataType": "SR Legacy",
            "pageSize": 25,
            "requireAllWords": True,
        }

        app.logger.info(f"Searching for food: {search_term}")
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
        app.logger.error(f"API request failed: {str(e)}")
        return create_error_response("API request failed", status_code=500)
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return create_error_response("An internal error has occurred", status_code=500)


@app.route("/api/calculate", methods=["POST"])
def calculate():
    """Calculate nutritional requirements based on user parameters."""
    try:
        data = request.json
        app.logger.debug(f"Received calculation request with data: {data}")

        if data is None:
            return create_error_response(
                "No JSON data provided or Content-Type not set to application/json"
            )

        is_valid, validation_errors = validate_input_parameters(data)
        if not is_valid:
            return create_error_response("Validation failed", validation_errors)

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

        lower_bounds_dict = process_bounds_for_response(lower_bounds)
        upper_bounds_dict = process_bounds_for_response(upper_bounds)

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

        app.logger.debug(f"Calculation result: {result}")
        return jsonify(result)

    except KeyError as e:
        app.logger.error(f"Missing required field: {str(e)}")
        return create_error_response(f"A required field is missing: {str(e)}")
    except ValueError as e:
        app.logger.error(f"Invalid value: {str(e)}")
        return create_error_response(f"An invalid value was provided: {str(e)}")
    except Exception as e:
        app.logger.error(f"Error occurred: {str(e)}")
        return create_error_response(
            "An internal server error has occurred.", status_code=500
        )


def process_bounds_for_response(bounds: pd.Series) -> Dict[str, float]:
    """
    Process nutrient bounds for API response.

    Args:
        bounds: Pandas Series with nutrient bounds

    Returns:
        Dictionary with non-NA values converted to float
    """
    return {k: float(v) for k, v in bounds.to_dict().items() if pd.notna(v)}


def perform_feasibility_analysis(
    selected_foods: List[Dict],
    max_servings: List[float],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
    nutrient_goals: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Analyze whether the selected foods can meet nutrient requirements.

    Args:
        selected_foods: List of food dictionaries with nutrients
        max_servings: Maximum servings for each food
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients
        nutrient_goals: Target nutrient goals

    Returns:
        Dictionary with feasibility analysis results
    """
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

    def get_percentage_safely(item: Dict[str, Any], key: str) -> float:
        """Safely extract a percentage value from a dictionary with fallback to 0.0"""
        try:
            value = item.get(key, 0.0)
            if isinstance(value, (int, float)):
                return float(value)
            return 0.0
        except (ValueError, TypeError):
            return 0.0

    is_lower_bounds_feasible = len(lower_bound_issues) == 0
    is_upper_bounds_feasible = len(upper_bound_issues) == 0
    is_feasible = is_lower_bounds_feasible and is_upper_bounds_feasible

    lower_bound_issues.sort(
        key=lambda x: get_percentage_safely(x, "shortfallPercentage"), reverse=True
    )
    upper_bound_issues.sort(
        key=lambda x: get_percentage_safely(x, "excessPercentage"), reverse=True
    )

    return {
        "analysis": "Feasibility analysis completed",
        "isLowerBoundsFeasible": is_lower_bounds_feasible,
        "isUpperBoundsFeasible": is_upper_bounds_feasible,
        "isFeasible": is_feasible,
        "lowerBoundIssues": lower_bound_issues,
        "upperBoundIssues": upper_bound_issues,
    }


def solve_optimization_problem(
    selected_foods: List[Dict],
    costs: np.ndarray,
    max_servings: List[float],
    nutrient_goals: Dict[str, Any],
    lower_bounds: Union[pd.Series, Dict[str, float]],
    upper_bounds: Union[pd.Series, Dict[str, float]],
    overflow_percentages: Tuple[int, ...],
) -> Optional[Dict[str, Any]]:
    """
    Solve the diet optimization problem with the given parameters.

    Args:
        selected_foods: List of food dictionaries
        costs: Array of costs for each food
        max_servings: Maximum allowed servings for each food
        nutrient_goals: Target nutrient goals
        lower_bounds: Lower bounds for nutrients
        upper_bounds: Upper bounds for nutrients
        overflow_percentages: Overflow percentages for (protein, carbs, fats, fiber)

    Returns:
        Result dictionary if optimization succeeds, None otherwise
    """
    nutrients = ["protein", "carbohydrate", "fats", "fiber"]
    num_foods = len(selected_foods)

    prob = pulp.LpProblem("Diet_Optimization", pulp.LpMinimize)

    x = [pulp.LpVariable(f"x_{i}", 0, max_servings[i]) for i in range(num_foods)]
    y = [pulp.LpVariable(f"y_{i}", cat=pulp.LpBinary) for i in range(num_foods)]

    prob += pulp.lpSum([costs[i] * x[i] for i in range(num_foods)])

    for i in range(num_foods):
        prob += x[i] <= max_servings[i] * y[i]
        prob += x[i] >= y[i]

    for i, nutrient in enumerate(nutrients):
        nutrient_key = nutrient.lower().replace(" ", "_")
        if nutrient_key in nutrient_goals:
            goal = nutrient_goals[nutrient_key]
            values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
            overflow_factor = 1 + (overflow_percentages[i] / 100)

            prob += pulp.lpSum([values[j] * x[j] for j in range(num_foods)]) >= goal

            prob += pulp.lpSum([values[j] * x[j] for j in range(num_foods)]) <= int(
                goal * overflow_factor
            )

    if "saturated_fats" in nutrient_goals:
        sat_fat_goal = nutrient_goals["saturated_fats"]
        sat_fat_values = [
            food["nutrients"].get("saturated_fats", 0) for food in selected_foods
        ]
        prob += (
            pulp.lpSum([sat_fat_values[j] * x[j] for j in range(num_foods)])
            <= sat_fat_goal
        )

    for nutrient, _ in NUTRIENT_MAP.items():
        if nutrient not in nutrients:
            values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
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

        food_items = [food["description"] for food in selected_foods]
        total_cost = np.round(servings * costs, 1)

        nutrient_totals = {}
        for nutrient in NUTRIENT_MAP.keys():
            values = [food["nutrients"].get(nutrient, 0) for food in selected_foods]
            nutrient_totals[nutrient] = float(np.round(np.sum(servings * values), 1))

        overflow_by_nutrient = {
            nutrient: percent
            for nutrient, percent in zip(nutrients, overflow_percentages)
        }

        return {
            "food_items": food_items,
            "servings": servings.tolist(),
            "total_cost": total_cost.tolist(),
            "nutrient_totals": nutrient_totals,
            "total_cost_sum": float(np.sum(total_cost)),
            "overflow_by_nutrient": overflow_by_nutrient,
            "total_overflow": sum(overflow_percentages),
        }

    return None


@app.route("/api/optimize", methods=["POST"])
def optimize():
    """Optimize diet based on selected foods and nutrient goals."""
    try:
        data = request.json
        app.logger.debug("Received optimization request")

        if data is None:
            return create_error_response(
                "No JSON data provided or Content-Type not set to application/json"
            )

        nutrient_goals = data["nutrient_goals"]
        selected_foods_data = data["selected_foods"]
        age = int(data["age"])
        gender = data["gender"]
        smoking_status = data.get("smokingStatus", "no")
        default_max_serving = data.get("max_serving_size", DEFAULT_MAX_SERVING)

        if age < AGE_MIN or age > AGE_MAX:
            return create_error_response(f"Age must be between {AGE_MIN} and {AGE_MAX}")

        if not selected_foods_data:
            return create_error_response("No foods selected")

        costs = np.array([food["price"] for food in selected_foods_data])
        max_servings = np.array(
            [
                food.get("maxServing", default_max_serving) / food["servingSize"]
                for food in selected_foods_data
            ]
        )
        lower_bounds = None
        upper_bounds = None
        has_custom_bounds = False

        if (
            "lower_bounds" in nutrient_goals
            and nutrient_goals["lower_bounds"]
            and "upper_bounds" in nutrient_goals
            and nutrient_goals["upper_bounds"]
        ):
            lower_bounds, upper_bounds = nutrient_bounds(age, gender)
            if isinstance(lower_bounds, pd.Series):
                for k, v in nutrient_goals["lower_bounds"].items():
                    if k in lower_bounds:
                        lower_bounds[k] = v
            if isinstance(upper_bounds, pd.Series):
                for k, v in nutrient_goals["upper_bounds"].items():
                    if k in upper_bounds:
                        upper_bounds[k] = v
            has_custom_bounds = True
            app.logger.info("Using custom nutrient bounds from request")
        else:
            lower_bounds, upper_bounds = nutrient_bounds(age, gender)
            app.logger.info("Using default nutrient bounds")

        if smoking_status == "yes":
            vitamin_c_key = "Vitamin C (mg)"
            if vitamin_c_key in lower_bounds:
                if not has_custom_bounds:
                    lower_bounds[vitamin_c_key] = (
                        float(lower_bounds[vitamin_c_key]) + 35.0
                    )
                    app.logger.info(
                        f"Adjusted Vitamin C for smoking: {lower_bounds[vitamin_c_key]}"
                    )

        max_servings_list = [float(x) for x in max_servings]

        feasibility_analysis = perform_feasibility_analysis(
            selected_foods_data,
            max_servings_list,
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
            max_servings_list = [float(x) for x in max_servings]

            result = solve_optimization_problem(
                selected_foods_data,
                costs,
                max_servings_list,
                nutrient_goals,
                lower_bounds,
                upper_bounds,
                combo,
            )

            if result:
                result["using_custom_bounds"] = has_custom_bounds
                return jsonify({"success": True, "result": result})

        return jsonify(
            {
                "success": False,
                "message": "Optimization failed! No feasible solution found even with maximum allowed nutrient flexibility.",
                "feasibilityAnalysis": feasibility_analysis,
            }
        )

    except Exception as e:
        app.logger.error(f"Error occurred during optimization: {str(e)}", exc_info=True)
        return create_error_response(
            "An internal error has occurred. Please try again later.", status_code=500
        )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", DEFAULT_PORT))
    debug_mode = os.environ.get("FLASK_DEBUG", "False").lower() in ["true", "1"]
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
