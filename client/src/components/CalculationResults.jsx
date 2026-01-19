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
  RotateCcw,
  Target,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NutrientCards, NutrientTable } from "./NutrientDisplay";
import { Alert, AlertDescription } from "./ui/alert";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const CalculationResults = ({ calculationData, onProceed, onRecalculate }) => {
  const [nutrientDisplayMode, setNutrientDisplayMode] = useState("table");
  const [customizingBounds, setCustomizingBounds] = useState(false);
  const [adjustedLowerBounds, setAdjustedLowerBounds] = useState({});
  const [adjustedUpperBounds, setAdjustedUpperBounds] = useState({});
  const [useCustomBounds, setUseCustomBounds] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [editingValues, setEditingValues] = useState({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    setAdjustedLowerBounds({ ...calculationData.lower_bounds });
    setAdjustedUpperBounds({ ...calculationData.upper_bounds });
  }, [calculationData]);

  const formatValue = (value) => {
    return typeof value === "number"
      ? value.toLocaleString("en-US", {
          maximumFractionDigits: 1,
        })
      : value;
  };

  const handleBoundChange = (nutrientKey, boundsType, value) => {
    const numValue = parseFloat(value);
    const bounds =
      boundsType === "lower" ? adjustedLowerBounds : adjustedUpperBounds;
    const setBounds =
      boundsType === "lower" ? setAdjustedLowerBounds : setAdjustedUpperBounds;
    setBounds({
      ...bounds,
      [nutrientKey]: isNaN(numValue) ? "" : numValue,
    });
    validateBounds(nutrientKey, boundsType, numValue);
  };

  const validateBounds = (nutrientKey, boundsType, value) => {
    const errors = { ...validationErrors };
    delete errors[nutrientKey];
    if (isNaN(value) || value === "") {
      errors[nutrientKey] = "Value must be a number";
    } else if (value < 0) {
      errors[nutrientKey] = "Value cannot be negative";
    } else if (
      boundsType === "lower" &&
      adjustedUpperBounds[nutrientKey] !== undefined &&
      value > adjustedUpperBounds[nutrientKey]
    ) {
      errors[nutrientKey] = "Lower bound cannot exceed upper bound";
    } else if (
      boundsType === "upper" &&
      adjustedLowerBounds[nutrientKey] !== undefined &&
      value < adjustedLowerBounds[nutrientKey]
    ) {
      errors[nutrientKey] = "Upper bound cannot be less than lower bound";
    }
    setValidationErrors(errors);
  };

  const startEditing = (target, currentValue) => {
    setEditingValues((prev) => ({ ...prev, [target]: currentValue }));
  };

  const cancelEditing = (target) => {
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });

    setValidationErrors((prev) => {
      const next = { ...prev };
      const keyMap = {
        Fibre: "Fibre (g)",
        "Saturated Fats": "Saturated Fats (g)",
        Water: "Water (mL)",
      };
      if (keyMap[target]) delete next[keyMap[target]];
      return next;
    });
  };

  const validateInput = (target, value, key) => {
    const val = parseFloat(value);
    let error = null;

    if (isNaN(val) || val < 0 || value === "") {
      error = "Must be a positive number";
    } else {
      if (target === "Fibre" && val > calculationData.carbohydrate) {
        error = `Cannot exceed Carbohydrates (${formatValue(
          calculationData.carbohydrate,
        )}g)`;
      } else if (
        target === "Saturated Fats" &&
        val > calculationData.saturated_fats
      ) {
        error = `Cannot exceed calculated target (${formatValue(
          calculationData.saturated_fats,
        )}g)`;
      }
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[key] = error;
      } else {
        delete newErrors[key];
      }
      return newErrors;
    });

    return !error;
  };

  const handleInputChange = (e, target, key) => {
    const newVal = e.target.value;
    setEditingValues((prev) => ({ ...prev, [target]: newVal }));
    validateInput(target, newVal, key);
  };

  const saveTarget = (target, key, boundType) => {
    const valString = editingValues[target];
    const isValid = validateInput(target, valString, key);

    if (!isValid) return;

    const val = parseFloat(valString);

    if (boundType === "lower") {
      setAdjustedLowerBounds((prev) => ({ ...prev, [key]: val }));
    } else {
      setAdjustedUpperBounds((prev) => ({ ...prev, [key]: val }));
    }

    setUseCustomBounds(true);
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });
  };

  const resetBounds = () => {
    setAdjustedLowerBounds({ ...calculationData.lower_bounds });
    setAdjustedUpperBounds({ ...calculationData.upper_bounds });
    setValidationErrors({});
    setEditingValues({});
  };

  const handleSave = () => {
    if (Object.keys(validationErrors).length === 0) {
      setUseCustomBounds(true);
      setCustomizingBounds(false);
    }
  };

  const handleCancel = () => {
    setAdjustedLowerBounds({ ...calculationData.lower_bounds });
    setAdjustedUpperBounds({ ...calculationData.upper_bounds });
    setValidationErrors({});
    setUseCustomBounds(false);
    setCustomizingBounds(false);
  };

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

  const mainMetrics = [
    {
      icon: Flame,
      label: "Basal Metabolic Rate (BMR)",
      value: `${formatValue(calculationData.bmr)} kcal/day`,
      color: "text-orange-500 dark:text-orange-400",
    },
    {
      icon: Activity,
      label: "Total Daily Energy Expenditure (TDEE)",
      value: `${formatValue(calculationData.tdee)} kcal/day`,
      color: "text-blue-500 dark:text-blue-400",
    },
    {
      icon: Target,
      label: "Daily Caloric Target",
      value: `${formatValue(calculationData.daily_caloric_intake)} kcal/day`,
      color: "text-green-500 dark:text-green-400",
    },
  ];

  const macroNutrients = [
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

  const vitamins = [
    { name: "Vitamin A", key: "Vitamin A (µg)", unit: "µg" },
    { name: "Vitamin C", key: "Vitamin C (mg)", unit: "mg" },
    { name: "Vitamin E", key: "Vitamin E (mg)", unit: "mg" },
    { name: "Vitamin K", key: "Vitamin K (µg)", unit: "µg" },
    { name: "Thiamin", key: "Thiamin (mg)", unit: "mg" },
    { name: "Riboflavin", key: "Riboflavin (mg)", unit: "mg" },
    { name: "Niacin", key: "Niacin (mg)", unit: "mg" },
    { name: "Vitamin B6", key: "Vitamin B6 (mg)", unit: "mg" },
    { name: "Folate", key: "Folate (µg)", unit: "µg" },
    { name: "Pantothenic Acid", key: "Pantothenic Acid (mg)", unit: "mg" },
  ];

  const minerals = [
    { name: "Calcium", key: "Calcium (mg)", unit: "mg" },
    { name: "Iron", key: "Iron (mg)", unit: "mg" },
    { name: "Magnesium", key: "Magnesium (mg)", unit: "mg" },
    { name: "Manganese", key: "Manganese (mg)", unit: "mg" },
    { name: "Phosphorus", key: "Phosphorus (mg)", unit: "mg" },
    { name: "Selenium", key: "Selenium (µg)", unit: "µg" },
    { name: "Zinc", key: "Zinc (mg)", unit: "mg" },
    { name: "Potassium", key: "Potassium (mg)", unit: "mg" },
    { name: "Sodium", key: "Sodium (mg)", unit: "mg" },
  ];

  const others = [{ name: "Choline", key: "Choline (mg)", unit: "mg" }];

  const renderNutrientTable = (nutrients) => (
    <NutrientTable
      nutrients={nutrients}
      lowerBounds={
        useCustomBounds ? adjustedLowerBounds : calculationData.lower_bounds
      }
      upperBounds={
        useCustomBounds ? adjustedUpperBounds : calculationData.upper_bounds
      }
    />
  );

  const renderNutrientCards = (nutrients) => (
    <NutrientCards
      nutrients={nutrients}
      lowerBounds={
        useCustomBounds ? adjustedLowerBounds : calculationData.lower_bounds
      }
      upperBounds={
        useCustomBounds ? adjustedUpperBounds : calculationData.upper_bounds
      }
    />
  );

  const renderEditableBoundsTable = (nutrients) => (
    <div className="space-y-4">
      {Object.keys(validationErrors).length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert variant="destructive">
            <AlertDescription>
              Please fix the errors before saving your changes.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
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
            {nutrients.map((nutrient, index) => (
              <motion.tr
                key={nutrient.key}
                className={
                  validationErrors[nutrient.key]
                    ? "bg-red-50 dark:bg-red-900/20"
                    : ""
                }
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.03,
                  ease: "easeOut",
                }}
              >
                <TableCell>
                  {nutrient.name} ({nutrient.unit})
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={
                      adjustedLowerBounds[nutrient.key] !== undefined
                        ? adjustedLowerBounds[nutrient.key]
                        : ""
                    }
                    onChange={(e) =>
                      handleBoundChange(nutrient.key, "lower", e.target.value)
                    }
                    className={`w-[100px] ${
                      validationErrors[nutrient.key] ? "border-red-500" : ""
                    }`}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    value={
                      adjustedUpperBounds[nutrient.key] !== undefined
                        ? adjustedUpperBounds[nutrient.key]
                        : ""
                    }
                    onChange={(e) =>
                      handleBoundChange(nutrient.key, "upper", e.target.value)
                    }
                    className={`w-[100px] ${
                      validationErrors[nutrient.key] ? "border-red-500" : ""
                    }`}
                  />
                  {validationErrors[nutrient.key] && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-xs text-red-500 mt-1"
                    >
                      {validationErrors[nutrient.key]}
                    </motion.p>
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );

  return (
    <motion.div
      className="space-y-6"
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
                      <metric.icon className={`w-8 h-8 ${metric.color}`} />
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
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Beef className="w-5 h-5 text-green-500 dark:text-green-400" />
              Macronutrient Targets
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {macroNutrients.map((macro, index) => {
                const isEditable =
                  macro.label === "Fibre" || macro.label === "Saturated Fats";
                const isEditing = editingValues[macro.label] !== undefined;

                let boundKey = null;
                let boundType = null;
                let currentValue = macro.value;

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

                  if (useCustomBounds && bounds[boundKey] != null) {
                    currentValue = bounds[boundKey];
                  }
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
                    className="p-4 rounded-lg border bg-card text-card-foreground relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {macro.label}
                        </p>
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="editing"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <div className="flex items-center gap-2 text-2xl font-bold">
                                {macro.label === "Fibre" && "≥"}
                                {macro.label === "Saturated Fats" && "≤"}
                                <Input
                                  type="number"
                                  value={editingValues[macro.label] ?? ""}
                                  onChange={(e) =>
                                    handleInputChange(e, macro.label, boundKey)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    saveTarget(macro.label, boundKey, boundType)
                                  }
                                  className={`h-9 w-24 text-base ${
                                    validationErrors[boundKey]
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                  autoFocus
                                  step="1"
                                />
                                <span className="text-xl font-normal text-muted-foreground">
                                  {macro.unit}
                                </span>
                              </div>
                              {validationErrors[boundKey] && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="text-xs text-red-500 mt-1 font-medium"
                                >
                                  {validationErrors[boundKey]}
                                </motion.p>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="display"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <p className="text-2xl font-bold">
                                {macro.label === "Fibre" && "≥ "}
                                {macro.label === "Saturated Fats" && "≤ "}
                                {formatValue(currentValue)}
                                {macro.unit}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {isEditable && (
                        <div className="flex gap-2 ml-2">
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
                                  size="icon"
                                  className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white"
                                  onClick={() =>
                                    saveTarget(macro.label, boundKey, boundType)
                                  }
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
                                  onClick={() => cancelEditing(macro.label)}
                                >
                                  <X className="w-4 h-4" />
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
                                    startEditing(macro.label, currentValue)
                                  }
                                >
                                  <Edit className="w-4 h-4" />
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
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Hydration Target
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(() => {
                const waterKey = "Water (mL)";
                const isEditing = editingValues["Water"] !== undefined;
                const currentValue =
                  useCustomBounds && adjustedLowerBounds[waterKey] != null
                    ? adjustedLowerBounds[waterKey]
                    : calculationData.lower_bounds?.[waterKey] || 0;

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      delay: 0.35,
                      ease: "easeOut",
                    }}
                    className="p-4 rounded-lg border bg-card text-card-foreground relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          Water
                        </p>
                        <AnimatePresence mode="wait">
                          {isEditing ? (
                            <motion.div
                              key="editing-water"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <div className="flex items-center gap-2 text-2xl font-bold">
                                ≥
                                <Input
                                  type="number"
                                  value={editingValues["Water"] ?? ""}
                                  onChange={(e) =>
                                    handleInputChange(e, "Water", waterKey)
                                  }
                                  onKeyDown={(e) =>
                                    e.key === "Enter" &&
                                    saveTarget("Water", waterKey, "lower")
                                  }
                                  className={`h-9 w-24 text-base ${
                                    validationErrors[waterKey]
                                      ? "border-red-500 focus-visible:ring-red-500"
                                      : ""
                                  }`}
                                  autoFocus
                                  step="50"
                                />
                                <span className="text-xl font-normal text-muted-foreground">
                                  mL
                                </span>
                              </div>
                              {validationErrors[waterKey] && (
                                <motion.p
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  className="text-xs text-red-500 mt-1 font-medium"
                                >
                                  {validationErrors[waterKey]}
                                </motion.p>
                              )}
                            </motion.div>
                          ) : (
                            <motion.div
                              key="display-water"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                            >
                              <p className="text-2xl font-bold">
                                ≥ {formatValue(currentValue)} mL
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="flex gap-2 ml-2">
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
                                size="icon"
                                className="h-6 w-6 bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() =>
                                  saveTarget("Water", waterKey, "lower")
                                }
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                className="h-6 w-6 bg-red-500 hover:bg-red-600 text-white"
                                onClick={() => cancelEditing("Water")}
                              >
                                <X className="w-4 h-4" />
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
                                  startEditing("Water", currentValue)
                                }
                              >
                                <Edit className="w-4 h-4" />
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Beaker className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                Micronutrient Targets
              </h3>
              <div className="flex items-center gap-2">
                {!customizingBounds && (
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
                        variant={
                          nutrientDisplayMode === "cards"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setNutrientDisplayMode("cards")}
                      >
                        Cards
                      </Button>
                      <Button
                        variant={
                          nutrientDisplayMode === "table"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => setNutrientDisplayMode("table")}
                      >
                        Table
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCustomizingBounds(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Customize
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
                {customizingBounds && (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key="customize-controls"
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Button variant="outline" size="sm" onClick={resetBounds}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleSave}
                        disabled={Object.keys(validationErrors).length > 0}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleCancel}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
            <AnimatePresence mode="wait">
              {customizingBounds ? (
                <motion.div
                  key="customizing-bounds"
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
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
                    <AnimatePresence mode="wait">
                      <TabsContent value="vitamins">
                        <div className="h-[400px] overflow-y-auto relative">
                          {renderEditableBoundsTable(vitamins)}
                        </div>
                      </TabsContent>
                      <TabsContent value="minerals">
                        <div className="h-[400px] overflow-y-auto relative">
                          {renderEditableBoundsTable(minerals)}
                        </div>
                      </TabsContent>
                      <TabsContent value="others">
                        <div className="h-[400px] overflow-y-auto relative">
                          {renderEditableBoundsTable(others)}
                        </div>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </motion.div>
              ) : (
                <motion.div
                  key="viewing-bounds"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
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
                    <AnimatePresence mode="wait">
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
                              {nutrientDisplayMode === "table"
                                ? renderNutrientTable(vitamins)
                                : renderNutrientCards(vitamins)}
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
                              {nutrientDisplayMode === "table"
                                ? renderNutrientTable(minerals)
                                : renderNutrientCards(minerals)}
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
                              {nutrientDisplayMode === "table"
                                ? renderNutrientTable(others)
                                : renderNutrientCards(others)}
                            </motion.div>
                          </AnimatePresence>
                        </div>
                      </TabsContent>
                    </AnimatePresence>
                  </Tabs>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
          <RotateCcw className="w-5 h-5 mr-2" />
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
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default CalculationResults;
