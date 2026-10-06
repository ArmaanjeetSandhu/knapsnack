import { useEffect, useState } from "react";

import type {
  FoodItem,
  FeasibilityAnalysis,
  NutritionCalculationResponse,
  OptimisationApiResult,
  UserInfo,
} from "../services/api";
import type { Dispatch, SetStateAction } from "react";

export type NutrientGoals = NutritionCalculationResponse;
export type NutrientBounds = Record<string, number>;

export interface OptimisationResults extends OptimisationApiResult {
  feasibilityAnalysis?: FeasibilityAnalysis;
}

const STORAGE_KEYS = {
  SELECTED_FOODS: "knapsnack_selected_foods",
  NUTRIENT_GOALS: "knapsnack_nutrient_goals",
  USER_INFO: "knapsnack_user_info",
  OPTIMIZATION_RESULTS: "knapsnack_optimisation_results",
  SNAPSHOT_FOODS: "knapsnack_snapshot_foods",
  SHOW_OPTIMISATION_RESULTS: "knapsnack_show_optimisation_results",
  SHOW_CALCULATION_RESULTS: "knapsnack_show_calculation_results",
  ADJUSTED_LOWER_BOUNDS: "knapsnack_adjusted_lower_bounds",
  ADJUSTED_UPPER_BOUNDS: "knapsnack_adjusted_upper_bounds",
  USE_CUSTOM_BOUNDS: "knapsnack_use_custom_bounds",
  FORM_STATE: "knapsnack_form_state",
  HAS_VISITED_FOOD_SELECTION: "knapsnack_has_visited_food_selection",
} as const;

type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

function readStorage<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function writeStorage(key: StorageKey, value: unknown): void {
  const isEmpty =
    value === null || (Array.isArray(value) && value.length === 0);
  if (isEmpty) localStorage.removeItem(key);
  else localStorage.setItem(key, JSON.stringify(value));
}

export interface AppState {
  showLanding: boolean;
  nutrientGoals: NutrientGoals | null;
  selectedFoods: FoodItem[];
  optimisationResults: OptimisationResults | null;
  snapshotFoods: FoodItem[];
  storedResults: OptimisationResults | null;
  showCalculationResults: boolean;
  userInfo: UserInfo | null;
  adjustedLowerBounds: NutrientBounds | null;
  adjustedUpperBounds: NutrientBounds | null;
  useCustomBounds: boolean;
  hasVisitedFoodSelection: boolean;
}

export interface AppActions {
  setShowLanding: Dispatch<SetStateAction<boolean>>;
  setNutrientGoals: Dispatch<SetStateAction<NutrientGoals | null>>;
  setSelectedFoods: Dispatch<SetStateAction<FoodItem[]>>;
  setShowOptimisationResults: Dispatch<SetStateAction<boolean>>;
  setSnapshotFoods: Dispatch<SetStateAction<FoodItem[]>>;
  setStoredResults: Dispatch<SetStateAction<OptimisationResults | null>>;
  setShowCalculationResults: Dispatch<SetStateAction<boolean>>;
  setUserInfo: Dispatch<SetStateAction<UserInfo | null>>;
  setAdjustedLowerBounds: Dispatch<SetStateAction<NutrientBounds | null>>;
  setAdjustedUpperBounds: Dispatch<SetStateAction<NutrientBounds | null>>;
  setUseCustomBounds: Dispatch<SetStateAction<boolean>>;
  setHasVisitedFoodSelection: Dispatch<SetStateAction<boolean>>;
  clearStorage: () => void;
}

export interface UseAppStateReturn {
  state: AppState;
  actions: AppActions;
}

export function useAppState(): UseAppStateReturn {
  const [showLanding, setShowLanding] = useState<boolean>(
    () => !localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS),
  );

  const [nutrientGoals, setNutrientGoals] = useState<NutrientGoals | null>(() =>
    readStorage<NutrientGoals | null>(STORAGE_KEYS.NUTRIENT_GOALS, null),
  );

  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>(() =>
    readStorage<FoodItem[]>(STORAGE_KEYS.SELECTED_FOODS, []),
  );

  const [snapshotFoods, setSnapshotFoods] = useState<FoodItem[]>(() =>
    readStorage<FoodItem[]>(STORAGE_KEYS.SNAPSHOT_FOODS, []),
  );

  const [storedResults, setStoredResults] =
    useState<OptimisationResults | null>(() =>
      readStorage<OptimisationResults | null>(
        STORAGE_KEYS.OPTIMIZATION_RESULTS,
        null,
      ),
    );

  const [showOptimisationResults, setShowOptimisationResults] =
    useState<boolean>(() =>
      readStorage<boolean>(STORAGE_KEYS.SHOW_OPTIMISATION_RESULTS, false),
    );

  const optimisationResults = showOptimisationResults ? storedResults : null;

  const [showCalculationResults, setShowCalculationResults] = useState<boolean>(
    () => {
      const flag = localStorage.getItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS);
      const hasGoals = !!localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
      return flag === "true" && hasGoals;
    },
  );

  const [userInfo, setUserInfo] = useState<UserInfo | null>(() =>
    readStorage<UserInfo | null>(STORAGE_KEYS.USER_INFO, null),
  );

  const [adjustedLowerBounds, setAdjustedLowerBounds] =
    useState<NutrientBounds | null>(() =>
      readStorage<NutrientBounds | null>(
        STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS,
        null,
      ),
    );

  const [adjustedUpperBounds, setAdjustedUpperBounds] =
    useState<NutrientBounds | null>(() =>
      readStorage<NutrientBounds | null>(
        STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS,
        null,
      ),
    );

  const [useCustomBounds, setUseCustomBounds] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.USE_CUSTOM_BOUNDS, false),
  );

  const [hasVisitedFoodSelection, setHasVisitedFoodSelection] =
    useState<boolean>(() => {
      const stored = localStorage.getItem(
        STORAGE_KEYS.HAS_VISITED_FOOD_SELECTION,
      );
      if (stored !== null) return JSON.parse(stored) as boolean;
      const hasGoals = !!localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
      const showCalc =
        localStorage.getItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS) === "true";
      const hasOptResults = !!localStorage.getItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS,
      );
      return hasGoals && !showCalc && !hasOptResults;
    });

  useEffect(() => {
    writeStorage(STORAGE_KEYS.SELECTED_FOODS, selectedFoods);
  }, [selectedFoods]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.NUTRIENT_GOALS, nutrientGoals);
  }, [nutrientGoals]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.USER_INFO, userInfo);
  }, [userInfo]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.OPTIMIZATION_RESULTS, storedResults);
  }, [storedResults]);

  useEffect(() => {
    writeStorage(
      STORAGE_KEYS.SHOW_OPTIMISATION_RESULTS,
      showOptimisationResults,
    );
  }, [showOptimisationResults]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, showCalculationResults);
  }, [showCalculationResults]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.SNAPSHOT_FOODS, snapshotFoods);
  }, [snapshotFoods]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS, adjustedLowerBounds);
  }, [adjustedLowerBounds]);

  useEffect(() => {
    writeStorage(STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS, adjustedUpperBounds);
  }, [adjustedUpperBounds]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.USE_CUSTOM_BOUNDS,
      JSON.stringify(useCustomBounds),
    );
  }, [useCustomBounds]);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.HAS_VISITED_FOOD_SELECTION,
      JSON.stringify(hasVisitedFoodSelection),
    );
  }, [hasVisitedFoodSelection]);

  const clearStorage = (): void => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  };

  return {
    state: {
      showLanding,
      nutrientGoals,
      selectedFoods,
      optimisationResults,
      snapshotFoods,
      storedResults,
      showCalculationResults,
      userInfo,
      adjustedLowerBounds,
      adjustedUpperBounds,
      useCustomBounds,
      hasVisitedFoodSelection,
    },
    actions: {
      setShowLanding,
      setNutrientGoals,
      setSelectedFoods,
      setShowOptimisationResults,
      setSnapshotFoods,
      setStoredResults,
      setShowCalculationResults,
      setUserInfo,
      setAdjustedLowerBounds,
      setAdjustedUpperBounds,
      setUseCustomBounds,
      setHasVisitedFoodSelection,
      clearStorage,
    },
  };
}
