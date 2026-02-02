export const adjustNutrientsForServingSize = (nutrients, servingSize) => {
  const adjustedNutrients = {};
  for (const [nutrient, value] of Object.entries(nutrients)) {
    adjustedNutrients[nutrient] = (value * servingSize) / 100;
  }
  return adjustedNutrients;
};

export const prepareOptimizationPayload = (foods, nutrientGoals, userInfo) => {
  const foodsData = foods.map((food) => ({
    fdcId: food.fdcId,
    description: food.description,
    price: parseFloat(food.price),
    servingSize: parseFloat(food.servingSize),
    maxServing: parseFloat(food.maxServing),
    requires_integer_servings: !!food.integerServings,
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
    "Food Item",
    "Price Per Serving",
    "Serving Size (g)",
    "Max Serving (g)",
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
  ];

  const getNutrientKey = (header) => {
    const mapping = {
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
    return mapping[header] || header;
  };

  let csvContent = headers.join(",") + "\n";
  foods.forEach((food) => {
    const adjustedNutrients = adjustNutrientsForServingSize(
      food.nutrients,
      parseFloat(food.servingSize) || 100,
    );
    const row = [
      food.integerServings ? "Yes" : "No",
      `"${food.description}"`,
      food.price || "",
      food.servingSize || "",
      food.maxServing || "",
    ];

    headers.slice(5).forEach((header) => {
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
