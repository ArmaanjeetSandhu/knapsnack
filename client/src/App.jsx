import { GithubLogoIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calculator,
  Eye,
  Info,
  Newspaper,
  RefreshCw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import FeasibilityAnalysis from "./components/FeasibilityAnalysis";
import FoodSearch from "./components/FoodSearch";
import LandingPage from "./components/LandingPage";
import NotificationToast from "./components/NotificationToast";
import OptimisationResults from "./components/OptimisationResults";
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
  return existingFoods.some((food) => {
    return (
      food.description?.trim().toLowerCase() ===
      newFood.description?.trim().toLowerCase()
    );
  });
};

function App() {
  const { state, actions, STORAGE_KEYS } = useAppState();
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feasibilityResults, setFeasibilityResults] = useState(null);
  const [lastAddedIds, setLastAddedIds] = useState([]);

  const calculationResultsRef = useRef(null);
  const feasibilityResultsRef = useRef(null);
  const foodSearchRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (feasibilityResults)
      feasibilityResultsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [feasibilityResults]);

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
        weight: parseInt(formData.weight),
        height: parseInt(formData.height),
      });
      actions.setShowCalculationResults(true);
      setError(null);
      actions.setAdjustedLowerBounds(null);
      actions.setAdjustedUpperBounds(null);
      actions.setUseCustomBounds(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReset = () => {
    actions.clearStorage();
    actions.setNutrientGoals(null);
    actions.setSelectedFoods([]);
    actions.setOptimisationResults(null);
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
    setNotification(null);
    setFeasibilityResults(null);
    setLastAddedIds([]);
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
        weight: parseInt(updatedData.weight),
        height: parseInt(updatedData.height),
      });
      setError(null);
      setIsEditModalOpen(false);

      calculationResultsRef.current?.scrollIntoView({ behavior: "smooth" });

      actions.setAdjustedLowerBounds(null);
      actions.setAdjustedUpperBounds(null);
      actions.setUseCustomBounds(false);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOptimisationSuccess = (result) => {
    actions.setOptimisationResults(result);
    actions.setSnapshotFoods(state.selectedFoods);
    setFeasibilityResults(null);
  };

  const handleFeasibilityResults = (result) => {
    setFeasibilityResults(result);
  };

  const handleHideFeasibilityResults = () => {
    setFeasibilityResults(null);
    window.scrollTo(0, 0);
  };

  const handleFoodSelect = (food) => {
    if (isDuplicateFood(food, state.selectedFoods)) {
      setNotification(`"${food.description}" is already in your food list.`);
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
    setLastAddedIds([food.fdcId]);
    actions.setOptimisationResults(null);
    setFeasibilityResults(null);
    setError(null);
  };

  const handleFoodsImport = (importedFoods) => {
    const uniqueNewFoods = importedFoods.filter(
      (newFood) => !isDuplicateFood(newFood, state.selectedFoods),
    );
    const duplicates = importedFoods.length - uniqueNewFoods.length;
    if (duplicates > 0)
      setNotification(`${duplicates} duplicate food item(s) were skipped.`);
    else setNotification(null);

    if (uniqueNewFoods.length > 0) {
      actions.setSelectedFoods((prevFoods) => [
        ...prevFoods,
        ...uniqueNewFoods,
      ]);
      setLastAddedIds(uniqueNewFoods.map((f) => f.fdcId));
      actions.setOptimisationResults(null);
      setFeasibilityResults(null);
    }
  };

  const handleViewPreviousResults = () => {
    if (state.storedResults)
      actions.setOptimisationResults(state.storedResults);
  };

  const handleHideResults = () => {
    actions.setOptimisationResults(null);
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
    optimisationResults,
    snapshotFoods,
    storedResults,
    showCalculationResults,
    userInfo,
    adjustedLowerBounds,
    adjustedUpperBounds,
    useCustomBounds,
    hasVisitedFoodSelection,
  } = state;

  useEffect(() => {
    if (!showCalculationResults && foodSearchRef.current)
      foodSearchRef.current.scrollIntoView({ behavior: "smooth" });
  }, [showCalculationResults]);

  const effectiveNutrientGoals = useCustomBounds
    ? {
        ...nutrientGoals,
        lower_bounds: adjustedLowerBounds || nutrientGoals.lower_bounds,
        upper_bounds: adjustedUpperBounds || nutrientGoals.upper_bounds,
      }
    : nutrientGoals;

  const mainPlanner = (
    <>
      <AnimatePresence mode="wait">
        {error && (
          <NotificationToast
            type="error"
            message={error}
            onDismiss={() => setError(null)}
          />
        )}
      </AnimatePresence>

      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open)
            calculationResultsRef.current?.scrollIntoView({
              behavior: "smooth",
            });
        }}
      >
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <CalculationInputEditor
            initialData={userInfo}
            onSave={handleProfileUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              calculationResultsRef.current?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          />
        </DialogContent>
      </Dialog>

      {!nutrientGoals ? (
        <div className="max-w-4xl mx-auto">
          <PersonalInfoForm onSubmit={handleFormSubmit} />
        </div>
      ) : showCalculationResults ? (
        <div className="w-full mx-auto scroll-mt-4" ref={calculationResultsRef}>
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
          {!optimisationResults &&
            !feasibilityResults &&
            !showCalculationResults && (
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
                    View Previous Optimisation Results
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

          {optimisationResults && (
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

          {!optimisationResults && !feasibilityResults && (
            <>
              <div ref={foodSearchRef} className="scroll-mt-4">
                <FoodSearch
                  onFoodSelect={handleFoodSelect}
                  onFoodsImport={handleFoodsImport}
                  selectedFoodIds={selectedFoods.map((food) => food.fdcId)}
                />
              </div>
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
                onOptimisationResults={handleOptimisationSuccess}
                onFeasibilityResults={handleFeasibilityResults}
                notification={notification}
                onNotificationClear={() => setNotification(null)}
                lastAddedIds={lastAddedIds}
              />
              {useCustomBounds && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Using custom nutrient bounds for optimisation. Visit
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
                      View Previous Optimisation Results
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

          {feasibilityResults && (
            <div ref={feasibilityResultsRef} className="scroll-mt-4">
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
                    View Previous Optimisation Results
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
              <FeasibilityAnalysis
                feasibilityData={feasibilityResults}
                onGoBack={handleHideFeasibilityResults}
              />
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
                    View Previous Optimisation Results
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
            </div>
          )}

          {optimisationResults && (
            <>
              <OptimisationResults
                results={optimisationResults}
                selectedFoods={snapshotFoods}
                nutrientGoals={effectiveNutrientGoals}
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

  if (showLanding && location.pathname === "/")
    return <LandingPage onGetStarted={() => actions.setShowLanding(false)} />;

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
                      className="text-white hover:text-gray-300 hover:bg-transparent"
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
                      className="text-white hover:text-gray-300 hover:bg-transparent"
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
