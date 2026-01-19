import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Download, ListCheck, Trash2 } from "lucide-react";
import { useState } from "react";
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
  prepareOptimizationPayload,
} from "../lib/foodHelpers";
import api from "../services/api";
import FeasibilityAnalysis from "./FeasibilityAnalysis";

const MotionTableRow = motion.create(TableRow);

const SelectedFoods = ({
  foods,
  onFoodsUpdate,
  nutrientGoals,
  userInfo,
  onOptimizationResults,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const [feasibilityData, setFeasibilityData] = useState(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

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
        if (food.fdcId === fdcId) {
          return { ...food, [field]: value };
        }
        return food;
      }),
    );
    setFeasibilityData(null);
  };

  const handleOptimize = async () => {
    if (!foods.length) {
      setError("Please select at least one food item.");
      return;
    }
    const invalidFoods = foods.filter(
      (food) =>
        !food.price ||
        !food.servingSize ||
        parseFloat(food.price) <= 0 ||
        parseFloat(food.servingSize) <= 0 ||
        parseFloat(food.maxServing) <= 0,
    );
    if (invalidFoods.length > 0) {
      setError(
        "Please enter valid price, serving size, and maximum serving size for all foods.",
      );
      return;
    }
    setLoading(true);
    setError(null);
    setFeasibilityData(null);
    try {
      const optimizationData = prepareOptimizationPayload(
        foods,
        nutrientGoals,
        userInfo,
      );

      const result = await api.optimizeDiet(optimizationData);

      if (result.success) {
        onOptimizationResults(result.result);
      } else if (
        result.feasibilityAnalysis &&
        result.feasibilityAnalysis.isFeasible
      ) {
        setShowErrorDialog(true);
      } else if (result.feasibilityAnalysis) {
        setFeasibilityData(result.feasibilityAnalysis);
      } else {
        setError(result.message || "Optimization failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred during optimization");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSelectedFoods = () => {
    exportSelectedFoodsToCSV(foods);
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
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
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableFoods;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const sortedFoods = getSortedFoods();

  if (feasibilityData) {
    return <FeasibilityAnalysis feasibilityData={feasibilityData} />;
  }

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
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExportSelectedFoods}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Foods CSV
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
                          Price{getSortIcon("price")}
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
                                  Price for {food.description}
                                </label>
                                <Input
                                  id={`price-${food.fdcId}`}
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={food.price}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "price",
                                      e.target.value,
                                    )
                                  }
                                  className="w-[100px]"
                                  aria-label={`Price for ${food.description}`}
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
                                  value={food.maxServing || 500}
                                  onChange={(e) =>
                                    handleInputChange(
                                      food.fdcId,
                                      "maxServing",
                                      e.target.value,
                                    )
                                  }
                                  className="w-[100px]"
                                  placeholder="500"
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
                    onClick={handleOptimize}
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span className="font-medium">Optimizing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Calculator className="w-5 h-5" />
                        <span className="font-medium">Optimize Diet Plan</span>
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
            <DialogTitle className="text-destructive flex items-center gap-2">
              Oops!
            </DialogTitle>
            <DialogDescription className="pt-2">
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
            <Button onClick={() => setShowErrorDialog(false)}>Try Again</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SelectedFoods;
