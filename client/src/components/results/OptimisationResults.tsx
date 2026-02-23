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
import { useEffect, useRef, useState } from "react";
import {
  HYDRATION_CONFIG,
  MINERALS_CONFIG,
  OTHERS_CONFIG,
  VITAMINS_CONFIG,
  type NutrientConfig,
} from "../../config/nutrientData";
import type { NutrientMap, FoodItem } from "../../services/api";
import type { OptimisationApiResult } from "../../lib/resultsHelpers";
import {
  bankersRound,
  calculateConsistentResults,
  formatValue,
  sortItems,
} from "../../lib/resultsHelpers";
import type { SortConfig } from "../../hooks/useSortableData";
import handleExportCSV from "../ExportHandler";
import { NutrientCards, NutrientTable } from "../nutrients/NutrientDisplay";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface NutrientGoalsShape {
  lower_bounds?: NutrientMap;
  upper_bounds?: NutrientMap;
}

interface OptimisationResultsProps {
  results: OptimisationApiResult;
  selectedFoods: FoodItem[];
  nutrientGoals: NutrientGoalsShape | null;
}

type NutrientDisplayMode = "table" | "cards";

interface MappedNutrient extends NutrientConfig {
  value: number;
}

interface MacroNutrient {
  name: string;
  value: number;
  unit: string;
}

const SimpleNutrientCards = ({ nutrients }: { nutrients: MacroNutrient[] }) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {nutrients.map((nutrient, index) => (
      <Card key={index}>
        <CardContent className="pt-6">
          <h4 className="text-sm font-medium text-muted-foreground">
            {nutrient.name}
          </h4>
          <p className="mt-2 text-2xl font-bold">
            {nutrient.value} {nutrient.unit}
          </p>
        </CardContent>
      </Card>
    ))}
  </div>
);

const OptimisationResults = ({
  results,
  selectedFoods,
  nutrientGoals,
}: OptimisationResultsProps) => {
  const [nutrientDisplayMode, setNutrientDisplayMode] =
    useState<NutrientDisplayMode>(() =>
      typeof window !== "undefined" && window.innerWidth < 768
        ? "cards"
        : "table",
    );

  const [portionsSortConfig, setPortionsSortConfig] = useState<SortConfig>({
    key: null,
    direction: "ascending",
  });

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const { items: nonZeroItems, totals } = calculateConsistentResults(
    results,
    selectedFoods,
  );

  const handlePortionsSort = (key: string) => {
    setPortionsSortConfig((prev) => ({
      key,
      direction:
        prev.key === key && prev.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
  };

  const getSortIcon = (key: string): string | null => {
    if (portionsSortConfig.key !== key) return null;
    return portionsSortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const sortedPortionItems = sortItems(
    nonZeroItems,
    portionsSortConfig,
    "portions",
  );

  const overflowByNutrient = results.overflow_by_nutrient ?? {};
  const totalOverflow = results.total_overflow ?? 0;

  const mapNutrientData = (
    config: NutrientConfig[],
    decimals: number,
  ): MappedNutrient[] =>
    config.map((nutrient) => ({
      ...nutrient,
      value: bankersRound(totals.nutrients[nutrient.key] ?? 0, decimals),
    }));

  const macronutrients: MacroNutrient[] = [
    {
      name: "Protein",
      value: bankersRound(totals.nutrients.protein ?? 0, 0),
      unit: "g",
    },
    {
      name: "Carbohydrates",
      value: bankersRound(totals.nutrients.carbohydrate ?? 0, 0),
      unit: "g",
    },
    {
      name: "Fats",
      value: bankersRound(totals.nutrients.fats ?? 0, 0),
      unit: "g",
    },
    {
      name: "Fibre",
      value: bankersRound(totals.nutrients.fibre ?? 0, 0),
      unit: "g",
    },
    {
      name: "Saturated Fats",
      value: bankersRound(totals.nutrients.saturated_fats ?? 0, 0),
      unit: "g",
    },
  ];

  const vitamins = mapNutrientData(VITAMINS_CONFIG, 1);
  const minerals = mapNutrientData(MINERALS_CONFIG, 1);
  const others = mapNutrientData(OTHERS_CONFIG, 1);
  const hydration = mapNutrientData(HYDRATION_CONFIG, 0);

  const lowerBounds: NutrientMap = nutrientGoals?.lower_bounds ?? {};
  const upperBounds: NutrientMap = nutrientGoals?.upper_bounds ?? {};

  const micronutrientTabs = [
    { key: "vitamins", data: vitamins },
    { key: "minerals", data: minerals },
    { key: "others", data: others },
  ] as const;

  return (
    <div ref={resultsRef} className="scroll-mt-4 space-y-6">
      <Card>
        <CardHeader className="space-y-0 pb-2">
          <CardTitle className="mb-2 text-2xl font-bold">
            Optimised Diet Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/30">
                        <Currency className="h-8 w-8 text-green-500 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Total Cost
                        </p>
                        <p className="text-2xl font-bold">
                          {bankersRound(totals.cost, 2).toFixed(2)}
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
                      <div className="rounded-full bg-yellow-100 p-2 dark:bg-yellow-900/30">
                        <AlertTriangle className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
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
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Sliders className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
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
                        <p className="mt-2 text-2xl font-bold">{percentage}%</p>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            </div>

            {totalOverflow > 15 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  High total nutrient flexibility ({totalOverflow}%) was needed
                  to find a feasible solution. Consider adding more diverse
                  foods to your selection for better nutrient balance.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Utensils className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                  Daily Portions
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(results, selectedFoods)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader
                    style={{ position: "sticky", top: 0, zIndex: 10 }}
                  >
                    <TableRow>
                      {(
                        [
                          ["food", "Food Item"],
                          ["servingSize", "Serving Size (g)"],
                        ] as const
                      ).map(([key, label]) => (
                        <TableHead
                          key={key}
                          onClick={() => handlePortionsSort(key)}
                          className="no-select cursor-pointer transition-colors hover:bg-muted/50"
                        >
                          {label}
                          {getSortIcon(key)}
                        </TableHead>
                      ))}
                      <TableHead className="w-8 text-center text-muted-foreground" />
                      <TableHead
                        onClick={() => handlePortionsSort("servings")}
                        className="no-select cursor-pointer text-center transition-colors hover:bg-muted/50"
                      >
                        No. of Servings{getSortIcon("servings")}
                      </TableHead>
                      <TableHead className="w-8 text-center text-muted-foreground" />
                      <TableHead
                        onClick={() => handlePortionsSort("totalServing")}
                        className="no-select cursor-pointer text-center transition-colors hover:bg-muted/50"
                      >
                        Total Serving (g){getSortIcon("totalServing")}
                      </TableHead>
                      <TableHead
                        onClick={() => handlePortionsSort("cost")}
                        className="no-select cursor-pointer text-center transition-colors hover:bg-muted/50"
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
                        <TableCell className="text-center text-sm text-muted-foreground opacity-70">
                          ×
                        </TableCell>
                        <TableCell className="text-center">
                          {item.servings}
                        </TableCell>
                        <TableCell className="text-center text-sm text-muted-foreground opacity-70">
                          =
                        </TableCell>
                        <TableCell className="text-center">
                          {item.totalServing.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-center">
                          {item.cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Beef className="h-5 w-5 text-pink-500 dark:text-pink-400" />
                Macronutrient Profile
              </h3>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {macronutrients.map((macro, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <h4 className="text-sm font-medium text-muted-foreground">
                        {macro.name}
                      </h4>
                      <p className="mt-2 text-2xl font-bold">
                        {formatValue(macro.value).toLocaleString("en-US", {
                          maximumFractionDigits: 1,
                        })}{" "}
                        {macro.unit}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Droplets className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Hydration
              </h3>
              <SimpleNutrientCards nutrients={hydration} />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Beaker className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                  Micronutrient Profile
                </h3>
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
                    <LayoutGrid className="h-4 w-4" />
                  ) : (
                    <TableIcon className="h-4 w-4" />
                  )}
                </Button>
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
                {micronutrientTabs.map((tab) => (
                  <TabsContent key={tab.key} value={tab.key}>
                    <div className="relative h-[400px] overflow-y-auto">
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
                              nutrients={tab.data}
                              lowerBounds={lowerBounds}
                              upperBounds={upperBounds}
                              showBoundsInLayout={false}
                            />
                          ) : (
                            <NutrientCards
                              nutrients={tab.data}
                              lowerBounds={lowerBounds}
                              upperBounds={upperBounds}
                              showBoundsInLayout={false}
                            />
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OptimisationResults;
