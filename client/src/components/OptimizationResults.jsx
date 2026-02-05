import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Beaker,
  Beef,
  Currency,
  Download,
  Droplets,
  LayoutGrid,
  Sliders,
  Table as TableIcon,
  Utensils,
} from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  HYDRATION_CONFIG,
  MINERALS_CONFIG,
  OTHERS_CONFIG,
  VITAMINS_CONFIG,
} from "../config/nutrientData";
import { getNonZeroItems, sortItems } from "../lib/resultsHelpers";
import handleExportCSV from "./ExportHandler";
import { NutrientCards, NutrientTable } from "./NutrientDisplay";

const OptimizationResults = ({ results, selectedFoods, nutrientGoals }) => {
  const [nutrientDisplayMode, setNutrientDisplayMode] = useState("table");
  const [portionsSortConfig, setPortionsSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const nonZeroItems = getNonZeroItems(results, selectedFoods);

  const handlePortionsSort = (key) => {
    let direction = "ascending";
    if (
      portionsSortConfig.key === key &&
      portionsSortConfig.direction === "ascending"
    )
      direction = "descending";
    setPortionsSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (portionsSortConfig.key !== key) return null;
    return portionsSortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const sortedPortionItems = sortItems(
    nonZeroItems,
    portionsSortConfig,
    "portions",
  );

  const totalDailyCost = results.total_cost_sum;
  const overflowByNutrient = results.overflow_by_nutrient || {};
  const totalOverflow = results.total_overflow || 0;

  const mapNutrientData = (config) =>
    config.map((nutrient) => ({
      ...nutrient,
      value: results.nutrient_totals[nutrient.key],
    }));

  const macronutrients = [
    { name: "Protein", value: results.nutrient_totals.protein, unit: "g" },
    {
      name: "Carbohydrates",
      value: results.nutrient_totals.carbohydrate,
      unit: "g",
    },
    { name: "Fats", value: results.nutrient_totals.fats, unit: "g" },
    { name: "Fibre", value: results.nutrient_totals.fibre, unit: "g" },
    {
      name: "Saturated Fats",
      value: results.nutrient_totals["saturated_fats"],
      unit: "g",
    },
  ];

  const vitamins = mapNutrientData(VITAMINS_CONFIG);
  const minerals = mapNutrientData(MINERALS_CONFIG);
  const others = mapNutrientData(OTHERS_CONFIG);
  const hydration = mapNutrientData(HYDRATION_CONFIG);

  const lowerBounds = nutrientGoals?.lower_bounds || {};
  const upperBounds = nutrientGoals?.upper_bounds || {};

  const handleExportClick = () => {
    handleExportCSV(results, selectedFoods);
  };

  const renderSimpleNutrientCards = (nutrients) => (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {nutrients.map((nutrient, index) => (
        <Card key={index}>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium text-muted-foreground">
              {nutrient.name}
            </h4>
            <p className="text-2xl font-bold mt-2">
              {nutrient.value} {nutrient.unit}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold mb-2">
            Optimized Diet Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                        <Currency className="w-8 h-8 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Cost
                        </p>
                        <p className="text-2xl font-bold">{totalDailyCost}</p>
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
                          Total Overflow
                        </p>
                        <p className="text-2xl font-bold">{totalOverflow}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sliders className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />
                Nutrient Overflow
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Object.entries(overflowByNutrient).map(
                  ([nutrient, percentage]) => (
                    <Card key={nutrient}>
                      <CardContent className="pt-6">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          {nutrient.charAt(0).toUpperCase() + nutrient.slice(1)}
                        </h4>
                        <p className="text-2xl font-bold mt-2">{percentage}%</p>
                      </CardContent>
                    </Card>
                  ),
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  Daily Portions
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportClick}
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader
                    style={{ position: "sticky", top: 0, zIndex: 10 }}
                  >
                    <TableRow>
                      <TableHead
                        onClick={() => handlePortionsSort("food")}
                        className="cursor-pointer hover:bg-muted/50 transition-colors no-select"
                      >
                        Food Item{getSortIcon("food")}
                      </TableHead>
                      <TableHead
                        onClick={() => handlePortionsSort("servingSize")}
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors no-select"
                      >
                        Serving Size (g){getSortIcon("servingSize")}
                      </TableHead>
                      <TableHead className="w-8 text-center text-muted-foreground"></TableHead>
                      <TableHead
                        onClick={() => handlePortionsSort("servings")}
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors no-select"
                      >
                        No. of Servings{getSortIcon("servings")}
                      </TableHead>
                      <TableHead className="w-8 text-center text-muted-foreground"></TableHead>
                      <TableHead
                        onClick={() => handlePortionsSort("totalServing")}
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors no-select"
                      >
                        Total Serving (g){getSortIcon("totalServing")}
                      </TableHead>
                      <TableHead
                        onClick={() => handlePortionsSort("cost")}
                        className="text-center cursor-pointer hover:bg-muted/50 transition-colors no-select"
                      >
                        Cost{getSortIcon("cost")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedPortionItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.food}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.servingSize}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm opacity-70">
                          ×
                        </TableCell>
                        <TableCell className="text-center">
                          {item.servings}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground text-sm opacity-70">
                          =
                        </TableCell>
                        <TableCell className="text-center">
                          {item.totalServing}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.cost}
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
                        {macro.value} {macro.unit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                Hydration
              </h3>
              {renderSimpleNutrientCards(hydration)}
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Beaker className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                  Micronutrient Profile
                </h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNutrientDisplayMode((prev) =>
                        prev === "table" ? "cards" : "table",
                      )
                    }
                  >
                    {nutrientDisplayMode === "table" ? (
                      <LayoutGrid className="w-4 h-4" />
                    ) : (
                      <TableIcon className="w-4 h-4" />
                    )}
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
                  <TabsTrigger value="others" className="flex-1">
                    Others
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="vitamins">
                  <div className="h-[400px] overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={nutrientDisplayMode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {nutrientDisplayMode === "table" ? (
                          <NutrientTable
                            nutrients={vitamins}
                            lowerBounds={lowerBounds}
                            upperBounds={upperBounds}
                            showBoundsInLayout={false}
                          />
                        ) : (
                          <NutrientCards
                            nutrients={vitamins}
                            lowerBounds={lowerBounds}
                            upperBounds={upperBounds}
                            showBoundsInLayout={false}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsContent>
                <TabsContent value="minerals">
                  <div className="h-[400px] overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={nutrientDisplayMode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {nutrientDisplayMode === "table" ? (
                          <NutrientTable
                            nutrients={minerals}
                            lowerBounds={lowerBounds}
                            upperBounds={upperBounds}
                            showBoundsInLayout={false}
                          />
                        ) : (
                          <NutrientCards
                            nutrients={minerals}
                            lowerBounds={lowerBounds}
                            upperBounds={upperBounds}
                            showBoundsInLayout={false}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsContent>
                <TabsContent value="others">
                  <div className="h-[400px] overflow-y-auto relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={nutrientDisplayMode}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                      >
                        {nutrientDisplayMode === "table" ? (
                          <NutrientTable
                            nutrients={others}
                            lowerBounds={lowerBounds}
                            upperBounds={upperBounds}
                            showBoundsInLayout={false}
                          />
                        ) : (
                          <NutrientCards
                            nutrients={others}
                            lowerBounds={lowerBounds}
                            upperBounds={upperBounds}
                            showBoundsInLayout={false}
                          />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimizationResults;
