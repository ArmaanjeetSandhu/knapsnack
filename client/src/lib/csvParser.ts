import type { ParseResult } from "papaparse";
import type { FoodItem, NutrientMap } from "../services/api";

type RawCsvRow = Record<string, string | undefined>;

export interface CsvParseSuccess {
  success: true;
  data: FoodItem[];
}

export interface CsvParseFailure {
  success: false;
  error: string;
}

export type CsvParseResult = CsvParseSuccess | CsvParseFailure;

const num = (value: string | undefined): number => {
  if (value === undefined || value === "") return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

const firstDefined = (row: RawCsvRow, ...keys: string[]): string | undefined =>
  keys.find((k) => row[k] !== undefined && row[k] !== "");

export const processCSVData = (
  results: ParseResult<RawCsvRow>,
): CsvParseResult => {
  if (results.errors.length > 0) {
    return {
      success: false,
      error:
        "Error parsing CSV file. Please ensure the file format is correct.",
    };
  }

  try {
    const validRows = results.data.filter(
      (row) => row["Food Item"] && typeof row["Food Item"] === "string",
    );

    if (results.data.length > 0 && validRows.length === 0)
      throw new Error("Missing required 'Food Item' column");

    const importedFoods: FoodItem[] = validRows.map((row, index) => {
      const servingSize = num(row["Serving Size (g)"]) || 100;
      const norm = (key: string): number => (num(row[key]) * 100) / servingSize;
      const normFirst = (...keys: string[]): number => {
        const key = firstDefined(row, ...keys);
        return key ? norm(key) : 0;
      };

      const nutrients: NutrientMap = {
        "Vitamin A (µg)": normFirst("Vitamin A (mcg)", "Vitamin A (µg)"),
        "Vitamin C (mg)": norm("Vitamin C (mg)"),
        "Vitamin E (mg)": norm("Vitamin E (mg)"),
        "Vitamin K (µg)": normFirst("Vitamin K (mcg)", "Vitamin K (µg)"),
        "Thiamin (mg)": normFirst(
          "Thiamin (Vitamin B1) (mg)",
          "Thiamin (Vitamin B₁) (mg)",
          "Thiamin (mg)",
        ),
        "Riboflavin (mg)": normFirst(
          "Riboflavin (Vitamin B2) (mg)",
          "Riboflavin (Vitamin B₂) (mg)",
          "Riboflavin (mg)",
        ),
        "Niacin (mg)": normFirst(
          "Niacin (Vitamin B3) (mg)",
          "Niacin (Vitamin B₃) (mg)",
          "Niacin (mg)",
        ),
        "Vitamin B6 (mg)": norm("Vitamin B6 (mg)"),
        "Folate (µg)": normFirst(
          "Folate (Vitamin B9) (mcg)",
          "Folate (Vitamin B₉) (µg)",
          "Folate (µg)",
        ),
        "Calcium (mg)": norm("Calcium (mg)"),
        carbohydrate: norm("Carbohydrate (g)"),
        "Choline (mg)": norm("Choline (mg)"),
        protein: norm("Protein (g)"),
        fats: norm("Fats (g)"),
        saturated_fats: norm("Saturated Fats (g)"),
        fibre: norm("Fibre (g)"),
        "Iron (mg)": norm("Iron (mg)"),
        "Magnesium (mg)": norm("Magnesium (mg)"),
        "Manganese (mg)": norm("Manganese (mg)"),
        "Phosphorus (mg)": norm("Phosphorus (mg)"),
        "Selenium (µg)": normFirst("Selenium (mcg)", "Selenium (µg)"),
        "Zinc (mg)": norm("Zinc (mg)"),
        "Potassium (mg)": norm("Potassium (mg)"),
        "Sodium (mg)": norm("Sodium (mg)"),
        "Pantothenic Acid (mg)": normFirst(
          "Pantothenic Acid (Vitamin B5) (mg)",
          "Pantothenic Acid (Vitamin B₅) (mg)",
          "Pantothenic Acid (mg)",
        ),
        "Water (mL)": norm("Water (mL)"),
      };

      return {
        fdcId: row["FDC ID"] ?? `imported-${Date.now()}-${index}`,
        description: row["Food Item"] as string,
        nutrients,
        servingSize,
        ...(row["Price Per Serving"] !== undefined && {
          price: row["Price Per Serving"],
        }),
        ...(row["Max Serving (g)"] !== undefined && {
          maxServing: row["Max Serving (g)"],
        }),
        ...(row["Discrete Servings"] !== undefined && {
          integerServings: row["Discrete Servings"] === "Yes",
        }),
        ...(row["Must Include"] !== undefined && {
          mustInclude: row["Must Include"] === "Yes",
        }),
      };
    });

    return { success: true, data: importedFoods };
  } catch {
    return {
      success: false,
      error:
        "Invalid CSV format! Please ensure your file matches the format of a CSV exported from the 'Selected Foods' section.",
    };
  }
};
