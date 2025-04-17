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
  SELECTED_FOODS: "goalith_selected_foods",
  NUTRIENT_GOALS: "goalith_nutrient_goals",
  USER_INFO: "goalith_user_info",
  OPTIMIZATION_RESULTS: "goalith_optimization_results",
  SHOW_CALCULATION_RESULTS: "goalith_show_calculation_results",
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
  useEffect(() => {
    try {
      const storedFoods = localStorage.getItem(STORAGE_KEYS.SELECTED_FOODS);
      const storedGoals = localStorage.getItem(STORAGE_KEYS.NUTRIENT_GOALS);
      const storedUserInfo = localStorage.getItem(STORAGE_KEYS.USER_INFO);
      const previousResults = localStorage.getItem(
        STORAGE_KEYS.OPTIMIZATION_RESULTS
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
    localStorage.removeItem(STORAGE_KEYS.SELECTED_FOODS);
    localStorage.removeItem(STORAGE_KEYS.NUTRIENT_GOALS);
    localStorage.removeItem(STORAGE_KEYS.USER_INFO);
    localStorage.removeItem(STORAGE_KEYS.OPTIMIZATION_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS);
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
  const handleHideCalculationResults = () => {
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
              Goal-i<sup>th</sup>: The Meal Planner
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
                    className="text-white hover:text-gray-300 px-3 py-2 inline-flex items-center"
                  >
                    <GitHubIcon size={20} />
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
                onClick={handleHideCalculationResults}
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
                  nutrientGoals={nutrientGoals}
                  userInfo={userInfo}
                  onOptimizationResults={setOptimizationResults}
                />
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
