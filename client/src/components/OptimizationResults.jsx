import { useState } from "react";
import PropTypes from "prop-types";
import {
  Download,
  IndianRupee,
  Utensils,
  Beef,
  Beaker,
  AlertTriangle,
  Sliders,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import handleExportCSV from "./ExportHandler";

const OptimizationResults = ({ results, selectedFoods }) => {
  const [nutrientDisplayMode, setNutrientDisplayMode] = useState("table");

  const nonZeroItems = results.food_items
    .map((food, index) => ({
      food,
      servings: results.servings[index],
      cost: results.total_cost[index],
    }))
    .filter((item) => item.servings > 0);

  const totalDailyCost = results.total_cost_sum;

  const overflowByNutrient = results.overflow_by_nutrient || {};
  const totalOverflow = results.total_overflow || 0;

  const formatValue = (value) => {
    return typeof value === "number"
      ? value.toLocaleString("en-US", {
          maximumFractionDigits: 1,
        })
      : value;
  };

  const macronutrients = [
    { name: "Protein", value: results.nutrient_totals.protein, unit: "g" },
    {
      name: "Carbohydrates",
      value: results.nutrient_totals.carbohydrate,
      unit: "g",
    },
    { name: "Fats", value: results.nutrient_totals.fats, unit: "g" },
    { name: "Fiber", value: results.nutrient_totals.fiber, unit: "g" },
    {
      name: "Saturated Fats",
      value: results.nutrient_totals["saturated_fats"],
      unit: "g",
    },
  ];

  const vitamins = [
    {
      name: "Vitamin A",
      value: results.nutrient_totals["Vitamin A (µg)"],
      unit: "µg",
    },
    {
      name: "Vitamin C",
      value: results.nutrient_totals["Vitamin C (mg)"],
      unit: "mg",
    },
    {
      name: "Vitamin D",
      value: results.nutrient_totals["Vitamin D (µg)"],
      unit: "µg",
    },
    {
      name: "Vitamin E",
      value: results.nutrient_totals["Vitamin E (mg)"],
      unit: "mg",
    },
    {
      name: "Vitamin K",
      value: results.nutrient_totals["Vitamin K (µg)"],
      unit: "µg",
    },
    {
      name: "Thiamin",
      value: results.nutrient_totals["Thiamin (mg)"],
      unit: "mg",
    },
    {
      name: "Riboflavin",
      value: results.nutrient_totals["Riboflavin (mg)"],
      unit: "mg",
    },
    {
      name: "Niacin",
      value: results.nutrient_totals["Niacin (mg)"],
      unit: "mg",
    },
    {
      name: "Vitamin B6",
      value: results.nutrient_totals["Vitamin B6 (mg)"],
      unit: "mg",
    },
    {
      name: "Folate",
      value: results.nutrient_totals["Folate (µg)"],
      unit: "µg",
    },
    {
      name: "Vitamin B12",
      value: results.nutrient_totals["Vitamin B12 (µg)"],
      unit: "µg",
    },
    {
      name: "Pantothenic Acid",
      value: results.nutrient_totals["Pantothenic Acid (mg)"],
      unit: "mg",
    },
  ];

  const minerals = [
    {
      name: "Calcium",
      value: results.nutrient_totals["Calcium (mg)"],
      unit: "mg",
    },
    {
      name: "Copper",
      value: results.nutrient_totals["Copper (µg)"],
      unit: "µg",
    },
    { name: "Iron", value: results.nutrient_totals["Iron (mg)"], unit: "mg" },
    {
      name: "Magnesium",
      value: results.nutrient_totals["Magnesium (mg)"],
      unit: "mg",
    },
    {
      name: "Manganese",
      value: results.nutrient_totals["Manganese (mg)"],
      unit: "mg",
    },
    {
      name: "Phosphorus",
      value: results.nutrient_totals["Phosphorus (mg)"],
      unit: "mg",
    },
    {
      name: "Selenium",
      value: results.nutrient_totals["Selenium (µg)"],
      unit: "µg",
    },
    { name: "Zinc", value: results.nutrient_totals["Zinc (mg)"], unit: "mg" },
    {
      name: "Potassium",
      value: results.nutrient_totals["Potassium (mg)"],
      unit: "mg",
    },
    {
      name: "Sodium",
      value: results.nutrient_totals["Sodium (mg)"],
      unit: "mg",
    },
  ];

  const handleExportClick = () => {
    handleExportCSV(results, selectedFoods);
  };

  const renderNutrientTable = (nutrients) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nutrient</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Unit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {nutrients.map((nutrient, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{nutrient.name}</TableCell>
            <TableCell className="text-right">
              {formatValue(nutrient.value)}
            </TableCell>
            <TableCell className="text-right">{nutrient.unit}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  const renderNutrientCards = (nutrients) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nutrients.map((nutrient, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground">
              {nutrient.name}
            </h4>
            <p className="text-2xl font-bold mt-2">
              {formatValue(nutrient.value)} {nutrient.unit}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            Optimized Diet Plan
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportClick}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Plan
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <IndianRupee className="w-8 h-8 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Daily Cost
                        </p>
                        <p className="text-2xl font-bold">
                          ₹{totalDailyCost.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                        <AlertTriangle className="w-8 h-8 text-yellow-500 dark:text-yellow-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Nutrient Flexibility
                        </p>
                        <p className="text-2xl font-bold">
                          {totalOverflow}% total overflow
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* New section for nutrient-specific overflow percentages */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                Nutrient Flexibility Applied
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(overflowByNutrient).map(
                  ([nutrient, percentage]) => (
                    <Card key={nutrient}>
                      <CardContent className="pt-6">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                        </h4>
                        <p className="text-2xl font-bold mt-2">
                          {percentage}% overflow
                        </p>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </div>

            {totalOverflow > 15 && (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High total nutrient flexibility ({totalOverflow}%) was needed
                  to find a feasible solution. Consider adding more diverse
                  foods to your selection for better nutrient balance.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Utensils className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Recommended Daily Portions
              </h3>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Food Item</TableHead>
                      <TableHead className="text-right">
                        No. of Servings
                      </TableHead>
                      <TableHead className="text-right">Cost (₹)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {nonZeroItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.food}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.servings.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Beef className="w-5 h-5 text-pink-500 dark:text-pink-400" />
                Macronutrient Profile
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {macronutrients.map((macro, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {macro.name}
                      </h4>
                      <p className="text-2xl font-bold mt-2">
                        {formatValue(macro.value)} {macro.unit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  Micronutrient Profile
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant={
                      nutrientDisplayMode === "cards" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setNutrientDisplayMode("cards")}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={
                      nutrientDisplayMode === "table" ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setNutrientDisplayMode("table")}
                  >
                    Table
                  </Button>
                </div>
              </div>

              <Tabs defaultValue="vitamins" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="vitamins" className="flex-1">
                    Vitamins
                  </TabsTrigger>
                  <TabsTrigger value="minerals" className="flex-1">
                    Minerals
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="vitamins">
                  <ScrollArea className="h-[400px]">
                    {nutrientDisplayMode === "table"
                      ? renderNutrientTable(vitamins)
                      : renderNutrientCards(vitamins)}
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="minerals">
                  <ScrollArea className="h-[400px]">
                    {nutrientDisplayMode === "table"
                      ? renderNutrientTable(minerals)
                      : renderNutrientCards(minerals)}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

OptimizationResults.propTypes = {
  results: PropTypes.shape({
    food_items: PropTypes.arrayOf(PropTypes.string).isRequired,
    servings: PropTypes.arrayOf(PropTypes.number).isRequired,
    total_cost: PropTypes.arrayOf(PropTypes.number).isRequired,
    total_cost_sum: PropTypes.number.isRequired,
    nutrient_totals: PropTypes.object.isRequired,
    overflow_by_nutrient: PropTypes.object,
    total_overflow: PropTypes.number,
  }).isRequired,
  selectedFoods: PropTypes.arrayOf(
    PropTypes.shape({
      fdcId: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      servingSize: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      nutrients: PropTypes.object.isRequired,
    })
  ).isRequired,
};

export default OptimizationResults;
