import os
import sys

import pandas as pd
import pytest

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


@pytest.fixture
def app_client():
    """Test client for the Flask app"""
    from server.app import app

    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def mock_nutrient_data():
    """Mock data for nutrient calculations"""
    vitamins_rda = pd.DataFrame(
        {
            "Life-Stage Group": ["Males 31-50 y", "Females 31-50 y"],
            "Vitamin A (µg)": [900, 700],
            "Vitamin C (mg)": [90, 75],
            "Vitamin D (µg)": [15, 15],
            "Vitamin E (mg)": [15, 15],
            "Vitamin K (µg)": [120, 90],
            "Thiamin (mg)": [1.2, 1.1],
            "Riboflavin (mg)": [1.3, 1.1],
            "Niacin (mg)": [16, 14],
            "Vitamin B6 (mg)": [1.3, 1.3],
            "Folate (µg)": [400, 400],
            "Vitamin B12 (µg)": [2.4, 2.4],
            "Pantothenic Acid (mg)": [5, 5],
            "Choline (mg)": [550, 425],
        }
    )

    vitamins_ul = pd.DataFrame(
        {
            "Life-Stage Group": ["Males 31-50 y", "Females 31-50 y"],
            "Vitamin A (µg)": [3000, 3000],
            "Vitamin C (mg)": [2000, 2000],
            "Vitamin D (µg)": [100, 100],
            "Vitamin E (mg)": [1000, 1000],
            "Niacin (mg)": [35, 35],
            "Vitamin B6 (mg)": [100, 100],
            "Folate (µg)": [1000, 1000],
            "Choline (mg)": [3500, 3500],
        }
    )

    elements_rda = pd.DataFrame(
        {
            "Life-Stage Group": ["Males 31-50 y", "Females 31-50 y"],
            "Calcium (mg)": [1000, 1000],
            "Copper (µg)": [900, 900],
            "Iron (mg)": [8, 18],
            "Magnesium (mg)": [420, 320],
            "Manganese (mg)": [2.3, 1.8],
            "Phosphorus (mg)": [700, 700],
            "Selenium (µg)": [55, 55],
            "Zinc (mg)": [11, 8],
            "Potassium (mg)": [3400, 2600],
            "Sodium (mg)": [1500, 1500],
        }
    )

    elements_ul = pd.DataFrame(
        {
            "Life-Stage Group": ["Males 31-50 y", "Females 31-50 y"],
            "Calcium (mg)": [2500, 2500],
            "Copper (µg)": [10000, 10000],
            "Iron (mg)": [45, 45],
            "Magnesium (mg)": [350, 350],
            "Manganese (mg)": [11, 11],
            "Phosphorus (mg)": [4000, 4000],
            "Selenium (µg)": [400, 400],
            "Zinc (mg)": [40, 40],
            "Sodium (mg)": [2300, 2300],
        }
    )

    return {
        "vitamins_rda": vitamins_rda,
        "vitamins_ul": vitamins_ul,
        "elements_rda": elements_rda,
        "elements_ul": elements_ul,
    }


@pytest.fixture
def sample_food_data():
    """Sample food data for testing"""
    return [
        {
            "fdcId": "1234",
            "description": "Chicken Breast",
            "price": 10.0,
            "servingSize": 100.0,
            "maxServing": 500.0,
            "nutrients": {
                "protein": 25.0,
                "carbohydrate": 0.0,
                "fats": 3.0,
                "saturated_fats": 0.9,
                "fiber": 0.0,
                "Vitamin A (µg)": 30.0,
                "Vitamin C (mg)": 0.0,
                "Calcium (mg)": 15.0,
                "Iron (mg)": 1.0,
            },
        },
        {
            "fdcId": "5678",
            "description": "Brown Rice",
            "price": 5.0,
            "servingSize": 100.0,
            "maxServing": 500.0,
            "nutrients": {
                "protein": 2.5,
                "carbohydrate": 25.0,
                "fats": 0.8,
                "saturated_fats": 0.2,
                "fiber": 1.8,
                "Vitamin A (µg)": 0.0,
                "Vitamin C (mg)": 0.0,
                "Calcium (mg)": 10.0,
                "Iron (mg)": 0.5,
            },
        },
        {
            "fdcId": "9012",
            "description": "Spinach",
            "price": 3.0,
            "servingSize": 100.0,
            "maxServing": 500.0,
            "nutrients": {
                "protein": 2.9,
                "carbohydrate": 3.6,
                "fats": 0.4,
                "saturated_fats": 0.1,
                "fiber": 2.2,
                "Vitamin A (µg)": 469.0,
                "Vitamin C (mg)": 28.0,
                "Calcium (mg)": 99.0,
                "Iron (mg)": 2.7,
            },
        },
        {
            "fdcId": "3456",
            "description": "Apple",
            "price": 2.0,
            "servingSize": 100.0,
            "maxServing": 500.0,
            "nutrients": {
                "protein": 0.3,
                "carbohydrate": 13.8,
                "fats": 0.2,
                "saturated_fats": 0.0,
                "fiber": 2.4,
                "Vitamin A (µg)": 3.0,
                "Vitamin C (mg)": 4.6,
                "Calcium (mg)": 6.0,
                "Iron (mg)": 0.1,
            },
        },
    ]


@pytest.fixture
def mock_usda_api_response():
    """Mock response from USDA API"""
    return {
        "foods": [
            {
                "fdcId": 123456,
                "description": "Chicken, broilers or fryers, breast, meat only, raw",
                "foodNutrients": [
                    {"nutrientName": "Protein", "value": 23.1},
                    {"nutrientName": "Total lipid (fat)", "value": 1.2},
                    {"nutrientName": "Carbohydrate, by difference", "value": 0.0},
                    {"nutrientName": "Fiber, total dietary", "value": 0.0},
                    {"nutrientName": "Calcium, Ca", "value": 15.0},
                    {"nutrientName": "Iron, Fe", "value": 1.0},
                    {"nutrientName": "Vitamin A, RAE", "value": 30.0},
                    {"nutrientName": "Vitamin C, total ascorbic acid", "value": 0.0},
                ],
            },
            {
                "fdcId": 789012,
                "description": "Chicken, broilers or fryers, thigh, meat only, raw",
                "foodNutrients": [
                    {"nutrientName": "Protein", "value": 20.1},
                    {"nutrientName": "Total lipid (fat)", "value": 4.3},
                    {"nutrientName": "Carbohydrate, by difference", "value": 0.0},
                    {"nutrientName": "Fiber, total dietary", "value": 0.0},
                    {"nutrientName": "Calcium, Ca", "value": 12.0},
                    {"nutrientName": "Iron, Fe", "value": 1.1},
                    {"nutrientName": "Vitamin A, RAE", "value": 25.0},
                    {"nutrientName": "Vitamin C, total ascorbic acid", "value": 0.0},
                ],
            },
        ]
    }
