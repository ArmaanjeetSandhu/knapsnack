import { useEffect, useRef, useState } from "react";

export function useNutrientBounds(calculationData, savedBounds) {
  const [customisingBounds, setCustomisingBounds] = useState(false);

  const [adjustedLowerBounds, setAdjustedLowerBounds] = useState(() => {
    if (savedBounds?.useCustomBounds)
      return { ...savedBounds.adjustedLowerBounds };
    return calculationData ? { ...calculationData.lower_bounds } : {};
  });

  const [adjustedUpperBounds, setAdjustedUpperBounds] = useState(() => {
    if (savedBounds?.useCustomBounds)
      return { ...savedBounds.adjustedUpperBounds };
    return calculationData ? { ...calculationData.upper_bounds } : {};
  });

  const [useCustomBounds, setUseCustomBounds] = useState(() => {
    return !!savedBounds?.useCustomBounds;
  });

  const [validationErrors, setValidationErrors] = useState({});
  const [editingValues, setEditingValues] = useState({});

  const prevCalculationData = useRef(calculationData);

  const boundsSnapshot = useRef({
    lower: {},
    upper: {},
    useCustom: false,
    errors: {},
  });

  useEffect(() => {
    if (calculationData && calculationData !== prevCalculationData.current) {
      setAdjustedLowerBounds({ ...calculationData.lower_bounds });
      setAdjustedUpperBounds({ ...calculationData.upper_bounds });
      setUseCustomBounds(false);
      prevCalculationData.current = calculationData;
    }
  }, [calculationData]);

  const validateBounds = (nutrientKey, boundsType, value) => {
    const errors = { ...validationErrors };
    const lowerKey = `${nutrientKey}-lower`;
    const upperKey = `${nutrientKey}-upper`;

    delete errors[lowerKey];
    delete errors[upperKey];
    delete errors[nutrientKey];

    let lower =
      boundsType === "lower" ? value : adjustedLowerBounds[nutrientKey];
    let upper =
      boundsType === "upper" ? value : adjustedUpperBounds[nutrientKey];

    const isEmpty = (val) =>
      val === "" ||
      val === undefined ||
      (typeof val === "number" && isNaN(val));

    const isLowerEmpty = isEmpty(lower);
    const isUpperEmpty = isEmpty(upper);

    let error = null;

    if (isLowerEmpty && isUpperEmpty) {
      error = "At least one bound is required";
      errors[lowerKey] = error;
      errors[upperKey] = error;
    } else if (!isLowerEmpty && !isUpperEmpty) {
      if (lower > upper) {
        if (boundsType === "lower")
          errors[lowerKey] = "Lower bound cannot exceed upper bound";
        else errors[upperKey] = "Upper bound cannot be less than lower bound";
      }
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

    if (isNaN(val) || value === "") error = "Must be a positive number";
    else {
      const formatValue = (v) =>
        v?.toLocaleString("en-US", { maximumFractionDigits: 1 });

      if (target === "Fibre" && val > calculationData.carbohydrate)
        error = `Cannot exceed Carbohydrates (${formatValue(
          calculationData.carbohydrate,
        )}g)`;
      else if (
        target === "Saturated Fats" &&
        val > calculationData.saturated_fats
      )
        error = `Cannot exceed calculated target (${formatValue(
          calculationData.saturated_fats,
        )}g)`;
    }

    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      if (error) newErrors[key] = error;
      else delete newErrors[key];
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

  const resetToSystemDefault = (target) => {
    let defaultValue;
    if (target === "Fibre") defaultValue = calculationData.fibre;
    else if (target === "Saturated Fats")
      defaultValue = calculationData.saturated_fats;
    else if (target === "Water")
      defaultValue = calculationData.lower_bounds?.["Water (mL)"] || 0;

    if (defaultValue !== undefined) {
      setEditingValues((prev) => ({ ...prev, [target]: defaultValue }));

      const keyMap = {
        Fibre: "Fibre (g)",
        "Saturated Fats": "Saturated Fats (g)",
        Water: "Water (mL)",
      };

      if (keyMap[target]) validateInput(target, defaultValue, keyMap[target]);
    }
  };

  const saveTarget = (target, key, boundType) => {
    const valString = editingValues[target];
    const isValid = validateInput(target, valString, key);

    if (!isValid) return;

    const val = parseFloat(valString);
    if (boundType === "lower")
      setAdjustedLowerBounds((prev) => ({ ...prev, [key]: val }));
    else setAdjustedUpperBounds((prev) => ({ ...prev, [key]: val }));

    setUseCustomBounds(true);
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });
  };

  const resetBounds = () => {
    const preservedKeys = ["Fibre (g)", "Saturated Fats (g)", "Water (mL)"];

    setAdjustedLowerBounds((prev) => {
      const next = { ...calculationData.lower_bounds };
      preservedKeys.forEach((key) => {
        if (prev[key] !== undefined) next[key] = prev[key];
      });
      return next;
    });

    setAdjustedUpperBounds((prev) => {
      const next = { ...calculationData.upper_bounds };
      preservedKeys.forEach((key) => {
        if (prev[key] !== undefined) next[key] = prev[key];
      });
      return next;
    });

    setValidationErrors((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        if (preservedKeys.some((pk) => key.includes(pk))) next[key] = prev[key];
      });
      return next;
    });
  };

  const handleSave = () => {
    if (Object.keys(validationErrors).length === 0) {
      setUseCustomBounds(true);
      setCustomisingBounds(false);
    }
  };

  const startCustomising = () => {
    boundsSnapshot.current = {
      lower: { ...adjustedLowerBounds },
      upper: { ...adjustedUpperBounds },
      useCustom: useCustomBounds,
      errors: { ...validationErrors },
    };
    setCustomisingBounds(true);
  };

  const handleCancel = () => {
    setAdjustedLowerBounds(boundsSnapshot.current.lower);
    setAdjustedUpperBounds(boundsSnapshot.current.upper);
    setUseCustomBounds(boundsSnapshot.current.useCustom);
    setValidationErrors(boundsSnapshot.current.errors);

    setCustomisingBounds(false);
  };

  return {
    state: {
      customisingBounds,
      adjustedLowerBounds,
      adjustedUpperBounds,
      useCustomBounds,
      validationErrors,
      editingValues,
    },
    actions: {
      setCustomisingBounds: (value) => {
        if (value) startCustomising();
        else handleCancel();
      },
      handleBoundChange,
      startEditing,
      cancelEditing,
      handleInputChange,
      resetToSystemDefault,
      saveTarget,
      resetBounds,
      handleSave,
      handleCancel,
    },
  };
}
