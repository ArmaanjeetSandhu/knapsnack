import { AnimatePresence, motion } from "framer-motion";
import { Download, ListCheck, ListX, Trash2, WandSparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
import {
  exportSelectedFoodsToCSV,
  prepareOptimisationPayload,
} from "../lib/foodHelpers";
import api from "../services/api";
import FeasibilityAnalysis from "./FeasibilityAnalysis";

const MotionTableRow = motion.create(TableRow);

const preventInvalidIntegerChars = (e) => {
  if ([".", "+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};
const preventInvalidFloatChars = (e) => {
  if (["+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};

const NotificationToast = ({ message, onDismiss }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [shouldFlash, setShouldFlash] = useState(false);
  const containerRef = useRef(null);
  const DURATION = 10;
  const RADIUS = 14;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const flashTimer = setTimeout(() => {
        setShouldFlash(true);
      }, 600);
      return () => clearTimeout(flashTimer);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft === 0) onDismiss();
  }, [timeLeft, onDismiss]);

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
      className="mb-6 relative group"
    >
      <motion.div
        animate={shouldFlash ? { opacity: [0, 0.6, 0] } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute inset-0 bg-primary/30 rounded-lg -z-10 blur-md"
      />

      <div className="bg-white text-black border border-gray-200 dark:bg-zinc-900 dark:text-white dark:border-zinc-800 px-4 py-3 rounded-lg shadow-lg flex items-center justify-between gap-4">
        <div className="flex-1 text-sm font-medium">{message}</div>

        <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="20"
              cy="20"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeOpacity="0.2"
              strokeWidth="3"
            />
            <motion.circle
              cx="20"
              cy="20"
              r={RADIUS}
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: 0 }}
              animate={{ strokeDashoffset: CIRCUMFERENCE }}
              transition={{ duration: DURATION, ease: "linear" }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">
            {timeLeft}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const SelectedFoods = ({
  foods,
  onFoodsUpdate,
  nutrientGoals,
  userInfo,
  onOptimisationResults,
  notification,
  onNotificationClear,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [feasibilityData, setFeasibilityData] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showInputErrorDialog, setShowInputErrorDialog] = useState(false);

  const handleRemoveFood = (fdcId) => {
    onFoodsUpdate(foods.filter((food) => food.fdcId !== fdcId));
    setFeasibilityData(null);
  };

  const handleClearAll = () => {
    onFoodsUpdate([]);
    setFeasibilityData(null);
  };

  const handleInputChange = (fdcId, field, value) => {
    onFoodsUpdate(
      foods.map((food) => {
        if (food.fdcId === fdcId) return { ...food, [field]: value };
        return food;
      }),
    );
    setFeasibilityData(null);
  };

  const handleOptimise = async () => {
    const invalidFoods = foods.filter(
      (food) =>
        food.price === "" ||
        parseFloat(food.price) < 0 ||
        !food.servingSize ||
        parseFloat(food.servingSize) <= 0 ||
        (food.maxServing !== "" &&
          (isNaN(parseFloat(food.maxServing)) ||
            parseFloat(food.maxServing) <= 0 ||
            parseFloat(food.maxServing) < parseFloat(food.servingSize))),
    );

    if (invalidFoods.length > 0) {
      setShowInputErrorDialog(true);
      return;
    }

    setLoading(true);
    setError(null);
    setFeasibilityData(null);
    try {
      const optimisationData = prepareOptimisationPayload(
        foods,
        nutrientGoals,
        userInfo,
      );

      const result = await api.optimiseDiet(optimisationData);

      if (result.success) onOptimisationResults(result.result);
      else if (
        result.feasibilityAnalysis &&
        result.feasibilityAnalysis.isFeasible
      )
        setShowErrorDialog(true);
      else if (result.feasibilityAnalysis)
        setFeasibilityData(result.feasibilityAnalysis);
      else setError(result.message);
    } catch (err) {
      setError(err.message || "An error occurred during optimisation");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelectedFoods = () => {
    exportSelectedFoodsToCSV(foods);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const getSortedFoods = () => {
    const sortableFoods = [...foods];
    if (sortConfig.key) {
      sortableFoods.sort((a, b) => {
        let aValue, bValue;
        if (sortConfig.key === "food") {
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
        } else if (sortConfig.key === "price") {
          aValue = parseFloat(a.price) || 0;
          bValue = parseFloat(b.price) || 0;
        } else if (sortConfig.key === "servingSize") {
          aValue = parseFloat(a.servingSize) || 0;
          bValue = parseFloat(b.servingSize) || 0;
        } else if (sortConfig.key === "maxServing") {
          aValue = parseFloat(a.maxServing) || 0;
          bValue = parseFloat(b.maxServing) || 0;
        }
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableFoods;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const sortedFoods = getSortedFoods();

  if (feasibilityData)
    return <FeasibilityAnalysis feasibilityData={feasibilityData} />;

  return (
    <>
      <Card className="mb-6 shadow-lg">
        <CardHeader className="bg-primary rounded-t-lg">
          <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <ListCheck className="w-5 h-5" />
              Selected Foods
            </CardTitle>
            {foods.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleClearAll}
                  className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                >
                  <ListX className="w-4 h-4" />
                  Clear All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportSelectedFoods}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
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
          </AnimatePresence>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                        <TableHead className="w-[100px] text-center">
                          Discrete Servings
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("food")}
                          className="cursor-pointer hover:bg-muted/50 transition-colors no-select"
                        >
                          Food Item{getSortIcon("food")}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("price")}
                          className="cursor-pointer hover:bg-muted/50 transition-colors no-select"
                        >
                          Price Per Serving{getSortIcon("price")}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("servingSize")}
                          className="cursor-pointer hover:bg-muted/50 transition-colors no-select"
                        >
                          Serving Size (g){getSortIcon("servingSize")}
                        </TableHead>
                        <TableHead
                          onClick={() => handleSort("maxServing")}
                          className="cursor-pointer hover:bg-muted/50 transition-colors no-select"
                        >
                          Max Serving (g){getSortIcon("maxServing")}
                        </TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence initial={false}>
                        {sortedFoods.map((food) => (
                          <MotionTableRow
                            key={food.fdcId}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            transition={{ duration: 0.2 }}
                          >
                            <TableCell>
                              <div className="flex justify-center items-center h-full pt-2">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
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
                            <TableCell className="font-medium">
                              {food.description}
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
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
                                  value={food.price}
                                  onKeyDown={preventInvalidFloatChars}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "price",
                                      e.target.value,
                                    )
                                  }
                                  className="w-[100px]"
                                  aria-label={`Price Per Serving for ${food.description}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <label
                                  htmlFor={`serving-size-${food.fdcId}`}
                                  className="sr-only"
                                >
                                  Serving Size in grams for {food.description}
                                </label>
                                <Input
                                  id={`serving-size-${food.fdcId}`}
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={food.servingSize}
                                  onKeyDown={preventInvalidIntegerChars}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "servingSize",
                                      e.target.value,
                                    )
                                  }
                                  className="w-[100px]"
                                  aria-label={`Serving Size in grams for ${food.description}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <label
                                  htmlFor={`max-serving-${food.fdcId}`}
                                  className="sr-only"
                                >
                                  Maximum Serving in grams for{" "}
                                  {food.description}
                                </label>
                                <Input
                                  id={`max-serving-${food.fdcId}`}
                                  type="number"
                                  step="1"
                                  min="0"
                                  value={food.maxServing}
                                  onKeyDown={preventInvalidIntegerChars}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "maxServing",
                                      e.target.value,
                                    )
                                  }
                                  className="w-[100px]"
                                  aria-label={`Maximum Serving in grams for ${food.description}`}
                                />
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleRemoveFood(food.fdcId)}
                                aria-label={`Remove ${food.description} from selected foods`}
                              >
                                <Trash2 className="w-4 h-4" />
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
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
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
                        <WandSparkles className="w-5 h-5" />
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
            <DialogTitle className="text-destructive flex items-center gap-2 mt-2">
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
            <h4 className="font-semibold mb-2">
              Here&apos;s what usually helps:
            </h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
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
            <DialogTitle className="text-destructive flex items-center gap-2 mt-2">
              Not so fast!
            </DialogTitle>
            <DialogDescription className="pt-2 text-left">
              We found some issues with the food details you entered.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <h4 className="font-semibold mb-2">Please verify the following:</h4>
            <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
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
