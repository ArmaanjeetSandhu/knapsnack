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

export function useAppState() {
  const [showLanding, setShowLanding] = useState(true);
  const [nutrientGoals, setNutrientGoals] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [optimisationResults, setOptimisationResults] = useState(null);
  const [snapshotFoods, setSnapshotFoods] = useState([]);
  const [storedResults, setStoredResults] = useState(null);
  const [showCalculationResults, setShowCalculationResults] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [adjustedLowerBounds, setAdjustedLowerBounds] = useState(null);
  const [adjustedUpperBounds, setAdjustedUpperBounds] = useState(null);
  const [useCustomBounds, setUseCustomBounds] = useState(false);
  const [hasVisitedFoodSelection, setHasVisitedFoodSelection] = useState(false);

  useEffect(() => {
    try {
      const storedFoods = localStorage.getItem(STORAGE_KEYS.SELECTED_FOODS);
      const storedGoals = localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
      const storedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      const previousResults = localStorage.getItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS,
      );
      const storedSnapshot = localStorage.getItem(STORAGE_KEYS.SNAPSHOT_FOODS);
      const storedLowerBounds = localStorage.getItem(
        STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS,
      );
      const storedUpperBounds = localStorage.getItem(
        STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS,
      );
      const storedUseCustomBounds = localStorage.getItem(
        STORAGE_KEYS.USE_CUSTOM_BOUNDS,
      );
      const storedVisitedFoodSelection = localStorage.getItem(
        STORAGE_KEYS.HAS_VISITED_FOOD_SELECTION,
      );

      if (storedFoods) setSelectedFoods(JSON.parse(storedFoods));
      if (storedGoals) {
        setNutrientGoals(JSON.parse(storedGoals));
        setShowLanding(false);
      }
      if (storedUserInfo) setUserInfo(JSON.parse(storedUserInfo));
      if (previousResults) {
        const parsedResults = JSON.parse(previousResults);
        setStoredResults(parsedResults);
        setOptimisationResults(parsedResults);
      }
      if (storedSnapshot) setSnapshotFoods(JSON.parse(storedSnapshot));
      if (storedLowerBounds)
        setAdjustedLowerBounds(JSON.parse(storedLowerBounds));
      if (storedUpperBounds)
        setAdjustedUpperBounds(JSON.parse(storedUpperBounds));
      if (storedUseCustomBounds)
        setUseCustomBounds(JSON.parse(storedUseCustomBounds));
      if (storedVisitedFoodSelection)
        setHasVisitedFoodSelection(JSON.parse(storedVisitedFoodSelection));

      const showCalcResults = localStorage.getItem(
        STORAGE_KEYS.SHOW_CALCULATION_RESULTS,
      );
      if (showCalcResults === "true" && storedGoals)
        setShowCalculationResults(true);
    } catch (err) {
      console.error("Error loading data from localStorage:", err);
    }
  }, []);

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
    if (optimisationResults) {
      localStorage.setItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS,
        JSON.stringify(optimisationResults),
      );
      setStoredResults(optimisationResults);
    }
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

  useEffect(() => {
    if (nutrientGoals && !showCalculationResults && !optimisationResults)
      setHasVisitedFoodSelection(true);
  }, [nutrientGoals, showCalculationResults, optimisationResults]);

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
