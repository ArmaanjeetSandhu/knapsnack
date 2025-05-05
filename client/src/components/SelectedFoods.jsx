import { Calculator, Download, ListCheck, Trash2 } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import api from "../services/api";
import FeasibilityAnalysis from "./FeasibilityAnalysis";
const adjustNutrientsForServingSize = (nutrients, servingSize) => {
  const adjustedNutrients = {};
  for (const [nutrient, value] of Object.entries(nutrients)) {
    adjustedNutrients[nutrient] = (value * servingSize) / 100;
  }
  return adjustedNutrients;
};
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
  const handleRemoveFood = (fdcId) => {
    onFoodsUpdate(foods.filter((food) => food.fdcId !== fdcId));
    setFeasibilityData(null);
  };
  const handleInputChange = (fdcId, field, value) => {
    onFoodsUpdate(
      foods.map((food) => {
        if (food.fdcId === fdcId) {
          return { ...food, [field]: value };
        }
        return food;
      })
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
        parseFloat(food.maxServing) <= 0
    );
    if (invalidFoods.length > 0) {
      setError(
        "Please enter valid price, serving size, and maximum serving size for all foods."
      );
      return;
    }
    setLoading(true);
    setError(null);
    setFeasibilityData(null);
    try {
      const foodsData = foods.map((food) => ({
        fdcId: food.fdcId,
        description: food.description,
        price: parseFloat(food.price),
        servingSize: parseFloat(food.servingSize),
        maxServing: parseFloat(food.maxServing),
        nutrients: adjustNutrientsForServingSize(
          food.nutrients,
          parseFloat(food.servingSize)
        ),
      }));
      const optimizationData = {
        selected_foods: foodsData,
        nutrient_goals: nutrientGoals,
        age: parseInt(userInfo.age),
        gender: userInfo.gender,
        smokingStatus: userInfo.smokingStatus,
      };
      const result = await api.optimizeDiet(optimizationData);
      if (result.success) {
        onOptimizationResults(result.result);
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
    const headers = [
      "Food Item",
      "Price",
      "Serving Size (g)",
      "Max Serving (g)",
      "FDC ID",
      "Vitamin A (µg)",
      "Vitamin C (mg)",
      "Vitamin E (mg)",
      "Vitamin K (µg)",
      "Thiamin (mg)",
      "Riboflavin (mg)",
      "Niacin (mg)",
      "Vitamin B6 (mg)",
      "Folate (µg)",
      "Calcium (mg)",
      "Carbohydrate (g)",
      "Choline (mg)",
      "Protein (g)",
      "Fats (g)",
      "Saturated Fats (g)",
      "Fiber (g)",
      "Iron (mg)",
      "Magnesium (mg)",
      "Manganese (mg)",
      "Phosphorus (mg)",
      "Selenium (µg)",
      "Zinc (mg)",
      "Potassium (mg)",
      "Sodium (mg)",
      "Pantothenic Acid (mg)",
    ];
    let csvContent = headers.join(",") + "\n";
    foods.forEach((food) => {
      const adjustedNutrients = adjustNutrientsForServingSize(
        food.nutrients,
        parseFloat(food.servingSize) || 100
      );
      const row = [
        `"${food.description}"`,
        food.price || "",
        food.servingSize || "",
        food.maxServing || "",
        food.fdcId,
        adjustedNutrients["Vitamin A (µg)"]?.toFixed(2) || "",
        adjustedNutrients["Vitamin C (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Vitamin E (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Vitamin K (µg)"]?.toFixed(2) || "",
        adjustedNutrients["Thiamin (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Riboflavin (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Niacin (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Vitamin B6 (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Folate (µg)"]?.toFixed(2) || "",
        adjustedNutrients["Calcium (mg)"]?.toFixed(2) || "",
        adjustedNutrients["carbohydrate"]?.toFixed(2) || "",
        adjustedNutrients["Choline (mg)"]?.toFixed(2) || "",
        adjustedNutrients["protein"]?.toFixed(2) || "",
        adjustedNutrients["fats"]?.toFixed(2) || "",
        adjustedNutrients["saturated_fats"]?.toFixed(2) || "",
        adjustedNutrients["fiber"]?.toFixed(2) || "",
        adjustedNutrients["Iron (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Magnesium (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Manganese (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Phosphorus (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Selenium (µg)"]?.toFixed(2) || "",
        adjustedNutrients["Zinc (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Potassium (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Sodium (mg)"]?.toFixed(2) || "",
        adjustedNutrients["Pantothenic Acid (mg)"]?.toFixed(2) || "",
      ];
      csvContent += row.join(",") + "\n";
    });
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "selected_foods.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <Card className="mb-6 shadow-lg">
      <CardHeader className="bg-primary rounded-t-lg">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <ListCheck className="w-5 h-5" />
            Selected Foods
          </CardTitle>
          {foods.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSelectedFoods}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Foods CSV
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {foods.length > 0 ? (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
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
                  {sortedFoods.map((food) => (
                    <TableRow key={food.fdcId}>
                      <TableCell className="font-medium">
                        {food.description}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={food.price}
                          onChange={(e) =>
                            handleInputChange(
                              food.fdcId,
                              "price",
                              e.target.value
                            )
                          }
                          className="w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={food.servingSize}
                          onChange={(e) =>
                            handleInputChange(
                              food.fdcId,
                              "servingSize",
                              e.target.value
                            )
                          }
                          className="w-[100px]"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          value={food.maxServing || 500}
                          onChange={(e) =>
                            handleInputChange(
                              food.fdcId,
                              "maxServing",
                              e.target.value
                            )
                          }
                          className="w-[100px]"
                          placeholder="500"
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveFood(food.fdcId)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6">
              <Button
                className="w-full"
                size="lg"
                onClick={handleOptimize}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Optimizing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    <span>Optimize Diet Plan</span>
                  </div>
                )}
              </Button>
            </div>
          </>
        ) : (
          <Alert>
            <AlertDescription>
              No foods selected. Search and add foods to create your diet plan.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
SelectedFoods.propTypes = {
  foods: PropTypes.arrayOf(
    PropTypes.shape({
      fdcId: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      servingSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nutrients: PropTypes.object.isRequired,
    })
  ).isRequired,
  onFoodsUpdate: PropTypes.func.isRequired,
  nutrientGoals: PropTypes.object.isRequired,
  userInfo: PropTypes.shape({
    age: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    gender: PropTypes.string.isRequired,
    smokingStatus: PropTypes.string.isRequired,
  }).isRequired,
  onOptimizationResults: PropTypes.func.isRequired,
};
export default SelectedFoods;
