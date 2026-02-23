import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { NutrientMap } from "../services/api";

export interface CalculationData {
  lower_bounds: NutrientMap;
  upper_bounds: NutrientMap;
  fibre: number;
  saturated_fats: number;
  carbohydrate: number;
  bmr: number;
  tdee: number;
  daily_caloric_intake: number;
  protein: number;
  fats: number;
}

export interface SavedBounds {
  useCustomBounds: boolean;
  adjustedLowerBounds: NutrientMap;
  adjustedUpperBounds: NutrientMap;
}

type BoundsType = "lower" | "upper";

interface BoundsState {
  lower: NutrientMap;
  upper: NutrientMap;
  useCustom: boolean;
}

interface BoundsSnapshot extends BoundsState {
  errors: Record<string, string>;
}

export interface NutrientBoundsState {
  customisingBounds: boolean;
  adjustedLowerBounds: NutrientMap;
  adjustedUpperBounds: NutrientMap;
  useCustomBounds: boolean;
  validationErrors: Record<string, string>;
  editingValues: Record<string, string | number>;
}

export interface NutrientBoundsActions {
  setCustomisingBounds: (value: boolean) => void;
  handleBoundChange: (
    nutrientKey: string,
    boundsType: BoundsType,
    value: string,
  ) => void;
  startEditing: (target: string, currentValue: string | number) => void;
  cancelEditing: (target: string) => void;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement>,
    target: string,
    key: string,
  ) => void;
  resetToSystemDefault: (target: string) => void;
  saveTarget: (target: string, key: string, boundType: BoundsType) => void;
  resetBounds: () => void;
  handleSave: () => void;
  handleCancel: () => void;
}

export interface UseNutrientBoundsReturn {
  state: NutrientBoundsState;
  actions: NutrientBoundsActions;
}

function getInitialBounds(
  calculationData: CalculationData | null,
  savedBounds?: SavedBounds | null,
): BoundsState {
  if (savedBounds?.useCustomBounds) {
    return {
      lower: { ...savedBounds.adjustedLowerBounds },
      upper: { ...savedBounds.adjustedUpperBounds },
      useCustom: true,
    };
  }
  return {
    lower: calculationData ? { ...calculationData.lower_bounds } : {},
    upper: calculationData ? { ...calculationData.upper_bounds } : {},
    useCustom: false,
  };
}

const EDITABLE_TARGET_KEY_MAP: Record<string, string> = {
  Fibre: "Fibre (g)",
  "Saturated Fats": "Saturated Fats (g)",
  Water: "Water (mL)",
};

export function useNutrientBounds(
  calculationData: CalculationData | null,
  savedBounds?: SavedBounds | null,
): UseNutrientBoundsReturn {
  const [customisingBounds, setCustomisingBounds] = useState(false);
  const [bounds, setBounds] = useState<BoundsState>(() =>
    getInitialBounds(calculationData, savedBounds),
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [editingValues, setEditingValues] = useState<
    Record<string, string | number>
  >({});

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

  const boundsSnapshot = useRef<BoundsSnapshot>({
    lower: {},
    upper: {},
    useCustom: false,
    errors: {},
  });

  const isEmpty = (val: string | number | undefined): boolean =>
    val === "" || val === undefined || (typeof val === "number" && isNaN(val));

  const validateBounds = (
    nutrientKey: string,
    boundsType: BoundsType,
    value: number,
  ): void => {
    const errors = { ...validationErrors };
    const lowerKey = `${nutrientKey}-lower`;
    const upperKey = `${nutrientKey}-upper`;

    delete errors[lowerKey];
    delete errors[upperKey];
    delete errors[nutrientKey];

    const lower = boundsType === "lower" ? value : bounds.lower[nutrientKey];
    const upper = boundsType === "upper" ? value : bounds.upper[nutrientKey];

    if (isEmpty(lower) && isEmpty(upper)) {
      const msg = "At least one bound is required";
      errors[lowerKey] = msg;
      errors[upperKey] = msg;
    } else if (!isEmpty(lower) && !isEmpty(upper)) {
      if ((lower as number) > (upper as number)) {
        errors[boundsType === "lower" ? lowerKey : upperKey] =
          boundsType === "lower"
            ? "Lower bound cannot exceed upper bound"
            : "Upper bound cannot be less than lower bound";
      }
    }

    setValidationErrors(errors);
  };

  const validateInput = (
    target: string,
    value: string | number,
    key: string,
  ): boolean => {
    const val = parseFloat(String(value));
    let error: string | null = null;

    if (isNaN(val) || value === "") {
      error = "Must be a positive number";
    } else if (calculationData) {
      const fmt = (v?: number) =>
        v?.toLocaleString("en-US", { maximumFractionDigits: 1 });

      if (target === "Fibre" && val > calculationData.carbohydrate)
        error = `Cannot exceed Carbohydrates (${fmt(calculationData.carbohydrate)}g)`;
      else if (
        target === "Saturated Fats" &&
        val > calculationData.saturated_fats
      )
        error = `Cannot exceed calculated target (${fmt(calculationData.saturated_fats)}g)`;
    }

    setValidationErrors((prev) => {
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });

    return !error;
  };

  const handleBoundChange = (
    nutrientKey: string,
    boundsType: BoundsType,
    value: string,
  ): void => {
    const numValue = parseFloat(value);
    setBounds((prev) => ({
      ...prev,
      [boundsType]: {
        ...prev[boundsType],
        [nutrientKey]: isNaN(numValue) ? "" : numValue,
      },
    }));
    validateBounds(nutrientKey, boundsType, numValue);
  };

  const startEditing = (
    target: string,
    currentValue: string | number,
  ): void => {
    setEditingValues((prev) => ({ ...prev, [target]: currentValue }));
  };

  const cancelEditing = (target: string): void => {
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[target];
      return next;
    });
    setValidationErrors((prev) => {
      const next = { ...prev };
      const key = EDITABLE_TARGET_KEY_MAP[target];
      if (key) delete next[key];
      return next;
    });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    target: string,
    key: string,
  ): void => {
    const newVal = e.target.value;
    setEditingValues((prev) => ({ ...prev, [target]: newVal }));
    validateInput(target, newVal, key);
  };

  const resetToSystemDefault = (target: string): void => {
    if (!calculationData) return;
    let defaultValue: number | undefined;

    if (target === "Fibre") defaultValue = calculationData.fibre;
    else if (target === "Saturated Fats")
      defaultValue = calculationData.saturated_fats;
    else if (target === "Water")
      defaultValue = calculationData.lower_bounds["Water (mL)"] ?? 0;

    if (defaultValue !== undefined) {
      setEditingValues((prev) => ({
        ...prev,
        [target]: defaultValue as number,
      }));
      const key = EDITABLE_TARGET_KEY_MAP[target];
      if (key) validateInput(target, defaultValue, key);
    }
  };

  const getCanonicalOriginalBounds = (): {
    lower: NutrientMap;
    upper: NutrientMap;
  } => ({
    lower: {
      ...calculationData?.lower_bounds,
      "Fibre (g)": calculationData?.fibre ?? 0,
    },
    upper: {
      ...calculationData?.upper_bounds,
      "Saturated Fats (g)": calculationData?.saturated_fats ?? 0,
    },
  });

  const areBoundsChanged = (
    newLower: NutrientMap,
    newUpper: NutrientMap,
  ): boolean => {
    const { lower: originalLower, upper: originalUpper } =
      getCanonicalOriginalBounds();
    return (
      Object.keys(newLower).some((k) => newLower[k] !== originalLower[k]) ||
      Object.keys(newUpper).some((k) => newUpper[k] !== originalUpper[k])
    );
  };

  const saveTarget = (
    target: string,
    key: string,
    boundType: BoundsType,
  ): void => {
    const valString = editingValues[target];
    if (!validateInput(target, valString, key)) return;

    const val = parseFloat(String(valString));
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

  const resetBounds = (): void => {
    if (!calculationData) return;
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
      const next: Record<string, string> = {};
      Object.keys(prev).forEach((key) => {
        if (preservedKeys.some((pk) => key.includes(pk))) next[key] = prev[key];
      });
      return next;
    });
  };

  const handleSave = (): void => {
    if (Object.keys(validationErrors).length === 0) {
      setBounds((prev) => ({
        ...prev,
        useCustom: areBoundsChanged(prev.lower, prev.upper),
      }));
      setCustomisingBounds(false);
    }
  };

  const startCustomising = (): void => {
    boundsSnapshot.current = {
      lower: { ...bounds.lower },
      upper: { ...bounds.upper },
      useCustom: bounds.useCustom,
      errors: { ...validationErrors },
    };
    setCustomisingBounds(true);
  };

  const handleCancel = (): void => {
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
      setCustomisingBounds: (value: boolean) => {
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
