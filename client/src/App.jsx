import {
  ArrowLeft,
  Calculator,
  Eye,
  Info,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import AboutPage from "./components/AboutPage";
import BlogPage from "./components/BlogPage";
import BlogPostPage from "./components/BlogPostPage";
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
  NavigationMenuList,
} from "./components/ui/navigation-menu";
import { useAppState } from "./hooks/useAppState";
import api from "./services/api";

const isDuplicateFood = (newFood, existingFoods) => {
  return existingFoods.some((food) => food.fdcId === newFood.fdcId);
};

function App() {
  const { state, actions, STORAGE_KEYS } = useAppState();
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      actions.setNutrientGoals(result);
      actions.setUserInfo({
        age: parseInt(formData.age),
        gender: formData.gender,
        smokingStatus: formData.smokingStatus,
      });
      actions.setShowCalculationResults(true);
      setError(null);
      actions.setAdjustedLowerBounds(null);
      actions.setAdjustedUpperBounds(null);
      actions.setUseCustomBounds(false);
    } catch (error) {
      setError("Error calculating nutrition: " + error.message);
    }
  };

  const handleReset = () => {
    actions.clearStorage();
    actions.setNutrientGoals(null);
    actions.setSelectedFoods([]);
    actions.setOptimizationResults(null);
    actions.setStoredResults(null);
    actions.setSnapshotFoods([]);
    actions.setUserInfo(null);
    actions.setShowLanding(true);
    actions.setShowCalculationResults(false);
    actions.setAdjustedLowerBounds(null);
    actions.setAdjustedUpperBounds(null);
    actions.setUseCustomBounds(false);
    actions.setHasVisitedFoodSelection(false);
    setError(null);
    navigate("/");
  };

  const handleRecalculate = () => {
    actions.setNutrientGoals(null);
    actions.setOptimizationResults(null);
    actions.setStoredResults(null);
    actions.setSnapshotFoods([]);
    actions.setShowCalculationResults(false);
    actions.setAdjustedLowerBounds(null);
    actions.setAdjustedUpperBounds(null);
    actions.setUseCustomBounds(false);

    localStorage.removeItem(STORAGE_KEYS.NUTRIENT_GOALS);
    localStorage.removeItem(STORAGE_KEYS.OPTIMIZATION_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.SNAPSHOT_FOODS);
    localStorage.removeItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS);
    localStorage.removeItem(STORAGE_KEYS.ADJUSTED_LOWER_BOUNDS);
    localStorage.removeItem(STORAGE_KEYS.ADJUSTED_UPPER_BOUNDS);
    localStorage.removeItem(STORAGE_KEYS.USE_CUSTOM_BOUNDS);
    localStorage.removeItem(STORAGE_KEYS.FORM_STATE);
  };

  const handleOptimizationSuccess = (result) => {
    actions.setOptimizationResults(result);
    actions.setSnapshotFoods(state.selectedFoods);
  };

  const handleFoodSelect = (food) => {
    if (isDuplicateFood(food, state.selectedFoods)) {
      setError(`"${food.description}" is already in your food list.`);
      return;
    }
    actions.setSelectedFoods((prevFoods) => [
      ...prevFoods,
      {
        ...food,
        price: "",
        servingSize: 100,
        maxServing: 500,
      },
    ]);
    actions.setOptimizationResults(null);
    setError(null);
  };

  const handleFoodsImport = (importedFoods) => {
    const uniqueNewFoods = importedFoods.filter(
      (newFood) => !isDuplicateFood(newFood, state.selectedFoods),
    );
    const duplicates = importedFoods.length - uniqueNewFoods.length;
    if (duplicates > 0) {
      setError(
        `${duplicates} duplicate food item(s) were skipped during import.`,
      );
    } else {
      setError(null);
    }
    if (uniqueNewFoods.length > 0) {
      actions.setSelectedFoods((prevFoods) => [
        ...prevFoods,
        ...uniqueNewFoods,
      ]);
      actions.setOptimizationResults(null);
    }
  };

  const handleViewPreviousResults = () => {
    if (state.storedResults) {
      actions.setOptimizationResults(state.storedResults);
    }
  };

  const handleHideResults = () => {
    actions.setOptimizationResults(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleViewCalculationResults = () => {
    actions.setShowCalculationResults(true);
    localStorage.setItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, "true");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHideCalculationResults = (boundData) => {
    if (boundData) {
      actions.setUseCustomBounds(boundData.useCustomBounds);
      if (boundData.useCustomBounds) {
        actions.setAdjustedLowerBounds(boundData.adjustedLowerBounds);
        actions.setAdjustedUpperBounds(boundData.adjustedUpperBounds);
      }
    }
    actions.setShowCalculationResults(false);
    localStorage.setItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, "false");
  };

  const {
    showLanding,
    nutrientGoals,
    selectedFoods,
    optimizationResults,
    snapshotFoods,
    storedResults,
    showCalculationResults,
    userInfo,
    adjustedLowerBounds,
    adjustedUpperBounds,
    useCustomBounds,
    hasVisitedFoodSelection,
  } = state;

  const mainPlanner = (
    <>
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
          {hasVisitedFoodSelection && (
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
          )}
          <CalculationResults
            calculationData={nutrientGoals}
            userInfo={userInfo}
            onProceed={handleHideCalculationResults}
            onRecalculate={handleRecalculate}
            savedBounds={{
              useCustomBounds,
              adjustedLowerBounds,
              adjustedUpperBounds,
            }}
          />
        </div>
      ) : (
        <>
          {!optimizationResults && !showCalculationResults && (
            <div
              className={`mb-4 grid grid-cols-1 ${
                storedResults ? "md:grid-cols-2" : ""
              } gap-4`}
            >
              {storedResults && (
                <Button
                  onClick={handleViewPreviousResults}
                  variant="outline"
                  className="w-full"
                >
                  <Eye className="w-5 h-5 mr-2" />
                  View Previous Optimization Results
                </Button>
              )}
              {nutrientGoals && (
                <Button
                  onClick={handleViewCalculationResults}
                  variant="outline"
                  className="w-full"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  View Nutrition Requirements
                </Button>
              )}
            </div>
          )}

          {optimizationResults && (
            <div className="mb-4">
              <Button
                onClick={handleHideResults}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Modify Foods
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
                onFoodsUpdate={actions.setSelectedFoods}
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
                onOptimizationResults={handleOptimizationSuccess}
              />
              {useCustomBounds && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Using custom nutrient bounds for optimization. Visit
                    &quot;View Nutrition Requirements&quot; to adjust them.
                  </AlertDescription>
                </Alert>
              )}

              {!showCalculationResults && (
                <div
                  className={`mt-6 grid grid-cols-1 ${
                    storedResults ? "md:grid-cols-2" : ""
                  } gap-4`}
                >
                  {storedResults && (
                    <Button
                      onClick={handleViewPreviousResults}
                      variant="outline"
                      className="w-full"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      View Previous Optimization Results
                    </Button>
                  )}
                  {nutrientGoals && (
                    <Button
                      onClick={handleViewCalculationResults}
                      variant="outline"
                      className="w-full"
                    >
                      <Calculator className="w-5 h-5 mr-2" />
                      View Nutrition Requirements
                    </Button>
                  )}
                </div>
              )}
            </>
          )}

          {optimizationResults && (
            <>
              <OptimizationResults
                results={optimizationResults}
                selectedFoods={snapshotFoods}
              />
              <div className="mt-6">
                <Button
                  onClick={handleHideResults}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Modify Foods
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </>
  );

  if (showLanding && location.pathname === "/") {
    return <LandingPage onGetStarted={() => actions.setShowLanding(false)} />;
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
                  <Link to="/about" aria-label="About Knap[Snack]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-gray-300"
                    >
                      <Info className="h-5 w-5" />
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/blog" aria-label="Blog">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:text-gray-300"
                    >
                      <Newspaper className="h-5 w-5" />
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <a
                    href="https://github.com/ArmaanjeetSandhu/knapsnack"
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
        <Routes>
          <Route
            path="/about"
            element={<AboutPage onBack={() => navigate(-1)} />}
          />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/*" element={mainPlanner} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
