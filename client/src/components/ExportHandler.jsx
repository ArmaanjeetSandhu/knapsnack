import { NUTRIENT_HEADERS, getNutrientKey } from "../lib/csvConstants";
import { calculateConsistentResults } from "../lib/resultsHelpers";

const handleExportCSV = (results, selectedFoods = []) => {
  const { items, totals } = calculateConsistentResults(results, selectedFoods);

  const headers = [
    "Food Item",
    "Serving Size (g)",
    "No. of Servings",
    "Total Serving (g)",
    "Cost",
    ...NUTRIENT_HEADERS,
  ];

  let csvContent = headers.join(",") + "\n";

  items.forEach((food) => {
    const row = [
      `"${food.food}"`,
      food.servingSize,
      food.servings,
      food.totalServing,
      food.cost.toFixed(2),
    ];

    headers.slice(5).forEach((header) => {
      const key = getNutrientKey(header);
      row.push(food.nutrients[key]?.toFixed(2) || "0.00");
    });

    csvContent += row.join(",") + "\n";
  });

  const footerTotals = ["Total"];
  const totalServingSize = "";
  const totalServings = "";
  const totalGrams = items.reduce((sum, food) => sum + food.totalServing, 0);

  footerTotals.push(
    totalServingSize,
    totalServings,
    totalGrams.toFixed(1),
    totals.cost.toFixed(2),
  );

  headers.slice(5).forEach((header) => {
    const key = getNutrientKey(header);
    const nutrientTotal = totals.nutrients[key] || 0;
    footerTotals.push(nutrientTotal.toFixed(2));
  });

  csvContent += footerTotals.join(",") + "\n";
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "diet_plan.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default handleExportCSV;
