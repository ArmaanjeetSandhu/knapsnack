import { NUTRIENT_HEADERS, getNutrientKey } from "../lib/csvConstants";
import { downloadCsv } from "../lib/downloadCsv";
import { calculateConsistentResults } from "../lib/resultsHelpers";

import type { OptimisationApiResult, FoodItem } from "../services/api";

const handleExportCSV = (
  results: OptimisationApiResult,
  selectedFoods: FoodItem[] = [],
): void => {
  const { items, totals } = calculateConsistentResults(results, selectedFoods);

  const headers = [
    "Food Item",
    "Serving Size (g)",
    "No. of Servings",
    "Total Serving (g)",
    "Cost",
    ...NUTRIENT_HEADERS,
  ];

  const rows = items.map((food) => {
    const row: (string | number)[] = [
      food.food,
      food.servingSize,
      food.servings,
      food.totalServing,
      food.cost.toFixed(2),
    ];
    headers.slice(5).forEach((header) => {
      const key = getNutrientKey(header);
      row.push(food.nutrients[key]?.toFixed(2) ?? "0.00");
    });
    return row;
  });

  const totalGrams = items.reduce((sum, food) => sum + food.totalServing, 0);
  const footerTotals: (string | number)[] = [
    "Total",
    "",
    "",
    totalGrams.toFixed(1),
    totals.cost.toFixed(2),
  ];
  headers.slice(5).forEach((header) => {
    const key = getNutrientKey(header);
    footerTotals.push((totals.nutrients[key] ?? 0).toFixed(2));
  });
  rows.push(footerTotals);

  downloadCsv("diet_plan.csv", headers, rows);
};

export default handleExportCSV;
