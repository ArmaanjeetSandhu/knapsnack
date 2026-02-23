import { useRef, useState } from "react";

function getInitialBounds(calculationData, savedBounds) {
  if (savedBounds?.useCustomBounds)
    return {
      lower: { ...savedBounds.adjustedLowerBounds },
      upper: { ...savedBounds.adjustedUpperBounds },
      useCustom: true,
    };
  return {
    lower: calculationData ? { ...calculationData.lower_bounds } : {},
    upper: calculationData ? { ...calculationData.upper_bounds } : {},
    useCustom: false,
  };
}

export function useNutrientBounds(calculationData, savedBounds) {
  const [customisingBounds, setCustomisingBounds] = useState(false);

  const [bounds, setBounds] = useState(() =>
    getInitialBounds(calculationData, savedBounds),
  );

  const [validationErrors, setValidationErrors] = useState({});
  const [editingValues, setEditingValues] = useState({});

  const [prevCalculationData, setPrevCalculationData] =
    useState(calculationData);
  if (calculationData !== prevCalculationData && calculationData) {
    setPrevCalculationData(calculationData);
    setBounds({
      lower: { ...calculationData.lower_bounds },
      upper: { ...calculationData.upper_bounds },
      useCustom: false,
    });
  }

  const boundsSnapshot = useRef({
    lower: {},
    upper: {},
    useCustom: false,
    errors: {},
  });

  const validateBounds = (nutrientKey, boundsType, value) => {
    const errors = { ...validationErrors };
    const lowerKey = `${nutrientKey}-lower`;
    const upperKey = `${nutrientKey}-upper`;

    delete errors[lowerKey];
    delete errors[upperKey];
    delete errors[nutrientKey];

    const lower = boundsType === "lower" ? value : bounds.lower[nutrientKey];
    const upper = boundsType === "upper" ? value : bounds.upper[nutrientKey];

    const isEmpty = (val) =>
      val === "" ||
      val === undefined ||
      (typeof val === "number" && isNaN(val));

    const isLowerEmpty = isEmpty(lower);
    const isUpperEmpty = isEmpty(upper);

    if (isLowerEmpty && isUpperEmpty) {
      const msg = "At least one bound is required";
      errors[lowerKey] = msg;
      errors[upperKey] = msg;
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
    setBounds((prev) => ({
      ...prev,
      [boundsType === "lower" ? "lower" : "upper"]: {
        ...(boundsType === "lower" ? prev.lower : prev.upper),
        [nutrientKey]: isNaN(numValue) ? "" : numValue,
      },
    }));
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

  const getCanonicalOriginalBounds = () => ({
    lower: {
      ...calculationData.lower_bounds,
      "Fibre (g)": calculationData.fibre,
    },
    upper: {
      ...calculationData.upper_bounds,
      "Saturated Fats (g)": calculationData.saturated_fats,
    },
  });

  const areBoundsChanged = (newLower, newUpper) => {
    const { lower: originalLower, upper: originalUpper } =
      getCanonicalOriginalBounds();
    return (
      Object.keys(newLower).some((k) => newLower[k] !== originalLower[k]) ||
      Object.keys(newUpper).some((k) => newUpper[k] !== originalUpper[k])
    );
  };

  const saveTarget = (target, key, boundType) => {
    const valString = editingValues[target];
    const isValid = validateInput(target, valString, key);

    if (!isValid) return;

    const val = parseFloat(valString);

    const newLower =
      boundType === "lower" ? { ...bounds.lower, [key]: val } : bounds.lower;
    const newUpper =
      boundType === "upper" ? { ...bounds.upper, [key]: val } : bounds.upper;

    setBounds({
      lower: newLower,
      upper: newUpper,
      useCustom: areBoundsChanged(newLower, newUpper),
    });

    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });
  };

  const resetBounds = () => {
    const preservedKeys = ["Fibre (g)", "Saturated Fats (g)", "Water (mL)"];

    setBounds((prev) => {
      const nextLower = { ...calculationData.lower_bounds };
      const nextUpper = { ...calculationData.upper_bounds };
      preservedKeys.forEach((key) => {
        if (prev.lower[key] !== undefined) nextLower[key] = prev.lower[key];
        if (prev.upper[key] !== undefined) nextUpper[key] = prev.upper[key];
      });
      return { lower: nextLower, upper: nextUpper, useCustom: prev.useCustom };
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
      setBounds((prev) => ({
        ...prev,
        useCustom: areBoundsChanged(prev.lower, prev.upper),
      }));
      setCustomisingBounds(false);
    }
  };

  const startCustomising = () => {
    boundsSnapshot.current = {
      lower: { ...bounds.lower },
      upper: { ...bounds.upper },
      useCustom: bounds.useCustom,
      errors: { ...validationErrors },
    };
    setCustomisingBounds(true);
  };

  const handleCancel = () => {
    setBounds({
      lower: boundsSnapshot.current.lower,
      upper: boundsSnapshot.current.upper,
      useCustom: boundsSnapshot.current.useCustom,
    });
    setValidationErrors(boundsSnapshot.current.errors);
    setCustomisingBounds(false);
  };

  return {
    state: {
      customisingBounds,
      adjustedLowerBounds: bounds.lower,
      adjustedUpperBounds: bounds.upper,
      useCustomBounds: bounds.useCustom,
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
