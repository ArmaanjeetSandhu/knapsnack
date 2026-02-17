import { NUTRIENT_HEADERS, getNutrientKey } from "./csvConstants";

export const adjustNutrientsForServingSize = (nutrients, servingSize) => {
  const adjustedNutrients = {};
  for (const [nutrient, value] of Object.entries(nutrients)) {
    adjustedNutrients[nutrient] = (value * servingSize) / 100;
  }
  return adjustedNutrients;
};

export const prepareOptimisationPayload = (foods, nutrientGoals, userInfo) => {
  const foodsData = foods.map((food) => ({
    fdcId: food.fdcId,
    description: food.description,
    price: parseFloat(food.price),
    servingSize: parseFloat(food.servingSize),
    maxServing: parseFloat(food.maxServing),
    requires_integer_servings: !!food.integerServings,
    must_include: !!food.mustInclude,
    nutrients: adjustNutrientsForServingSize(
      food.nutrients,
      parseFloat(food.servingSize),
    ),
  }));

  return {
    selected_foods: foodsData,
    nutrient_goals: nutrientGoals,
    age: parseInt(userInfo.age),
    gender: userInfo.gender,
    smokingStatus: userInfo.smokingStatus,
  };
};

export const exportSelectedFoodsToCSV = (foods) => {
  const headers = [
    "Discrete Servings",
    "Must Include",
    "Food Item",
    "Price Per Serving",
    "Serving Size (g)",
    "Max Serving (g)",
    ...NUTRIENT_HEADERS,
  ];

  let csvContent = headers.join(",") + "\n";
  foods.forEach((food) => {
    const adjustedNutrients = adjustNutrientsForServingSize(
      food.nutrients,
      parseFloat(food.servingSize) || 100,
    );
    const row = [
      food.integerServings ? "Yes" : "No",
      food.mustInclude ? "Yes" : "No",
      `"${food.description}"`,
      food.price || "",
      food.servingSize || "",
      food.maxServing || "",
    ];

    headers.slice(6).forEach((header) => {
      const key = getNutrientKey(header);
      row.push(adjustedNutrients[key]?.toFixed(2) || "");
    });

    csvContent += row.join(",") + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "selected_foods.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
