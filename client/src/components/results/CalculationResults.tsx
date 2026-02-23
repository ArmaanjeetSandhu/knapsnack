import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Beaker,
  Beef,
  Check,
  Droplets,
  Edit,
  Flame,
  LayoutGrid,
  RotateCcw,
  Table as TableIcon,
  Target,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  MINERALS_CONFIG,
  OTHERS_CONFIG,
  VITAMINS_CONFIG,
  type NutrientConfig,
} from "../../config/nutrientData";
import type {
  CalculationData,
  SavedBounds,
} from "../../hooks/useNutrientBounds";
import { useNutrientBounds } from "../../hooks/useNutrientBounds";
import type { NutrientMap } from "../../services/api";
import {
  preventInvalidFloatChars,
  preventInvalidIntegerChars,
  validateMaxTwoDecimals,
} from "../../lib/utils";
import { NutrientCards, NutrientTable } from "../nutrients/NutrientDisplay";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ProceedPayload {
  useCustomBounds: boolean;
  adjustedLowerBounds: NutrientMap;
  adjustedUpperBounds: NutrientMap;
}

interface CalculationResultsProps {
  calculationData: CalculationData;
  onProceed: (payload: ProceedPayload) => void;
  onRecalculate: () => void;
  savedBounds?: SavedBounds | null;
}

type NutrientDisplayMode = "table" | "cards";
type BoundType = "lower" | "upper";

interface MacroEntry {
  label: string;
  value: number;
  unit: string;
}

interface MetricEntry {
  icon: LucideIcon;
  label: string;
  value: string;
  color: string;
}

const CalculationResults = ({
  calculationData,
  onProceed,
  onRecalculate,
  savedBounds,
}: CalculationResultsProps) => {
  const [nutrientDisplayMode, setNutrientDisplayMode] =
    useState<NutrientDisplayMode>(() =>
      typeof window !== "undefined" && window.innerWidth < 768
        ? "cards"
        : "table",
    );

  const resultsRef = useRef<HTMLDivElement>(null);
  const { state, actions } = useNutrientBounds(calculationData, savedBounds);

  const {
    customisingBounds,
    adjustedLowerBounds,
    adjustedUpperBounds,
    useCustomBounds,
    validationErrors,
    editingValues,
  } = state;

  useEffect(() => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleProceed = () => {
    if (Object.keys(validationErrors).length === 0) {
      onProceed({
        useCustomBounds,
        adjustedLowerBounds: useCustomBounds
          ? adjustedLowerBounds
          : calculationData.lower_bounds,
        adjustedUpperBounds: useCustomBounds
          ? adjustedUpperBounds
          : calculationData.upper_bounds,
      });
    }
  };

  const mainMetrics: MetricEntry[] = [
    {
      icon: Flame,
      label: "Basal Metabolic Rate (BMR)",
      value: `${calculationData.bmr} kcal/day`,
      color: "text-orange-500 dark:text-orange-400",
    },
    {
      icon: Activity,
      label: "Total Daily Energy Expenditure (TDEE)",
      value: `${calculationData.tdee} kcal/day`,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      icon: Target,
      label: "Daily Caloric Target",
      value: `${calculationData.daily_caloric_intake} kcal/day`,
      color: "text-green-500 dark:text-green-400",
    },
  ];

  const macroNutrients: MacroEntry[] = [
    { label: "Protein", value: calculationData.protein, unit: "g" },
    { label: "Carbohydrates", value: calculationData.carbohydrate, unit: "g" },
    { label: "Fats", value: calculationData.fats, unit: "g" },
    { label: "Fibre", value: calculationData.fibre, unit: "g" },
    {
      label: "Saturated Fats",
      value: calculationData.saturated_fats,
      unit: "g",
    },
  ];

  const activeLowerBounds = useCustomBounds
    ? adjustedLowerBounds
    : calculationData.lower_bounds;
  const activeUpperBounds = useCustomBounds
    ? adjustedUpperBounds
    : calculationData.upper_bounds;

  const renderNutrientTable = (nutrients: NutrientConfig[]) => (
    <NutrientTable
      nutrients={nutrients}
      lowerBounds={activeLowerBounds}
      upperBounds={activeUpperBounds}
    />
  );

  const renderNutrientCards = (nutrients: NutrientConfig[]) => (
    <NutrientCards
      nutrients={nutrients}
      lowerBounds={activeLowerBounds}
      upperBounds={activeUpperBounds}
    />
  );

  const renderEditableBoundsTable = (nutrients: NutrientConfig[]) => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <TableRow>
              <TableHead>Nutrient</TableHead>
              <TableHead>Lower Bound</TableHead>
              <TableHead>Upper Bound</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nutrients.map((nutrient, index) => {
              const lowerError = validationErrors[`${nutrient.key}-lower`];
              const upperError = validationErrors[`${nutrient.key}-upper`];
              const hasError = lowerError || upperError;

              return (
                <motion.tr
                  key={nutrient.key}
                  className={hasError ? "bg-red-50 dark:bg-red-900/20" : ""}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: index * 0.03,
                    ease: "easeOut",
                  }}
                >
                  <TableCell className="align-top">
                    {nutrient.name} ({nutrient.unit})
                  </TableCell>
                  {(["lower", "upper"] as BoundType[]).map((boundType) => {
                    const isLower = boundType === "lower";
                    const currentBounds = isLower
                      ? adjustedLowerBounds
                      : adjustedUpperBounds;
                    const error = isLower ? lowerError : upperError;

                    return (
                      <TableCell key={boundType} className="align-top">
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={currentBounds[nutrient.key] ?? ""}
                          onChange={(e) => {
                            if (validateMaxTwoDecimals(e.target.value)) {
                              actions.handleBoundChange(
                                nutrient.key,
                                boundType,
                                e.target.value,
                              );
                            }
                          }}
                          onKeyDown={preventInvalidFloatChars}
                          className={`w-[100px] ${error ? "border-red-500" : ""}`}
                        />
                        {error && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 text-xs text-red-500"
                          >
                            {error}
                          </motion.p>
                        )}
                      </TableCell>
                    );
                  })}
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  const nutrientCategories = [
    { key: "vitamins", data: VITAMINS_CONFIG },
    { key: "minerals", data: MINERALS_CONFIG },
    { key: "others", data: OTHERS_CONFIG },
  ] as const;

  return (
    <motion.div
      ref={resultsRef}
      className="scroll-mt-4 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Calculated Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            {mainMetrics.map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.15,
                  ease: "easeOut",
                }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <metric.icon className={`h-8 w-8 ${metric.color}`} />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Beef className="h-5 w-5 text-pink-500 dark:text-pink-400" />
              Macronutrient Targets
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {macroNutrients.map((macro, index) => {
                const isEditable =
                  macro.label === "Fibre" || macro.label === "Saturated Fats";
                const isEditing = editingValues[macro.label] !== undefined;

                let boundKey: string | null = null;
                let boundType: BoundType | null = null;
                let currentValue: number = macro.value;

                if (isEditable) {
                  boundKey =
                    macro.label === "Fibre"
                      ? "Fibre (g)"
                      : "Saturated Fats (g)";
                  boundType = macro.label === "Fibre" ? "lower" : "upper";
                  const bounds =
                    boundType === "lower"
                      ? adjustedLowerBounds
                      : adjustedUpperBounds;
                  if (useCustomBounds && bounds[boundKey] != null)
                    currentValue = bounds[boundKey];
                }

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05 + 0.3,
                      ease: "easeOut",
                    }}
                    className="group relative rounded-lg border bg-card p-4 text-card-foreground"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium text-muted-foreground ${isEditing ? "mb-3" : "mb-1"}`}
                        >
                          {macro.label}
                        </p>
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="editing"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="flex items-center gap-2 text-2xl font-bold">
                                {macro.label === "Fibre" && "≥"}
                                {macro.label === "Saturated Fats" && "≤"}
                                <Input
                                  type="number"
                                  value={editingValues[macro.label] ?? ""}
                                  onChange={(e) => {
                                    if (
                                      validateMaxTwoDecimals(e.target.value) &&
                                      boundKey
                                    )
                                      actions.handleInputChange(
                                        e,
                                        macro.label,
                                        boundKey,
                                      );
                                  }}
                                  onKeyDown={(e) => {
                                    preventInvalidFloatChars(e);
                                    if (
                                      e.key === "Enter" &&
                                      boundKey &&
                                      boundType
                                    )
                                      actions.saveTarget(
                                        macro.label,
                                        boundKey,
                                        boundType,
                                      );
                                    else if (e.key === "Escape")
                                      actions.cancelEditing(macro.label);
                                  }}
                                  className={`w-[100px] ${
                                    boundKey && validationErrors[boundKey]
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                  autoFocus
                                  step="1"
                                />
                                <span className="text-xl font-bold">
                                  {macro.unit}
                                </span>
                              </div>
                              {boundKey && validationErrors[boundKey] && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-4 text-xs font-medium text-red-500"
                                >
                                  {validationErrors[boundKey]}
                                </motion.p>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="display"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.4 }}
                            >
                              <p className="text-2xl font-bold">
                                {macro.label === "Fibre" && "≥ "}
                                {macro.label === "Saturated Fats" && "≤ "}
                                {currentValue} {macro.unit}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {isEditable && (
                        <div className="ml-2 flex gap-2">
                          <AnimatePresence mode="wait">
                            {isEditing ? (
                              <motion.div
                                key="actions"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex gap-1"
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    actions.resetToSystemDefault(macro.label)
                                  }
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  onClick={() => {
                                    if (boundKey && boundType)
                                      actions.saveTarget(
                                        macro.label,
                                        boundKey,
                                        boundType,
                                      );
                                  }}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                  onClick={() =>
                                    actions.cancelEditing(macro.label)
                                  }
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            ) : (
                              <motion.div
                                key="edit"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    actions.startEditing(
                                      macro.label,
                                      currentValue,
                                    )
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
              <Droplets className="h-5 w-5 text-blue-500 dark:text-blue-400" />
              Hydration Target
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const waterKey = "Water (mL)";
                const isEditing = editingValues["Water"] !== undefined;
                const currentValue =
                  useCustomBounds && adjustedLowerBounds[waterKey] != null
                    ? adjustedLowerBounds[waterKey]
                    : (calculationData.lower_bounds?.[waterKey] ?? 0);

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.35, ease: "easeOut" }}
                    className="group relative rounded-lg border bg-card p-4 text-card-foreground"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium text-muted-foreground ${isEditing ? "mb-3" : "mb-1"}`}
                        >
                          Water
                        </p>
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="editing-water"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.4 }}
                            >
                              <div className="flex items-center gap-2 text-2xl font-bold">
                                ≥
                                <Input
                                  type="number"
                                  value={editingValues["Water"] ?? ""}
                                  onChange={(e) => {
                                    if (validateMaxTwoDecimals(e.target.value))
                                      actions.handleInputChange(
                                        e,
                                        "Water",
                                        waterKey,
                                      );
                                  }}
                                  onKeyDown={(e) => {
                                    preventInvalidIntegerChars(e);
                                    if (e.key === "Enter")
                                      actions.saveTarget(
                                        "Water",
                                        waterKey,
                                        "lower",
                                      );
                                    else if (e.key === "Escape")
                                      actions.cancelEditing("Water");
                                  }}
                                  className={`w-[100px] ${
                                    validationErrors[waterKey]
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                  autoFocus
                                  step="50"
                                />
                                <span className="text-xl font-bold">mL</span>
                              </div>
                              {validationErrors[waterKey] && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="mt-4 text-xs font-medium text-red-500"
                                >
                                  {validationErrors[waterKey]}
                                </motion.p>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="display-water"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.4 }}
                            >
                              <p className="text-2xl font-bold">
                                ≥ {currentValue} mL
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      <div className="ml-2 flex gap-2">
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="actions-water"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="flex gap-1"
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  actions.resetToSystemDefault("Water")
                                }
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  actions.saveTarget("Water", waterKey, "lower")
                                }
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() => actions.cancelEditing("Water")}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="edit-water"
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  actions.startEditing("Water", currentValue)
                                }
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          </motion.div>

          <motion.div
            className="mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Beaker className="h-5 w-5 text-purple-500 dark:text-purple-400" />
                Micronutrient Targets
              </h3>
              <div className="flex items-center gap-2">
                {!customisingBounds && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="normal-controls"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => actions.setCustomisingBounds(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
                {customisingBounds && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="customise-controls"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={actions.resetBounds}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={actions.handleSave}
                        disabled={Object.keys(validationErrors).length > 0}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={actions.handleCancel}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
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
                {nutrientCategories.map((category) => (
                  <TabsContent key={category.key} value={category.key}>
                    <div className="relative h-[400px] overflow-y-auto">
                      <AnimatePresence mode="wait">
                        {customisingBounds ? (
                          <motion.div
                            key="editing"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            transition={{ duration: 0.4 }}
                          >
                            {renderEditableBoundsTable(category.data)}
                          </motion.div>
                        ) : (
                          <motion.div
                            key={nutrientDisplayMode}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                          >
                            {nutrientDisplayMode === "table"
                              ? renderNutrientTable(category.data)
                              : renderNutrientCards(category.data)}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>

      <motion.div
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Button
          variant="outline"
          size="lg"
          onClick={onRecalculate}
          className="w-full"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Modify Personal Info
        </Button>
        <Button
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90"
          size="lg"
          onClick={handleProceed}
        >
          <span>
            {useCustomBounds
              ? "Proceed with Custom Nutrient Bounds"
              : "Ready to meet all these goals?"}
          </span>
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CalculationResults;
