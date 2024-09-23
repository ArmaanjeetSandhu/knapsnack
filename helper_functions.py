import pandas as pd


def input_validation(prompt, data_type):
    while True:
        try:
            return data_type(input(prompt))
        except ValueError:
            print(f"Invalid input. Please enter a valid {data_type.__name__}.")


def format_weight(weight):
    if weight < 1000:
        return f"{weight} g"
    else:
        return f"{weight / 1000} kg"


def create_nutrients_df():
    vitaminsRDA = pd.read_csv("nutrient-databases/vitamins-RDAs.csv").replace(
        "ND", None
    )
    vitaminsUL = pd.read_csv("nutrient-databases/vitamins-ULs.csv").replace("ND", None)
    elementsRDA = pd.read_csv("nutrient-databases/elements-RDAs.csv").replace(
        "ND", None
    )
    elementsUL = pd.read_csv("nutrient-databases/elements-ULs.csv").replace("ND", None)

    vitamins = pd.merge(vitaminsRDA, vitaminsUL, on="Life-Stage Group", how="outer")
    elements = pd.merge(elementsRDA, elementsUL, on="Life-Stage Group", how="outer")

    elementsToBeRemoved = [
        item
        for item in list(elementsUL.columns)
        if item not in list(elementsRDA.columns)
    ]
    elements.drop(columns=elementsToBeRemoved, inplace=True)

    vitaminsMap = {
        "Vitamin A (µg/d)_x": "VitA_RDA (µg/d)",
        "Vitamin C (mg/d)_x": "VitC_RDA (mg/d)",
        "Vitamin D (µg/d)_x": "VitD_RDA (µg/d)",
        "Vitamin E (mg/d)_x": "VitE_RDA (mg/d)",
        "Vitamin K (µg/d)": "VitK_RDA (µg/d)",
        "Thiamin (mg/d)": "Thiamin_RDA (mg/d)",
        "Riboflavin (mg/d)": "Riboflavin_RDA (mg/d)",
        "Niacin (mg/d)_x": "Niacin_RDA (mg/d)",
        "Vitamin B6 (mg/d)_x": "VitB6_RDA (mg/d)",
        "Folate (µg/d)_x": "Folate_RDA (µg/d)",
        "Vitamin B12 (µg/d)": "VitB12_RDA (µg/d)",
        "Vitamin A (µg/d)_y": "VitA_UL (µg/d)",
        "Vitamin C (mg/d)_y": "VitC_UL (mg/d)",
        "Vitamin D (µg/d)_y": "VitD_UL (µg/d)",
        "Vitamin E (mg/d)_y": "VitE_UL (µg/d)",
        "Vitamin K": "VitK_UL (µg/d)",
        "Thiamin": "Thiamin_UL (mg/d)",
        "Riboflavin": "Riboflavin_UL (mg/d)",
        "Niacin (mg/d)_y": "Niacin_UL (mg/d)",
        "Vitamin B6 (mg/d)_y": "VitB6_UL (mg/d)",
        "Folate (µg/d)_y": "Folate_UL (µg/d)",
        "Vitamin B12": "VitB12_UL (µg/d)",
    }
    vitamins.rename(columns=vitaminsMap, inplace=True)

    elementsMap = {
        "Calcium (mg/d)_x": "Calcium_RDA (mg/d)",
        "Chromium (µg/d)_x": "Chromium_RDA (µg/d)",
        "Copper (µg/d)_x": "Copper_RDA (µg/d)",
        "Iodine (µg/d)_x": "Iodine_RDA (µg/d)",
        "Iron (mg/d)_x": "Iron_RDA (mg/d)",
        "Magnesium (mg/d)_x": "Magnesium_RDA (mg/d)",
        "Manganese (mg/d)_x": "Manganese_RDA (mg/d)",
        "Phosphorus (mg/d)_x": "Phosphorus_RDA (mg/d)",
        "Selenium (µg/d)_x": "Selenium_RDA (µg/d)",
        "Zinc (mg/d)_x": "Zinc_RDA (mg/d)",
        "Potassium (mg/d)_x": "Potassium_RDA (mg/d)",
        "Sodium (mg/d)_x": "Sodium_RDA (mg/d)",
        "Chloride (g/d)_x": "Chloride_RDA (g/d)",
        "Calcium (mg/d)_y": "Calcium_UL (mg/d)",
        "Chromium (µg/d)_y": "Chromium_UL (µg/d)",
        "Copper (µg/d)_y": "Copper_UL (µg/d)",
        "Iodine (µg/d)_y": "Iodine_UL (µg/d)",
        "Iron (mg/d)_y": "Iron_UL (mg/d)",
        "Magnesium (mg/d)_y": "Magnesium_UL (mg/d)",
        "Manganese (mg/d)_y": "Manganese_UL (mg/d)",
        "Phosphorus (mg/d)_y": "Phosphorus_UL (mg/d)",
        "Potassium (mg/d)_y": "Potassium_UL (mg/d)",
        "Selenium (µg/d)_y": "Selenium_UL (µg/d)",
        "Zinc (mg/d)_y": "Zinc_UL (µg/d)",
        "Sodium (mg/d)_y": "Sodium_UL (mg/d)",
        "Chloride (g/d)_y": "Chloride_UL (g/d)",
    }
    elements.rename(columns=elementsMap, inplace=True)

    df = pd.merge(vitamins, elements, on="Life-Stage Group", how="outer")

    columnsToBeRemoved = [
        col
        for col in df.columns
        if any(
            x in col.lower()
            for x in ["biotin", "molybdenum", "fluoride", "pantothenic acid", "choline"]
        )
    ]
    df.drop(columns=columnsToBeRemoved, inplace=True)

    rowsToBeRemoved = [
        "Infants",
        "Children",
        "Lactation",
        "Pregnancy",
        "Males 9-13 y",
        "Males 14-18 y",
        "Females 9-13 y",
        "Females 14-18 y",
    ]
    df = df[~df["Life-Stage Group"].str.contains("|".join(rowsToBeRemoved))]

    return df
