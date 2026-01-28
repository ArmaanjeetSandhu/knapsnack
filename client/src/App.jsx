import { GithubLogoIcon } from "@phosphor-icons/react";
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
import CalculationInputEditor from "./components/CalculationInputEditor";
import CalculationResults from "./components/CalculationResults";
import ErrorPage from "./components/ErrorPage";
import FoodSearch from "./components/FoodSearch";
import LandingPage from "./components/LandingPage";
import OptimizationResults from "./components/OptimizationResults";
import PersonalInfoForm from "./components/PersonalInfoForm";
import SelectedFoods from "./components/SelectedFoods";
import ThemeToggle from "./components/ThemeToggle";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { Dialog, DialogContent } from "./components/ui/dialog";
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
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

  const handleProfileUpdate = async (updatedData) => {
    try {
      const calculationData = {
        gender: updatedData.gender,
        age: updatedData.age,
        weight: updatedData.weight,
        height: updatedData.height,
        activity: updatedData.activity,
        percentage: updatedData.percentage,
        protein: updatedData.macroRatios.protein,
        carbohydrate: updatedData.macroRatios.carbohydrate,
        fats: updatedData.macroRatios.fats,
        smokingStatus: updatedData.smokingStatus,
      };

      const result = await api.calculateNutrition(calculationData);
      actions.setNutrientGoals(result);
      actions.setUserInfo({
        ...updatedData,
        age: parseInt(updatedData.age),
        weight: parseFloat(updatedData.weight),
        height: parseFloat(updatedData.height),
      });
      setError(null);
      setIsEditModalOpen(false);

      actions.setAdjustedLowerBounds(null);
      actions.setAdjustedUpperBounds(null);
      actions.setUseCustomBounds(false);
    } catch (error) {
      setError("Error recalculating nutrition: " + error.message);
    }
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

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <CalculationInputEditor
            initialData={userInfo}
            onSave={handleProfileUpdate}
            onCancel={() => setIsEditModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
            onRecalculate={() => setIsEditModalOpen(true)}
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
              className="text-xl font-bold hover:text-gray-300 transition-colors text-left"
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
                    <GithubLogoIcon size={20} weight="bold" />
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
          <Route path="/" element={mainPlanner} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
