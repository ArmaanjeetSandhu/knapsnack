import { NUTRIENT_HEADERS, getNutrientKey } from "./csvConstants";
import type { FoodItem, NutrientMap } from "../services/api";
import type { OptimisationRequestPayload } from "../services/api";

export type { FoodItem };

interface UserInfoForPayload {
  age: string | number;
  gender: string;
  smokingStatus: string;
}

export const adjustNutrientsForServingSize = (
  nutrients: NutrientMap,
  servingSize: number,
): NutrientMap => {
  const adjusted: NutrientMap = {};
  for (const [nutrient, value] of Object.entries(nutrients)) {
    adjusted[nutrient] = (value * servingSize) / 100;
  }
  return adjusted;
};

export const prepareOptimisationPayload = (
  foods: FoodItem[],
  nutrientGoals: NutrientMap,
  userInfo: UserInfoForPayload,
): OptimisationRequestPayload => {
  const selected_foods = foods.map((food) => {
    const servingSize = parseFloat(String(food.servingSize)) || 100;
    return {
      fdcId: food.fdcId,
      description: food.description,
      price: parseFloat(String(food.price ?? 0)),
      servingSize,
      maxServing: parseFloat(String(food.maxServing ?? 0)),
      requires_integer_servings: !!food.integerServings,
      must_include: !!food.mustInclude,
      nutrients: adjustNutrientsForServingSize(food.nutrients, servingSize),
    };
  });

  return {
    selected_foods,
    nutrient_goals: nutrientGoals,
    age: parseInt(String(userInfo.age), 10),
    gender: userInfo.gender,
    smokingStatus: userInfo.smokingStatus,
  };
};

export const exportSelectedFoodsToCSV = (foods: FoodItem[]): void => {
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
    const servingSize = parseFloat(String(food.servingSize)) || 100;
    const adjustedNutrients = adjustNutrientsForServingSize(
      food.nutrients,
      servingSize,
    );

    const row: (string | number)[] = [
      food.integerServings ? "Yes" : "No",
      food.mustInclude ? "Yes" : "No",
      `"${food.description}"`,
      food.price ?? "",
      food.servingSize ?? "",
      food.maxServing ?? "",
    ];

    headers.slice(6).forEach((header) => {
      const key = getNutrientKey(header);
      const value = adjustedNutrients[key];
      row.push(value !== undefined ? value.toFixed(2) : "");
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
  URL.revokeObjectURL(url);
};
