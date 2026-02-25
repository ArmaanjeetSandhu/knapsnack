import { AnimatePresence, motion } from "framer-motion";
import { Download, ListX, Trash2, WandSparkles } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useSortableData } from "../hooks/useSortableData";
import {
  exportSelectedFoodsToCSV,
  prepareOptimisationPayload,
} from "../lib/foodHelpers";
import {
  preventInvalidFloatChars,
  preventInvalidIntegerChars,
  validateMaxTwoDecimals,
} from "../lib/utils";
import api from "../services/api";
import type {
  FoodItem,
  FeasibilityAnalysis,
  NutritionCalculationResponse,
  OptimisationApiResult,
  OptimisationFailure,
  UserInfo,
} from "../services/api";
import NotificationToast from "./common/NotificationToast";

const MotionTableRow = motion.create(TableRow);

interface SelectedFoodsProps {
  foods: FoodItem[];
  onFoodsUpdate: (foods: FoodItem[]) => void;
  nutrientGoals: NutritionCalculationResponse | null;
  userInfo: UserInfo | null;
  onOptimisationResults: (result: OptimisationApiResult) => void;
  onFeasibilityResults: (result: FeasibilityAnalysis) => void;
  notification: string | null;
  onNotificationClear: () => void;
  lastAddedIds?: Array<string | number>;
}

const SelectedFoods = ({
  foods,
  onFoodsUpdate,
  nutrientGoals,
  userInfo,
  onOptimisationResults,
  onFeasibilityResults,
  notification,
  onNotificationClear,
  lastAddedIds = [],
}: SelectedFoodsProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showInputErrorDialog, setShowInputErrorDialog] = useState(false);
  const [flashingFoods, setFlashingFoods] = useState<Array<string | number>>(
    [],
  );

  const getFoodSortValue = useCallback(
    (food: FoodItem, key: string): string | number => {
      if (key === "food") return food.description.toLowerCase();
      if (key === "price") return parseFloat(String(food.price)) || 0;
      if (key === "servingSize")
        return parseFloat(String(food.servingSize)) || 0;
      if (key === "maxServing") return parseFloat(String(food.maxServing)) || 0;
      return 0;
    },
    [],
  );

  const {
    sortedItems: sortedFoods,
    requestSort,
    getSortIcon,
  } = useSortableData(foods, getFoodSortValue);

  const sortedFoodsRef = useRef(sortedFoods);
  useEffect(() => {
    sortedFoodsRef.current = sortedFoods;
  }, [sortedFoods]);

  useEffect(() => {
    if (lastAddedIds.length === 0) return;

    const mountTimeout = setTimeout(() => {
      const firstNewId = lastAddedIds[0];
      const element = document.getElementById(`row-${firstNewId}`);
      if (!element) return;

      element.scrollIntoView({ behavior: "smooth", block: "center" });

      const itemIndex = sortedFoodsRef.current.findIndex(
        (f) => f.fdcId === firstNewId,
      );
      const scrollDelay = itemIndex !== -1 ? 100 + itemIndex * 20 : 200;

      setTimeout(() => {
        setFlashingFoods(lastAddedIds);
        setTimeout(() => setFlashingFoods([]), 2000);
      }, scrollDelay);
    }, 400);

    return () => clearTimeout(mountTimeout);
  }, [lastAddedIds]);

  const handleRemoveFood = (fdcId: string | number) => {
    onFoodsUpdate(foods.filter((food) => food.fdcId !== fdcId));
  };

  const handleClearAll = () => onFoodsUpdate([]);

  const handleInputChange = (
    fdcId: string | number,
    field: keyof FoodItem,
    value: unknown,
  ) => {
    onFoodsUpdate(
      foods.map((food) =>
        food.fdcId === fdcId ? { ...food, [field]: value } : food,
      ),
    );
  };

  const handleOptimise = async () => {
    const invalidFoods = foods.filter(
      (food) =>
        food.price === "" ||
        parseFloat(String(food.price)) < 0 ||
        !food.servingSize ||
        parseFloat(String(food.servingSize)) <= 0 ||
        (food.maxServing !== "" &&
          (isNaN(parseFloat(String(food.maxServing))) ||
            parseFloat(String(food.maxServing)) <= 0 ||
            parseFloat(String(food.maxServing)) <
              parseFloat(String(food.servingSize)))),
    );

    if (invalidFoods.length > 0) {
      setShowInputErrorDialog(true);
      return;
    }

    if (!nutrientGoals || !userInfo) return;

    setLoading(true);
    setError(null);
    try {
      const optimisationData = prepareOptimisationPayload(
        foods,
        nutrientGoals,
        userInfo,
      );
      const result = await api.optimiseDiet(optimisationData);

      if (result.success) {
        onOptimisationResults(result.result);
      } else {
        const failure = result as OptimisationFailure;
        if (failure.feasibilityAnalysis?.isFeasible) {
          setShowErrorDialog(true);
        } else if (failure.feasibilityAnalysis) {
          onFeasibilityResults(failure.feasibilityAnalysis);
        } else {
          setError(failure.message);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during optimisation",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="mb-6 shadow-lg">
        <CardHeader className="rounded-t-lg bg-primary">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              Selected Foods
            </CardTitle>
            {foods.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearAll}
                  className="flex items-center gap-2 transition-colors hover:bg-destructive hover:text-destructive-foreground"
                >
                  <ListX className="h-4 w-4" />
                  Clear All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => exportSelectedFoodsToCSV(foods)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            {notification && (
              <NotificationToast
                key="notification-toast"
                message={notification}
                onDismiss={onNotificationClear}
              />
            )}
            {error && (
              <NotificationToast
                key="error-toast"
                type="error"
                message={error}
                onDismiss={() => setError(null)}
              />
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {foods.length > 0 ? (
              <motion.div
                key="foods-list"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="rounded-md border">
                  <Table>
                    <TableHeader
                      style={{ position: "sticky", top: 0, zIndex: 10 }}
                    >
                      <TableRow>
                        <TableHead className="no-select w-[100px] text-center">
                          Discrete Servings
                        </TableHead>
                        <TableHead className="no-select w-[100px] text-center">
                          Must Include
                        </TableHead>
                        <TableHead
                          onClick={() => requestSort("food")}
                          className="no-select cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          Food Item{getSortIcon("food")}
                        </TableHead>
                        <TableHead
                          onClick={() => requestSort("price")}
                          className="no-select cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          Price Per Serving{getSortIcon("price")}
                        </TableHead>
                        <TableHead
                          onClick={() => requestSort("servingSize")}
                          className="no-select cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          Serving Size (g){getSortIcon("servingSize")}
                        </TableHead>
                        <TableHead
                          onClick={() => requestSort("maxServing")}
                          className="no-select cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          Max Serving (g){getSortIcon("maxServing")}
                        </TableHead>
                        <TableHead className="no-select w-[100px]">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence initial={false}>
                        {sortedFoods.map((food) => (
                          <MotionTableRow
                            key={food.fdcId}
                            id={`row-${food.fdcId}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{
                              opacity: 1,
                              x: 0,
                              backgroundColor: flashingFoods.includes(
                                food.fdcId,
                              )
                                ? [
                                    "rgba(0,0,0,0)",
                                    "rgba(34, 197, 94, 0.2)",
                                    "rgba(0,0,0,0)",
                                  ]
                                : "rgba(0,0,0,0)",
                            }}
                            transition={{
                              duration: flashingFoods.includes(food.fdcId)
                                ? 1.5
                                : 0.2,
                            }}
                            exit={{ opacity: 0, x: 10 }}
                          >
                            <TableCell>
                              <div className="flex h-full items-center justify-center pt-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary"
                                  checked={!!food.integerServings}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "integerServings",
                                      e.target.checked,
                                    )
                                  }
                                  aria-label={`Require discrete servings for ${food.description}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex h-full items-center justify-center pt-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 cursor-pointer rounded border-gray-300 accent-primary"
                                  checked={!!food.mustInclude}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "mustInclude",
                                      e.target.checked,
                                    )
                                  }
                                  aria-label={`Must include ${food.description}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {food.description}
                            </TableCell>
                            <TableCell>
                              <label
                                htmlFor={`price-${food.fdcId}`}
                                className="sr-only"
                              >
                                Price Per Serving for {food.description}
                              </label>
                              <Input
                                id={`price-${food.fdcId}`}
                                type="number"
                                step="0.01"
                                min="0"
                                value={String(food.price ?? "")}
                                onKeyDown={preventInvalidFloatChars}
                                onChange={(e) => {
                                  if (validateMaxTwoDecimals(e.target.value))
                                    handleInputChange(
                                      food.fdcId,
                                      "price",
                                      e.target.value,
                                    );
                                }}
                                className="w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <label
                                htmlFor={`serving-size-${food.fdcId}`}
                                className="sr-only"
                              >
                                Serving Size for {food.description}
                              </label>
                              <Input
                                id={`serving-size-${food.fdcId}`}
                                type="number"
                                step="1"
                                min="0"
                                value={String(food.servingSize ?? "")}
                                onKeyDown={preventInvalidIntegerChars}
                                onChange={(e) =>
                                  handleInputChange(
                                    food.fdcId,
                                    "servingSize",
                                    e.target.value,
                                  )
                                }
                                className="w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <label
                                htmlFor={`max-serving-${food.fdcId}`}
                                className="sr-only"
                              >
                                Maximum Serving for {food.description}
                              </label>
                              <Input
                                id={`max-serving-${food.fdcId}`}
                                type="number"
                                step="1"
                                min="0"
                                value={String(food.maxServing ?? "")}
                                onKeyDown={preventInvalidIntegerChars}
                                onChange={(e) =>
                                  handleInputChange(
                                    food.fdcId,
                                    "maxServing",
                                    e.target.value,
                                  )
                                }
                                className="w-[100px]"
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFood(food.fdcId)}
                                aria-label={`Remove ${food.description} from selected foods`}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Remove item</span>
                              </Button>
                            </TableCell>
                          </MotionTableRow>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-6">
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    size="lg"
                    onClick={handleOptimise}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="font-medium">Optimising...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <WandSparkles className="h-5 w-5" />
                        <span className="font-medium">Optimise Diet Plan</span>
                      </div>
                    )}
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert>
                  <AlertDescription>
                    No foods selected. Search and add foods to create your diet
                    plan.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mt-2 flex items-center gap-2 text-destructive">
              Oops!
            </DialogTitle>
            <DialogDescription className="pt-2 text-left">
              Knap[Snack] couldn&apos;t create a meal plan with your current
              selections. The foods you&apos;ve chosen do have the nutrients you
              need, but we&apos;re having trouble combining them in a way that
              hits all your targets perfectly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="mb-2 font-semibold">
              Here&apos;s what usually helps:
            </h4>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Adding more variety to your food list</li>
              <li>
                Increasing max serving sizes if you&apos;ve set them too low
              </li>
              <li>
                Reviewing any custom bounds to ensure the ranges aren&apos;t too
                narrow
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={showInputErrorDialog}
        onOpenChange={setShowInputErrorDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mt-2 flex items-center gap-2 text-destructive">
              Not so fast!
            </DialogTitle>
            <DialogDescription className="pt-2 text-left">
              We found some issues with the food details you entered.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="mb-2 font-semibold">Please verify the following:</h4>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted-foreground">
              <li>
                <span className="font-medium text-muted-foreground">
                  Price Per Serving
                </span>{" "}
                is specified and not negative
              </li>
              <li>
                <span className="font-medium text-muted-foreground">
                  Serving Size
                </span>{" "}
                is specified and greater than 0
              </li>
              <li>
                <span className="font-medium text-muted-foreground">
                  Max Serving
                </span>
                , if specified, is greater than 0 and not less than the serving
                size
              </li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInputErrorDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedFoods;
