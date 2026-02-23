import { useEffect, useState } from "react";

const STORAGE_KEYS = {
  SELECTED_FOODS: "knapsnack_selected_foods",
  NUTRIENT_GOALS: "knapsnack_nutrient_goals",
  USER_INFO: "knapsnack_user_info",
  OPTIMIZATION_RESULTS: "knapsnack_optimisation_results",
  SNAPSHOT_FOODS: "knapsnack_snapshot_foods",
  SHOW_CALCULATION_RESULTS: "knapsnack_show_calculation_results",
  ADJUSTED_LOWER_BOUNDS: "knapsnack_adjusted_lower_bounds",
  ADJUSTED_UPPER_BOUNDS: "knapsnack_adjusted_upper_bounds",
  USE_CUSTOM_BOUNDS: "knapsnack_use_custom_bounds",
  FORM_STATE: "knapsnack_form_state",
  HAS_VISITED_FOOD_SELECTION: "knapsnack_has_visited_food_selection",
};

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function useAppState() {
  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
  });

  const [nutrientGoals, setNutrientGoals] = useState(() =>
    readStorage(STORAGE_KEYS.NUTRIENT_GOALS, null),
  );

  const [selectedFoods, setSelectedFoods] = useState(() =>
    readStorage(STORAGE_KEYS.SELECTED_FOODS, []),
  );

  const [optimisationResults, setOptimisationResults] = useState(() =>
    readStorage(STORAGE_KEYS.OPTIMIZATION_RESULTS, null),
  );

  const [snapshotFoods, setSnapshotFoods] = useState(() =>
    readStorage(STORAGE_KEYS.SNAPSHOT_FOODS, []),
  );

  const [storedResults, setStoredResults] = useState(() =>
    readStorage(STORAGE_KEYS.OPTIMIZATION_RESULTS, null),
  );

  const [showCalculationResults, setShowCalculationResults] = useState(() => {
    const flag = localStorage.getItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS);
    const hasGoals = !!localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
    return flag === "true" && hasGoals;
  });

  const [userInfo, setUserInfo] = useState(() =>
    readStorage(STORAGE_KEYS.USER_INFO, null),
  );

  const [adjustedLowerBounds, setAdjustedLowerBounds] = useState(() =>
    readStorage(STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS, null),
  );

  const [adjustedUpperBounds, setAdjustedUpperBounds] = useState(() =>
    readStorage(STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS, null),
  );

  const [useCustomBounds, setUseCustomBounds] = useState(() =>
    readStorage(STORAGE_KEYS.USE_CUSTOM_BOUNDS, false),
  );

  const [hasVisitedFoodSelection, setHasVisitedFoodSelection] = useState(() => {
    const stored = localStorage.getItem(
      STORAGE_KEYS.HAS_VISITED_FOOD_SELECTION,
    );
    if (stored !== null) return JSON.parse(stored);
    const hasGoals = !!localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
    const showCalc =
      localStorage.getItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS) === "true";
    const hasOptResults = !!localStorage.getItem(
      STORAGE_KEYS.OPTIMIZATION_RESULTS,
    );
    return hasGoals && !showCalc && !hasOptResults;
  });

  useEffect(() => {
    if (selectedFoods.length > 0)
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_FOODS,
        JSON.stringify(selectedFoods),
      );
  }, [selectedFoods]);

  useEffect(() => {
    if (nutrientGoals)
      localStorage.setItem(
        STORAGE_KEYS.NUTRIENT_GOALS,
        JSON.stringify(nutrientGoals),
      );
  }, [nutrientGoals]);

  useEffect(() => {
    if (userInfo)
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
  }, [userInfo]);

  useEffect(() => {
    if (optimisationResults)
      localStorage.setItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS,
        JSON.stringify(optimisationResults),
      );
  }, [optimisationResults]);

  useEffect(() => {
    if (snapshotFoods.length > 0)
      localStorage.setItem(
        STORAGE_KEYS.SNAPSHOT_FOODS,
        JSON.stringify(snapshotFoods),
      );
  }, [snapshotFoods]);

  useEffect(() => {
    if (adjustedLowerBounds)
      localStorage.setItem(
        STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS,
        JSON.stringify(adjustedLowerBounds),
      );
  }, [adjustedLowerBounds]);

  useEffect(() => {
    if (adjustedUpperBounds)
      localStorage.setItem(
        STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS,
        JSON.stringify(adjustedUpperBounds),
      );
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

  const clearStorage = () => {
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
      setOptimisationResults,
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
    STORAGE_KEYS,
  };
}
