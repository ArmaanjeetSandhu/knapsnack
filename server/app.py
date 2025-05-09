"""
Main Flask application for diet optimization service.
"""

import logging
import mimetypes
import os
from datetime import datetime, timedelta

import numpy as np
import requests
from flask import Flask, jsonify, make_response, request, send_file, send_from_directory
from flask_cors import CORS

from server.config import (
    AGE_MAX,
    AGE_MIN,
    API_ENDPOINT,
    CACHE_CONTROL_SETTINGS,
    CONTENT_SECURITY_POLICY,
    DEFAULT_MAX_SERVING,
    DEFAULT_PORT,
    HEIGHT_MAX,
    HEIGHT_MIN,
    SECURITY_HEADERS,
    WEIGHT_MAX,
    WEIGHT_MIN,
)
from server.data.nutrient_data import get_nutrient_bounds
from server.services.calculation import (
    adjust_nutrient_bounds,
    calculate_nutrition_requirements,
    validate_input_parameters,
)
from server.services.food_service import search_foods
from server.services.optimization import analyze_feasibility, optimize_diet
from server.utils.response_utils import create_error_response

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


@app.after_request
def add_security_headers(response):
    """Add security headers to all responses"""
    for header, value in SECURITY_HEADERS.items():
        response.headers[header] = value

    response.headers["Content-Security-Policy"] = CONTENT_SECURITY_POLICY

    if "Cache-Control" not in response.headers:
        cache_setting = CACHE_CONTROL_SETTINGS.get(
            response.mimetype, CACHE_CONTROL_SETTINGS["default"]
        )
        response.headers["Cache-Control"] = cache_setting

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
    """.strip()
    )
    response.headers["Content-Type"] = "text/plain"
    return response


@app.route("/api/search_food", methods=["POST"])
def search_food_api():
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

        app.logger.info(f"Searching for food: {search_term}")
        search_results = search_foods(api_key, search_term, API_ENDPOINT)

        return jsonify({"results": search_results})
    except requests.exceptions.RequestException as e:
        app.logger.error(f"API request failed: {str(e)}")
        return create_error_response("API request failed", status_code=500)
    except Exception as e:
        app.logger.error(f"An error occurred: {str(e)}")
        return create_error_response("An internal error has occurred", status_code=500)


@app.route("/api/calculate", methods=["POST"])
def calculate_api():
    """Calculate nutritional requirements based on user parameters."""
    try:
        data = request.json
        app.logger.debug(f"Received calculation request with data: {data}")

        if data is None:
            return create_error_response(
                "No JSON data provided or Content-Type not set to application/json"
            )

        is_valid, validation_errors = validate_input_parameters(
            data, AGE_MIN, AGE_MAX, WEIGHT_MIN, WEIGHT_MAX, HEIGHT_MIN, HEIGHT_MAX
        )
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

        result = calculate_nutrition_requirements(
            gender,
            weight,
            height,
            age,
            pratio,
            cratio,
            fratio,
            activity_multiplier,
            percentage,
            smoking_status,
        )

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


@app.route("/api/optimize", methods=["POST"])
def optimize_api():
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

        has_custom_bounds = False
        lower_bounds, upper_bounds = get_nutrient_bounds(age, gender)

        if (
            "lower_bounds" in nutrient_goals
            and nutrient_goals["lower_bounds"]
            and "upper_bounds" in nutrient_goals
            and nutrient_goals["upper_bounds"]
        ):
            has_custom_bounds = True
            lower_bounds, upper_bounds = adjust_nutrient_bounds(
                lower_bounds,
                upper_bounds,
                nutrient_goals["lower_bounds"],
                nutrient_goals["upper_bounds"],
                smoking_status,
            )
            app.logger.info("Using custom nutrient bounds from request")
        else:
            if smoking_status == "yes":
                lower_bounds, upper_bounds = adjust_nutrient_bounds(
                    lower_bounds, upper_bounds, smoking_status=smoking_status
                )
            app.logger.info("Using default nutrient bounds")

        max_servings_list = [float(x) for x in max_servings]

        feasibility_analysis = analyze_feasibility(
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

        result = optimize_diet(
            selected_foods_data,
            costs,
            max_servings_list,
            nutrient_goals,
            lower_bounds,
            upper_bounds,
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
