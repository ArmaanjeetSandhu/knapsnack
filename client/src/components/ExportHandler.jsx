import { NUTRIENT_HEADERS, getNutrientKey } from "../lib/csvConstants";

const handleExportCSV = (results, selectedFoods = []) => {
  const headers = [
    "Food Item",
    "Serving Size (g)",
    "No. of Servings",
    "Total Serving (g)",
    "Cost",
    ...NUTRIENT_HEADERS,
  ];

  let csvContent = headers.join(",") + "\n";
  const foodData = results.food_items
    .map((foodName, index) => {
      const servings = results.servings[index];
      if (servings <= 0) return null;
      const food = selectedFoods.find((f) => f.description === foodName);
      if (!food) return null;

      const servingSize = parseFloat(food.servingSize) || 100;
      const totalServing = servings * servingSize;
      const cost = results.total_cost[index];
      const nutrients = Object.entries(food.nutrients).reduce(
        (acc, [key, value]) => {
          acc[key] = (value * totalServing) / 100;
          return acc;
        },
        {},
      );
      return {
        name: foodName,
        servingSize,
        servings,
        totalServing,
        cost,
        nutrients,
      };
    })
    .filter((item) => item !== null);

  foodData.forEach((food) => {
    const row = [
      `"${food.name}"`,
      food.servingSize.toFixed(1),
      food.servings.toFixed(1),
      food.totalServing.toFixed(1),
      food.cost.toFixed(2),
    ];

    headers.slice(5).forEach((header) => {
      const key = getNutrientKey(header);
      row.push(food.nutrients[key]?.toFixed(2) || "0");
    });

    csvContent += row.join(",") + "\n";
  });

  const totals = ["Total"];
  const totalServingSize = "";
  const totalServings = "";
  const totalGrams = foodData.reduce((sum, food) => sum + food.totalServing, 0);
  totals.push(
    totalServingSize,
    totalServings,
    totalGrams.toFixed(1),
    results.total_cost_sum.toFixed(2),
  );

  headers.slice(5).forEach((header) => {
    const key = getNutrientKey(header);
    const nutrientTotal = results.nutrient_totals[key] || 0;
    totals.push(nutrientTotal.toFixed(2));
  });

  csvContent += totals.join(",") + "\n";
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
