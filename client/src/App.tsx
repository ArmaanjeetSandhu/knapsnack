import { GithubLogoIcon } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import { ArrowLeft, Calculator, Eye, Newspaper, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";


import BrandLogo from "./components/common/BrandLogo";
import DropzoneOverlay from "./components/common/DropzoneOverlay";
import Footer from "./components/common/Footer";
import NotificationToast from "./components/common/NotificationToast";
import ThemeToggle from "./components/common/ThemeToggle";
import FoodSearch from "./components/FoodSearch";
import CalculationInputEditor from "./components/forms/CalculationInputEditor";
import PersonalInfoForm from "./components/forms/PersonalInfoForm";
import BlogPage from "./components/pages/BlogPage";
import BlogPostPage from "./components/pages/BlogPostPage";
import ErrorPage from "./components/pages/ErrorPage";
import FaqPage from "./components/pages/FaqPage";
import FeedbackPage from "./components/pages/FeedbackPage";
import LandingPage from "./components/pages/landing/LandingPage";
import CalculationResults from "./components/results/CalculationResults";
import FeasibilityAnalysis from "./components/results/FeasibilityAnalysis";
import OptimisationResults from "./components/results/OptimisationResults";
import SelectedFoods from "./components/SelectedFoods";
import { Alert, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "./components/ui/dialog";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "./components/ui/navigation-menu";
import {
  useAppState,
  type OptimisationResults as OptimisationResultsState,
} from "./hooks/useAppState";
import { useCsvImport } from "./hooks/useCsvImport";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { prepareOptimisationPayload } from "./lib/foodHelpers";
import { smoothScrollTo } from "./lib/utils";
import api from "./services/api";

import type { FormData } from "./hooks/useFormWizard";
import type { SavedBounds } from "./hooks/useNutrientBounds";
import type {
  FoodItem,
  NutritionCalculationRequest,
  UserInfo,
  FeasibilityAnalysis as FeasibilityAnalysisType,
  NutrientMap,
} from "./services/api";

const isDuplicateFood = (
  newFood: FoodItem,
  existingFoods: FoodItem[],
): boolean =>
  existingFoods.some(
    (food) =>
      food.description?.trim().toLowerCase() ===
      newFood.description?.trim().toLowerCase(),
  );

const prepareCalculationData = (
  data: FormData,
): NutritionCalculationRequest => ({
  gender: data.gender,
  age: parseInt(String(data.age), 10),
  weight: parseInt(String(data.weight), 10),
  height: parseInt(String(data.height), 10),
  activity: data.activity,
  percentage: data.percentage,
  protein: data.macroRatios?.protein ?? 0,
  carbohydrate: data.macroRatios?.carbs ?? 0,
  fats: data.macroRatios?.fat ?? 0,
  smokingStatus: data.smokingStatus,
});

interface ActionButtonsProps {
  className?: string;
  storedResults: OptimisationResultsState | null;
  nutrientGoals: ReturnType<typeof useAppState>["state"]["nutrientGoals"];
  onViewPreviousResults: () => void;
  onViewCalculationResults: () => void;
}

function ActionButtons({
  className = "mb-4",
  storedResults,
  nutrientGoals,
  onViewPreviousResults,
  onViewCalculationResults,
}: ActionButtonsProps) {
  return (
    <div
      className={`${className} grid grid-cols-1 ${storedResults ? "md:grid-cols-2" : ""} gap-4`}
    >
      {storedResults && (
        <Button
          onClick={onViewPreviousResults}
          variant="outline"
          className="w-full"
        >
          <Eye className="mr-2 h-5 w-5" />
          View Previous Optimisation Results
        </Button>
      )}
      {nutrientGoals && (
        <Button
          onClick={onViewCalculationResults}
          variant="outline"
          className="w-full"
        >
          <Calculator className="mr-2 h-5 w-5" />
          View Nutrition Requirements
        </Button>
      )}
    </div>
  );
}

function App() {
  const { state, actions, STORAGE_KEYS } = useAppState();
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [feasibilityResults, setFeasibilityResults] =
    useState<FeasibilityAnalysisType | null>(null);
  const [lastAddedIds, setLastAddedIds] = useState<Array<string | number>>([]);

  const [planHistory, setPlanHistory] = useState<OptimisationResultsState[]>(
    [],
  );
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [isGeneratingAlternative, setIsGeneratingAlternative] = useState(false);

  const calculationResultsRef = useRef<HTMLDivElement>(null);
  const feasibilityResultsRef = useRef<HTMLDivElement>(null);
  const foodSearchRef = useRef<HTMLDivElement>(null);
  const selectedFoodsRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (feasibilityResults) smoothScrollTo(feasibilityResultsRef);
  }, [feasibilityResults]);

  const scrollToFoodSelection = useCallback((hasFoods: boolean) => {
    const targetRef = hasFoods ? selectedFoodsRef : foodSearchRef;
    smoothScrollTo(targetRef, 100);
  }, []);

  const handleFormSubmit = async (formData: FormData) => {
    try {
      const calculationData = prepareCalculationData(formData);
      const result = await api.calculateNutrition(calculationData);
      actions.setNutrientGoals(result);
      actions.setUserInfo({
        ...formData,
        age: parseInt(String(formData.age), 10),
        weight: parseInt(String(formData.weight), 10),
        height: parseInt(String(formData.height), 10),
        macroRatios: {
          protein: formData.macroRatios?.protein ?? 0,
          carbohydrate: formData.macroRatios?.carbs ?? 0,
          fats: formData.macroRatios?.fat ?? 0,
        },
      } as UserInfo);
      setLastAddedIds([]);
      actions.setShowCalculationResults(true);
      setError(null);
      actions.setAdjustedLowerBounds(null);
      actions.setAdjustedUpperBounds(null);
      actions.setUseCustomBounds(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
    setPlanHistory([]);
    setCurrentPlanIndex(0);
    navigate("/");
  };

  const handleProfileUpdate = async (updatedData: UserInfo) => {
    try {
      const calculationData: NutritionCalculationRequest = {
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
      actions.setUserInfo(updatedData);
      setError(null);
      setIsEditModalOpen(false);
      smoothScrollTo(calculationResultsRef);
      actions.setAdjustedLowerBounds(null);
      actions.setAdjustedUpperBounds(null);
      actions.setUseCustomBounds(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const handleOptimisationSuccess = (result: OptimisationResultsState) => {
    actions.setOptimisationResults(result);
    actions.setStoredResults(result);
    actions.setSnapshotFoods(state.selectedFoods);
    setFeasibilityResults(null);

    setPlanHistory([result]);
    setCurrentPlanIndex(0);
  };

  const handleFeasibilityResults = (result: FeasibilityAnalysisType) => {
    setFeasibilityResults(result);
  };

  const handleHideFeasibilityResults = () => {
    setLastAddedIds([]);
    setFeasibilityResults(null);
    scrollToFoodSelection(state.selectedFoods.length > 0);
  };

  const handleFoodSelect = (food: FoodItem) => {
    if (isDuplicateFood(food, state.selectedFoods)) {
      setNotification(`"${food.description}" is already in your food list.`);
      return;
    }
    actions.setSelectedFoods((prevFoods) => [
      ...prevFoods,
      { ...food, price: 0, servingSize: 100, maxServing: 500 },
    ]);
    setLastAddedIds([food.fdcId]);
    actions.setOptimisationResults(null);
    setFeasibilityResults(null);
    setError(null);
  };

  const handleFoodsImport = (importedFoods: FoodItem[]) => {
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

  const { handleFileDrop } = useCsvImport(
    (data) => {
      handleFoodsImport(data);
      setError(null);
    },
    (errorMsg) => setError(errorMsg),
  );

  const { isDragging, dragHandlers } = useDragAndDrop(handleFileDrop);

  const handleViewPreviousResults = () => {
    if (state.storedResults)
      actions.setOptimisationResults(state.storedResults);
  };

  const handleHideResults = () => {
    setLastAddedIds([]);
    actions.setOptimisationResults(null);
    scrollToFoodSelection(state.selectedFoods.length > 0);
  };

  const handleViewCalculationResults = () => {
    setLastAddedIds([]);
    actions.setShowCalculationResults(true);
    localStorage.setItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, "true");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleHideCalculationResults = (boundData?: SavedBounds) => {
    if (boundData) {
      actions.setUseCustomBounds(boundData.useCustomBounds);
      if (boundData.useCustomBounds) {
        actions.setAdjustedLowerBounds(boundData.adjustedLowerBounds);
        actions.setAdjustedUpperBounds(boundData.adjustedUpperBounds);
      }
    }
    actions.setShowCalculationResults(false);
    localStorage.setItem(STORAGE_KEYS.SHOW_CALCULATION_RESULTS, "false");
    actions.setHasVisitedFoodSelection(true);
  };

  const handleGenerateAlternativePlan = async () => {
    if (!state.nutrientGoals || !state.userInfo) return;

    setIsGeneratingAlternative(true);
    try {
      const payload = prepareOptimisationPayload(
        state.selectedFoods,
        state.nutrientGoals,
        {
          age: state.userInfo.age,
          gender: state.userInfo.gender,
          smokingStatus: state.userInfo.smokingStatus,
        },
        true,
      );

      const result = await api.optimiseDiet(payload);

      if (result.success) {
        const newResult = result.result;
        const updatedHistory = [...planHistory, newResult];

        setPlanHistory(updatedHistory);
        setCurrentPlanIndex(updatedHistory.length - 1);

        actions.setOptimisationResults(newResult);
        actions.setStoredResults(newResult);
      } else {
        setError(
          "Failed to generate an alternative plan with these specific random costs. Try again.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate alternative plan.",
      );
    } finally {
      setIsGeneratingAlternative(false);
    }
  };

  const handlePreviousPlan = () => {
    if (currentPlanIndex > 0) {
      const newIndex = currentPlanIndex - 1;
      setCurrentPlanIndex(newIndex);
      actions.setOptimisationResults(planHistory[newIndex]);
      actions.setStoredResults(planHistory[newIndex]);
    }
  };

  const handleNextPlan = () => {
    if (currentPlanIndex < planHistory.length - 1) {
      const newIndex = currentPlanIndex + 1;
      setCurrentPlanIndex(newIndex);
      actions.setOptimisationResults(planHistory[newIndex]);
      actions.setStoredResults(planHistory[newIndex]);
    }
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

  const hasSelectedFoods = selectedFoods.length > 0;

  useEffect(() => {
    if (!showCalculationResults) scrollToFoodSelection(hasSelectedFoods);
  }, [showCalculationResults, hasSelectedFoods, scrollToFoodSelection]);

  const effectiveNutrientGoals = nutrientGoals
    ? useCustomBounds
      ? {
          ...nutrientGoals,
          lower_bounds: (adjustedLowerBounds ??
            nutrientGoals.lower_bounds) as NutrientMap,
          upper_bounds: (adjustedUpperBounds ??
            nutrientGoals.upper_bounds) as NutrientMap,
        }
      : nutrientGoals
    : null;

  const actionButtonsProps: ActionButtonsProps = {
    storedResults,
    nutrientGoals,
    onViewPreviousResults: handleViewPreviousResults,
    onViewCalculationResults: handleViewCalculationResults,
  };

  const mainPlanner = (
    <div {...dragHandlers} className="relative min-h-[calc(100vh-120px)] pb-4">
      <DropzoneOverlay isDragging={isDragging} />

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
          if (!open) smoothScrollTo(calculationResultsRef);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogTitle className="sr-only">Modify Personal Info</DialogTitle>
          <DialogDescription className="sr-only">
            Update your personal details to recalculate your nutritional
            targets.
          </DialogDescription>
          <CalculationInputEditor
            initialData={userInfo}
            onSave={handleProfileUpdate}
            onCancel={() => {
              setIsEditModalOpen(false);
              smoothScrollTo(calculationResultsRef);
            }}
          />
        </DialogContent>
      </Dialog>

      {!nutrientGoals ? (
        <div className="mx-auto max-w-4xl">
          <PersonalInfoForm onSubmit={handleFormSubmit} />
        </div>
      ) : showCalculationResults ? (
        <div className="mx-auto w-full scroll-mt-4" ref={calculationResultsRef}>
          {hasVisitedFoodSelection && (
            <div className="mb-4">
              <Button
                onClick={() => handleHideCalculationResults()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Food Selection
              </Button>
            </div>
          )}
          <CalculationResults
            calculationData={nutrientGoals}
            onProceed={handleHideCalculationResults}
            onRecalculate={() => setIsEditModalOpen(true)}
            savedBounds={{
              useCustomBounds,
              adjustedLowerBounds: adjustedLowerBounds ?? {},
              adjustedUpperBounds: adjustedUpperBounds ?? {},
            }}
          />
        </div>
      ) : (
        <>
          {!optimisationResults &&
            !feasibilityResults &&
            !showCalculationResults && (
              <ActionButtons {...actionButtonsProps} className="mb-4" />
            )}

          {optimisationResults && (
            <div className="mb-4">
              <Button
                onClick={handleHideResults}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
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
              <div ref={selectedFoodsRef} className="scroll-mt-4">
                <SelectedFoods
                  foods={selectedFoods}
                  onFoodsUpdate={actions.setSelectedFoods}
                  nutrientGoals={effectiveNutrientGoals}
                  userInfo={userInfo}
                  onOptimisationResults={handleOptimisationSuccess}
                  onFeasibilityResults={handleFeasibilityResults}
                  notification={notification}
                  onNotificationClear={() => setNotification(null)}
                  lastAddedIds={lastAddedIds}
                />
              </div>
              {useCustomBounds && (
                <Alert className="mt-4">
                  <AlertDescription>
                    Using custom nutrient bounds for optimisation. Visit
                    &quot;View Nutrition Requirements&quot; to adjust them.
                  </AlertDescription>
                </Alert>
              )}
              {!showCalculationResults && (
                <ActionButtons {...actionButtonsProps} className="mt-6" />
              )}
            </>
          )}

          {feasibilityResults && (
            <div ref={feasibilityResultsRef} className="scroll-mt-4">
              <ActionButtons {...actionButtonsProps} className="mb-4" />
              <FeasibilityAnalysis
                feasibilityData={feasibilityResults}
                onGoBack={handleHideFeasibilityResults}
              />
              <ActionButtons {...actionButtonsProps} className="mt-6" />
            </div>
          )}

          {optimisationResults && (
            <>
              <OptimisationResults
                results={optimisationResults}
                selectedFoods={snapshotFoods}
                nutrientGoals={effectiveNutrientGoals}
                onGenerateAlternative={handleGenerateAlternativePlan}
                onPreviousPlan={handlePreviousPlan}
                onNextPlan={handleNextPlan}
                hasPrevious={currentPlanIndex > 0}
                hasNext={currentPlanIndex < planHistory.length - 1}
                isGenerating={isGeneratingAlternative}
              />
              <div className="mt-6">
                <Button
                  onClick={handleHideResults}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Modify Foods
                </Button>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );

  if (showLanding && location.pathname === "/")
    return (
      <LandingPage
        onGetStarted={() => actions.setShowLanding(false)}
        hasExistingSession={!!nutrientGoals}
        onStartOver={() => {
          handleReset();
          actions.setShowLanding(false);
        }}
      />
    );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mb-6 bg-gray-900 py-4 text-white dark:border-b dark:border-white/10 dark:bg-[#011d16]">
        <div className="px-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                actions.setShowLanding(true);
                navigate("/");
              }}
              className="flex items-baseline gap-[0.15em] transition-transform hover:scale-[1.02]"
            >
              <BrandLogo variant="header" />
              <span className="hidden text-xl font-black tracking-tighter text-white sm:inline-block sm:text-2xl">
                : The Meal Planner
              </span>
            </button>
            <NavigationMenu>
              <NavigationMenuList className="space-x-1 sm:space-x-1">
                <NavigationMenuItem>
                  <Link to="/blog" aria-label="Blog">
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-1 text-white hover:bg-transparent hover:text-gray-300 sm:px-4"
                    >
                      <Newspaper className="h-5 w-5" />
                      <span className="hidden sm:inline">Blog</span>
                    </Button>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <a
                    href="https://github.com/ArmaanjeetSandhu/knapsnack"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="View project on GitHub"
                  >
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 px-1 text-white hover:bg-transparent hover:text-gray-300 sm:px-4"
                    >
                      <GithubLogoIcon size={20} weight="bold" />
                      <span className="hidden sm:inline">GitHub</span>
                    </Button>
                  </a>
                </NavigationMenuItem>

                <NavigationMenuItem className="ml-1 sm:ml-2">
                  <ThemeToggle />
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>
      </header>
      <main className="mb-8 flex-grow px-4">
        <Routes>
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/" element={mainPlanner} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
