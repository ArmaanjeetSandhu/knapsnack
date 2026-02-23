import type { NutrientMap } from "../services/api";
import type { FoodItem } from "../services/api";

export interface OptimisationApiResult {
  food_items: string[];
  servings: number[];
  overflow_by_nutrient?: Record<string, number>;
  total_overflow?: number;
}

export interface ResultItem {
  food: string;
  servings: number;
  servingSize: number;
  totalServing: number;
  cost: number;
  nutrients: NutrientMap;
}

export interface ResultTotals {
  cost: number;
  nutrients: NutrientMap;
}

export interface ConsistentResults {
  items: ResultItem[];
  totals: ResultTotals;
}

export interface NutrientRow {
  name: string;
  value: number;
  unit: string;
}

export type SortDirection = "ascending" | "descending";

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export const bankersRound = (num: number, decimalPlaces = 0): number => {
  const m = Math.pow(10, decimalPlaces);
  const n = +(decimalPlaces ? num * m : num).toFixed(8);
  const i = Math.floor(n);
  const f = n - i;
  const e = 1e-8;
  const r =
    f > 0.5 - e && f < 0.5 + e ? (i % 2 === 0 ? i : i + 1) : Math.round(n);
  return decimalPlaces ? r / m : r;
};

export const calculateConsistentResults = (
  results: OptimisationApiResult,
  selectedFoods: FoodItem[],
): ConsistentResults => {
  const totals: ResultTotals = { cost: 0, nutrients: {} };

  const items = results.food_items
    .map((foodName, index): ResultItem | null => {
      const rawServings = results.servings[index];
      const roundedServings = bankersRound(rawServings, 1);
      if (roundedServings <= 0) return null;

      const food = selectedFoods.find((f) => f.description === foodName);
      if (!food) return null;

      const servingSize = parseFloat(String(food.servingSize)) || 100;
      const totalServing = roundedServings * servingSize;
      const price = parseFloat(String(food.price ?? 0)) || 0;
      const cost = roundedServings * price;
      totals.cost += cost;

      const itemNutrients: NutrientMap = {};
      Object.entries(food.nutrients).forEach(([key, value]) => {
        const nutrientValue = (value * totalServing) / 100;
        itemNutrients[key] = nutrientValue;
        totals.nutrients[key] = (totals.nutrients[key] ?? 0) + nutrientValue;
      });

      return {
        food: foodName,
        servings: roundedServings,
        servingSize,
        totalServing,
        cost,
        nutrients: itemNutrients,
      };
    })
    .filter((item): item is ResultItem => item !== null);

  return { items, totals };
};

export function sortItems(
  items: ResultItem[],
  config: SortConfig,
  type?: "portions",
): ResultItem[];
export function sortItems(
  items: NutrientRow[],
  config: SortConfig,
  type?: "nutrients",
): NutrientRow[];
export function sortItems(
  items: (ResultItem | NutrientRow)[],
  config: SortConfig,
  type: "portions" | "nutrients" = "portions",
): (ResultItem | NutrientRow)[] {
  if (!config.key) return items;

  return [...items].sort((a, b) => {
    let aValue: string | number | undefined;
    let bValue: string | number | undefined;

    if (type === "portions") {
      const ai = a as ResultItem;
      const bi = b as ResultItem;
      if (config.key === "food") {
        aValue = ai.food.toLowerCase();
        bValue = bi.food.toLowerCase();
      } else if (config.key === "servingSize") {
        aValue = ai.servingSize;
        bValue = bi.servingSize;
      } else if (config.key === "servings") {
        aValue = ai.servings;
        bValue = bi.servings;
      } else if (config.key === "totalServing") {
        aValue = ai.totalServing;
        bValue = bi.totalServing;
      } else if (config.key === "cost") {
        aValue = ai.cost;
        bValue = bi.cost;
      }
    } else {
      const ai = a as NutrientRow;
      const bi = b as NutrientRow;
      if (config.key === "nutrient") {
        aValue = ai.name.toLowerCase();
        bValue = bi.name.toLowerCase();
      } else if (config.key === "amount") {
        aValue = ai.value;
        bValue = bi.value;
      } else if (config.key === "unit") {
        aValue = ai.unit.toLowerCase();
        bValue = bi.unit.toLowerCase();
      }
    }

    if (aValue === undefined || bValue === undefined) return 0;
    if (aValue < bValue) return config.direction === "ascending" ? -1 : 1;
    if (aValue > bValue) return config.direction === "ascending" ? 1 : -1;
    return 0;
  });
}

export const formatValue = (value: number): number => value;
