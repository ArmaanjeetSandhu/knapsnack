const handleExportCSV = (results, selectedFoods = []) => {
  const headers = [
    "Food Item",
    "Serving Size (g)",
    "No. of Servings",
    "Total Serving (g)",
    "Cost (₹)",
    "Vitamin A (µg)",
    "Vitamin C (mg)",
    "Vitamin E (mg)",
    "Vitamin K (µg)",
    "Thiamin (mg)",
    "Riboflavin (mg)",
    "Niacin (mg)",
    "Vitamin B6 (mg)",
    "Folate (µg)",
    "Calcium (mg)",
    "Carbohydrate (g)",
    "Choline (mg)",
    "Protein (g)",
    "Fats (g)",
    "Saturated Fats (g)",
    "Fiber (g)",
    "Iron (mg)",
    "Magnesium (mg)",
    "Manganese (mg)",
    "Phosphorus (mg)",
    "Selenium (µg)",
    "Zinc (mg)",
    "Potassium (mg)",
    "Sodium (mg)",
    "Pantothenic Acid (mg)",
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
        {}
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
      food.nutrients["Vitamin A (µg)"]?.toFixed(2) || "0",
      food.nutrients["Vitamin C (mg)"]?.toFixed(2) || "0",
      food.nutrients["Vitamin E (mg)"]?.toFixed(2) || "0",
      food.nutrients["Vitamin K (µg)"]?.toFixed(2) || "0",
      food.nutrients["Thiamin (mg)"]?.toFixed(2) || "0",
      food.nutrients["Riboflavin (mg)"]?.toFixed(2) || "0",
      food.nutrients["Niacin (mg)"]?.toFixed(2) || "0",
      food.nutrients["Vitamin B6 (mg)"]?.toFixed(2) || "0",
      food.nutrients["Folate (µg)"]?.toFixed(2) || "0",
      food.nutrients["Calcium (mg)"]?.toFixed(2) || "0",
      food.nutrients["carbohydrate"]?.toFixed(2) || "0",
      food.nutrients["Choline (mg)"]?.toFixed(2) || "0",
      food.nutrients["protein"]?.toFixed(2) || "0",
      food.nutrients["fats"]?.toFixed(2) || "0",
      food.nutrients["saturated_fats"]?.toFixed(2) || "0",
      food.nutrients["fiber"]?.toFixed(2) || "0",
      food.nutrients["Iron (mg)"]?.toFixed(2) || "0",
      food.nutrients["Magnesium (mg)"]?.toFixed(2) || "0",
      food.nutrients["Manganese (mg)"]?.toFixed(2) || "0",
      food.nutrients["Phosphorus (mg)"]?.toFixed(2) || "0",
      food.nutrients["Selenium (µg)"]?.toFixed(2) || "0",
      food.nutrients["Zinc (mg)"]?.toFixed(2) || "0",
      food.nutrients["Potassium (mg)"]?.toFixed(2) || "0",
      food.nutrients["Sodium (mg)"]?.toFixed(2) || "0",
      food.nutrients["Pantothenic Acid (mg)"]?.toFixed(2) || "0",
    ];
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
    results.total_cost_sum.toFixed(2)
  );
  headers.slice(5).forEach((header) => {
    const nutrientTotal = results.nutrient_totals[header] || 0;
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
