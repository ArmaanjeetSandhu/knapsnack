export const NUTRIENT_HEADERS = [
  "Water (mL)",
  "Carbohydrate (g)",
  "Fibre (g)",
  "Fats (g)",
  "Saturated Fats (g)",
  "Protein (g)",
  "Thiamin (Vitamin B1) (mg)",
  "Riboflavin (Vitamin B2) (mg)",
  "Niacin (Vitamin B3) (mg)",
  "Pantothenic Acid (Vitamin B5) (mg)",
  "Vitamin B6 (mg)",
  "Choline (mg)",
  "Folate (Vitamin B9) (mcg)",
  "Vitamin A (mcg)",
  "Vitamin C (mg)",
  "Vitamin E (mg)",
  "Vitamin K (mcg)",
  "Calcium (mg)",
  "Iron (mg)",
  "Magnesium (mg)",
  "Manganese (mg)",
  "Phosphorus (mg)",
  "Potassium (mg)",
  "Selenium (mcg)",
  "Sodium (mg)",
  "Zinc (mg)",
] as const;

export type NutrientHeader = (typeof NUTRIENT_HEADERS)[number];

const NUTRIENT_KEY_MAP: Partial<Record<string, string>> = {
  "Carbohydrate (g)": "carbohydrate",
  "Fibre (g)": "fibre",
  "Fats (g)": "fats",
  "Saturated Fats (g)": "saturated_fats",
  "Protein (g)": "protein",
  "Thiamin (Vitamin B1) (mg)": "Thiamin (mg)",
  "Riboflavin (Vitamin B2) (mg)": "Riboflavin (mg)",
  "Niacin (Vitamin B3) (mg)": "Niacin (mg)",
  "Pantothenic Acid (Vitamin B5) (mg)": "Pantothenic Acid (mg)",
  "Folate (Vitamin B9) (mcg)": "Folate (µg)",
  "Vitamin A (mcg)": "Vitamin A (µg)",
  "Vitamin K (mcg)": "Vitamin K (µg)",
  "Selenium (mcg)": "Selenium (µg)",
};

export const getNutrientKey = (header: string): string =>
  NUTRIENT_KEY_MAP[header] ?? header;
