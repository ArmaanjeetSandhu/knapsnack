import { useEffect, useState } from "react";

export function useNutrientBounds(calculationData) {
  const [customizingBounds, setCustomizingBounds] = useState(false);
  const [adjustedLowerBounds, setAdjustedLowerBounds] = useState({});
  const [adjustedUpperBounds, setAdjustedUpperBounds] = useState({});
  const [useCustomBounds, setUseCustomBounds] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [editingValues, setEditingValues] = useState({});

  useEffect(() => {
    if (calculationData) {
      setAdjustedLowerBounds({ ...calculationData.lower_bounds });
      setAdjustedUpperBounds({ ...calculationData.upper_bounds });
    }
  }, [calculationData]);

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

  const validateInput = (target, value, key) => {
    const val = parseFloat(value);
    let error = null;

    if (isNaN(val) || val < 0 || value === "") {
      error = "Must be a positive number";
    } else {
      const formatValue = (v) =>
        v?.toLocaleString("en-US", { maximumFractionDigits: 1 });

      if (target === "Fibre" && val > calculationData.carbohydrate) {
        error = `Cannot exceed Carbohydrates (${formatValue(calculationData.carbohydrate)}g)`;
      } else if (
        target === "Saturated Fats" &&
        val > calculationData.saturated_fats
      ) {
        error = `Cannot exceed calculated target (${formatValue(calculationData.saturated_fats)}g)`;
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

  return {
    state: {
      customizingBounds,
      adjustedLowerBounds,
      adjustedUpperBounds,
      useCustomBounds,
      validationErrors,
      editingValues,
    },
    actions: {
      setCustomizingBounds,
      handleBoundChange,
      startEditing,
      cancelEditing,
      handleInputChange,
      saveTarget,
      resetBounds,
      handleSave,
      handleCancel,
    },
  };
}
