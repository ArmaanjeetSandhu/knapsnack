"""
Configuration settings and constants for the diet optimization service.
"""

import os

DEFAULT_PORT = 5000
API_ENDPOINT = "https://api.nal.usda.gov/fdc/v1/foods/search"
DEFAULT_MAX_SERVING = 500

AGE_MIN = 19
AGE_MAX = 100
WEIGHT_MIN = 30
WEIGHT_MAX = 200
HEIGHT_MIN = 135
HEIGHT_MAX = 200

PROTEIN_CALORIES_PER_GRAM = CARB_CALORIES_PER_GRAM = 4
FAT_CALORIES_PER_GRAM = 9
FIBER_RATIO = 0.014
SATURATED_FAT_RATIO = 0.10

NUTRIENT_DB_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "nutrient-databases")
)

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

EXCLUDED_AGE_GROUPS = [
    "Infants",
    "Children",
    "Lactation",
    "Pregnancy",
    "Males 9-13 y",
    "Males 14-18 y",
    "Females 9-13 y",
    "Females 14-18 y",
]

VITAMINS_RDA_EXCLUDE = ["Biotin (µg)", "Vitamin D (µg)", "Vitamin B12 (µg)"]
VITAMINS_UL_EXCLUDE = ["Vitamin D (µg)"]
ELEMENTS_RDA_EXCLUDE = [
    "Chromium (µg)",
    "Molybdenum (µg)",
    "Chloride (g)",
    "Fluoride (mg)",
    "Iodine (µg)",
    "Copper (µg)",
]
ELEMENTS_UL_EXCLUDE = [
    "Boron (mg)",
    "Molybdenum (µg)",
    "Chloride (g)",
    "Fluoride (mg)",
    "Iodine (µg)",
    "Nickel (mg)",
    "Vanadium (µg)",
    "Copper (µg)",
]

SECURITY_HEADERS = {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
}

CONTENT_SECURITY_POLICY = (
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

CACHE_CONTROL_SETTINGS = {
    "text/html": "public, max-age=300",
    "application/json": "public, max-age=60",
    "text/css": "public, max-age=31536000, immutable",
    "application/javascript": "public, max-age=31536000, immutable",
    "image/svg+xml": "public, max-age=31536000, immutable",
    "image/jpeg": "public, max-age=31536000, immutable",
    "image/png": "public, max-age=31536000, immutable",
    "image/gif": "public, max-age=31536000, immutable",
    "image/webp": "public, max-age=31536000, immutable",
    "video/mp4": "public, max-age=31536000, immutable",
    "default": "public, max-age=86400",
}
