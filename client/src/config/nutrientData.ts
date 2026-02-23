export type NutrientUnit = "mg" | "µg" | "mL" | "g" | "kcal";

export interface NutrientConfig {
  name: string;
  key: string;
  unit: NutrientUnit;
}

export const VITAMINS_CONFIG: NutrientConfig[] = [
  { name: "Vitamin A", key: "Vitamin A (µg)", unit: "µg" },
  { name: "Vitamin C", key: "Vitamin C (mg)", unit: "mg" },
  { name: "Vitamin E", key: "Vitamin E (mg)", unit: "mg" },
  { name: "Vitamin K", key: "Vitamin K (µg)", unit: "µg" },
  { name: "Thiamin (Vitamin B₁)", key: "Thiamin (mg)", unit: "mg" },
  { name: "Riboflavin (Vitamin B₂)", key: "Riboflavin (mg)", unit: "mg" },
  { name: "Niacin (Vitamin B₃)", key: "Niacin (mg)", unit: "mg" },
  { name: "Vitamin B₆", key: "Vitamin B6 (mg)", unit: "mg" },
  { name: "Folate (Vitamin B₉)", key: "Folate (µg)", unit: "µg" },
  {
    name: "Pantothenic Acid (Vitamin B₅)",
    key: "Pantothenic Acid (mg)",
    unit: "mg",
  },
];

export const MINERALS_CONFIG: NutrientConfig[] = [
  { name: "Calcium", key: "Calcium (mg)", unit: "mg" },
  { name: "Iron", key: "Iron (mg)", unit: "mg" },
  { name: "Magnesium", key: "Magnesium (mg)", unit: "mg" },
  { name: "Manganese", key: "Manganese (mg)", unit: "mg" },
  { name: "Phosphorus", key: "Phosphorus (mg)", unit: "mg" },
  { name: "Selenium", key: "Selenium (µg)", unit: "µg" },
  { name: "Zinc", key: "Zinc (mg)", unit: "mg" },
  { name: "Potassium", key: "Potassium (mg)", unit: "mg" },
  { name: "Sodium", key: "Sodium (mg)", unit: "mg" },
];

export const OTHERS_CONFIG: NutrientConfig[] = [
  { name: "Choline", key: "Choline (mg)", unit: "mg" },
];

export const HYDRATION_CONFIG: NutrientConfig[] = [
  { name: "Water", key: "Water (mL)", unit: "mL" },
];

export const ALL_NUTRIENTS_CONFIG: NutrientConfig[] = [
  ...VITAMINS_CONFIG,
  ...MINERALS_CONFIG,
  ...OTHERS_CONFIG,
  ...HYDRATION_CONFIG,
];
