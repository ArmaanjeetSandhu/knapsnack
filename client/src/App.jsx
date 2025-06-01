import { ArrowLeft, Calculator, Eye, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import CalculationResults from "./components/CalculationResults";
import FoodSearch from "./components/FoodSearch";
import GitHubIcon from "./components/GitHubIcon";
import LandingPage from "./components/LandingPage";
import OptimizationResults from "./components/OptimizationResults";
import PersonalInfoForm from "./components/PersonalInfoForm";
import SelectedFoods from "./components/SelectedFoods";
import ThemeToggle from "./components/ThemeToggle";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./components/ui/navigation-menu";
import api from "./services/api";
const STORAGE_KEYS = {
  SELECTED_FOODS: "knapsnack_selected_foods",
  NUTRIENT_GOALS: "knapsnack_nutrient_goals",
  USER_INFO: "knapsnack_user_info",
  OPTIMIZATION_RESULTS: "knapsnack_optimization_results",
  SHOW_CALCULATION_RESULTS: "knapsnack_show_calculation_results",
  ADJUSTED_LOWER_BOUNDS: "knapsnack_adjusted_lower_bounds",
  ADJUSTED_UPPER_BOUNDS: "knapsnack_adjusted_upper_bounds",
  USE_CUSTOM_BOUNDS: "knapsnack_use_custom_bounds",
};
const isDuplicateFood = (newFood, existingFoods) => {
  return existingFoods.some((food) => food.fdcId === newFood.fdcId);
};
function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [nutrientGoals, setNutrientGoals] = useState(null);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [storedResults, setStoredResults] = useState(null);
  const [showCalculationResults, setShowCalculationResults] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);
  const [adjustedLowerBounds, setAdjustedLowerBounds] = useState(null);
  const [adjustedUpperBounds, setAdjustedUpperBounds] = useState(null);
  const [useCustomBounds, setUseCustomBounds] = useState(false);
  useEffect(() => {
    try {
      const storedFoods = localStorage.getItem(STORAGE_KEYS.SELECTED_FOODS);
      const storedGoals = localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
      const storedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      const previousResults = localStorage.getItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS
      );
      const storedLowerBounds = localStorage.getItem(
        STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS
      );
      const storedUpperBounds = localStorage.getItem(
        STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS
      );
      const storedUseCustomBounds = localStorage.getItem(
        STORAGE_KEYS.USE_CUSTOM_BOUNDS
      );
      if (storedFoods) {
        setSelectedFoods(JSON.parse(storedFoods));
      }
      if (storedGoals) {
        setNutrientGoals(JSON.parse(storedGoals));
        setShowLanding(false);
      }
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
      if (previousResults) {
        const parsedResults = JSON.parse(previousResults);
        setStoredResults(parsedResults);
        setOptimizationResults(parsedResults);
      }
      if (storedLowerBounds) {
        setAdjustedLowerBounds(JSON.parse(storedLowerBounds));
      }
      if (storedUpperBounds) {
        setAdjustedUpperBounds(JSON.parse(storedUpperBounds));
      }
      if (storedUseCustomBounds) {
        setUseCustomBounds(JSON.parse(storedUseCustomBounds));
      }
      const showCalcResults = localStorage.getItem(
        STORAGE_KEYS.SHOW_CALCULATION_RESULTS
      );
      if (showCalcResults === "true" && storedGoals) {
        setShowCalculationResults(true);
      }
    } catch (err) {
      console.error("Error loading data from localStorage:", err);
    }
  }, []);
  useEffect(() => {
    if (selectedFoods.length > 0) {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_FOODS,
        JSON.stringify(selectedFoods)
      );
    }
  }, [selectedFoods]);
  useEffect(() => {
    if (nutrientGoals) {
      localStorage.setItem(
        STORAGE_KEYS.NUTRIENT_GOALS,
        JSON.stringify(nutrientGoals)
      );
    }
  }, [nutrientGoals]);
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem(STORAGE_KEYS.USER_INFO, JSON.stringify(userInfo));
    }
  }, [userInfo]);
  useEffect(() => {
    if (optimizationResults) {
      localStorage.setItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS,
        JSON.stringify(optimizationResults)
      );
      setStoredResults(optimizationResults);
    }
  }, [optimizationResults]);
  useEffect(() => {
    if (adjustedLowerBounds) {
      localStorage.setItem(
        STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS,
        JSON.stringify(adjustedLowerBounds)
      );
    }
  }, [adjustedLowerBounds]);
  useEffect(() => {
    if (adjustedUpperBounds) {
      localStorage.setItem(
        STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS,
        JSON.stringify(adjustedUpperBounds)
      );
    }
  }, [adjustedUpperBounds]);
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEYS.USE_CUSTOM_BOUNDS,
      JSON.stringify(useCustomBounds)
    );
  }, [useCustomBounds]);
  const handleFormSubmit = async (formData) => {
    try {
      const calculationData = {
        gender: formData.gender,
        age: formData.age,
        weight: formData.weight,
        height: formData.height,
        activity: formData.activity,
        percentage: formData.percentage,
        protein: formData.macroRatios.protein,
        carbohydrate: formData.macroRatios.carbohydrate,
        fats: formData.macroRatios.fats,
        smokingStatus: formData.smokingStatus,
      };
      const result = await api.calculateNutrition(calculationData);
      setNutrientGoals(result);
      setUserInfo({
        age: parseInt(formData.age),
        gender: formData.gender,
        smokingStatus: formData.smokingStatus,
      });
      setShowCalculationResults(true);
      setError(null);
      setAdjustedLowerBounds(null);
      setAdjustedUpperBounds(null);
      setUseCustomBounds(false);
    } catch (error) {
      setError("Error calculating nutrition: " + error.message);
    }
  };
  const handleReset = () => {
    setNutrientGoals(null);
    setSelectedFoods([]);
    setOptimizationResults(null);
    setStoredResults(null);
    setUserInfo(null);
    setError(null);
    setShowLanding(true);
    setShowCalculationResults(false);
    setAdjustedLowerBounds(null);
    setAdjustedUpperBounds(null);
    setUseCustomBounds(false);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_FOODS);
    localStorage.removeItem(STORAGE_KEYS.NUTRIENT_GOALS);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.OPTIMIZATION_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS);
    localStorage.removeItem(STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS);
    localStorage.removeItem(STORAGE_KEYS.USE_CUSTOM_BOUNDS);
  };
  const handleFoodSelect = (food) => {
    if (isDuplicateFood(food, selectedFoods)) {
      setError(`"${food.description}" is already in your food list.`);
      return;
    }
    setSelectedFoods((prevFoods) => [
      ...prevFoods,
      {
        ...food,
        price: "",
        servingSize: 100,
        maxServing: 500,
      },
    ]);
    setOptimizationResults(null);
    setError(null);
  };
  const handleFoodsImport = (importedFoods) => {
    const uniqueNewFoods = importedFoods.filter(
      (newFood) => !isDuplicateFood(newFood, selectedFoods)
    );
    const duplicates = importedFoods.length - uniqueNewFoods.length;
    if (duplicates > 0) {
      setError(
        `${duplicates} duplicate food item(s) were skipped during import.`
      );
    } else {
      setError(null);
    }
    if (uniqueNewFoods.length > 0) {
      setSelectedFoods((prevFoods) => [...prevFoods, ...uniqueNewFoods]);
      setOptimizationResults(null);
    }
  };
  const handleViewPreviousResults = () => {
    if (storedResults) {
      setOptimizationResults(storedResults);
    }
  };
  const handleHideResults = () => {
    setOptimizationResults(null);
  };
  const handleViewCalculationResults = () => {
    setShowCalculationResults(true);
    localStorage.setItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, "true");
  };
  const handleHideCalculationResults = (boundData) => {
    if (boundData) {
      setUseCustomBounds(boundData.useCustomBounds);
      if (boundData.useCustomBounds) {
        setAdjustedLowerBounds(boundData.adjustedLowerBounds);
        setAdjustedUpperBounds(boundData.adjustedUpperBounds);
      }
    }
    setShowCalculationResults(false);
    localStorage.setItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, "false");
  };
  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-900 text-white py-4 mb-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleReset}
              className="text-xl font-bold hover:text-gray-300 transition-colors"
            >
              Knap[Snack]: The Meal Planner
            </button>
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="text-white hover:text-gray-300 px-3 py-2"
                    href="#about"
                  >
                    About
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <a
                    href="https://github.com/ArmaanjeetSandhu/goal-ith"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-gray-300 px-3 py-2 inline-flex items-center gap-2"
                    aria-label="View project on GitHub"
                  >
                    <GitHubIcon size={20} />
                    <span className="sr-only">GitHub</span>
                  </a>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <ThemeToggle />
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 mb-8 flex-grow">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!nutrientGoals ? (
          <div className="max-w-4xl mx-auto">
            <PersonalInfoForm onSubmit={handleFormSubmit} />
          </div>
        ) : showCalculationResults ? (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <Button
                onClick={() => handleHideCalculationResults()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Food Selection
              </Button>
            </div>
            <CalculationResults
              calculationData={nutrientGoals}
              userInfo={userInfo}
              onProceed={handleHideCalculationResults}
            />
          </div>
        ) : (
          <>
            {!optimizationResults && !showCalculationResults && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {storedResults && (
                  <Button
                    onClick={handleViewPreviousResults}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Eye className="w-5 h-5 mr-2" />
                    View Previous Optimization Results
                  </Button>
                )}
                {nutrientGoals && (
                  <Button
                    onClick={handleViewCalculationResults}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Calculator className="w-5 h-5 mr-2" />
                    View Nutrition Requirements
                  </Button>
                )}
              </div>
            )}
            {optimizationResults && storedResults && (
              <div className="mb-4">
                <Button
                  onClick={handleHideResults}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Hide Results and Modify Foods
                </Button>
              </div>
            )}
            {!optimizationResults && (
              <>
                <FoodSearch
                  onFoodSelect={handleFoodSelect}
                  onFoodsImport={handleFoodsImport}
                  selectedFoodIds={selectedFoods.map((food) => food.fdcId)}
                />
                <SelectedFoods
                  foods={selectedFoods}
                  onFoodsUpdate={setSelectedFoods}
                  nutrientGoals={
                    useCustomBounds
                      ? {
                          ...nutrientGoals,
                          lower_bounds:
                            adjustedLowerBounds || nutrientGoals.lower_bounds,
                          upper_bounds:
                            adjustedUpperBounds || nutrientGoals.upper_bounds,
                        }
                      : nutrientGoals
                  }
                  userInfo={userInfo}
                  onOptimizationResults={setOptimizationResults}
                />
                {useCustomBounds && (
                  <Alert className="mt-4">
                    <AlertDescription>
                      Using custom nutrient bounds for optimization. Visit
                      &quot;View Nutrition Requirements&quot; to adjust them.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
            {optimizationResults && (
              <OptimizationResults
                results={optimizationResults}
                selectedFoods={selectedFoods}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
export default App;
