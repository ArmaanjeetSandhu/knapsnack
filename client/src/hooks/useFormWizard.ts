import { useCallback, useEffect, useState } from "react";

export interface MacroRatios {
  protein: number;
  carbs: number;
  fat: number;
}

export interface FormData {
  gender: "m" | "f";
  age: string | number;
  weight: string | number;
  height: string | number;
  activity: number;
  percentage: number;
  macroRatios: MacroRatios | null;
  smokingStatus: "no" | "yes";
}

export interface WizardStep {
  title?: string;
  validate?: (value: unknown) => string | null | undefined;
  [key: string]: unknown;
}

export interface UseFormWizardReturn {
  currentStep: number;
  formData: FormData;
  error: string | null;
  handleNext: () => void;
  handlePrevious: () => void;
  handleInputChange: (field: keyof FormData, value: unknown) => void;
  handleMacroRatiosUpdate: (ratios: MacroRatios | null) => void;
  setError: (error: string | null) => void;
}

const STORAGE_KEY = "knapsnack_form_state";

const DEFAULT_FORM_DATA: FormData = {
  gender: "m",
  age: "",
  weight: "",
  height: "",
  activity: 1.2,
  percentage: 100,
  macroRatios: null,
  smokingStatus: "no",
};

interface PersistedFormState {
  step: number;
  data: FormData;
}

const INTEGER_FIELD_MAX_LENGTH = 16;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const sanitizeIntegerField = (value: unknown): string =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, INTEGER_FIELD_MAX_LENGTH);

const sanitizeNumber = (
  value: unknown,
  min: number,
  max: number,
  fallback: number,
): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};

const sanitizeEnum = <T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T => (allowed.includes(value as T) ? (value as T) : fallback);

const sanitizeMacroRatios = (value: unknown): MacroRatios | null => {
  if (!isObject(value)) return null;
  return {
    protein: sanitizeNumber(value.protein, 0, 100, 0),
    carbs: sanitizeNumber(value.carbs, 0, 100, 0),
    fat: sanitizeNumber(value.fat, 0, 100, 0),
  };
};

const sanitizeFormData = (value: unknown): FormData => {
  const data = isObject(value) ? value : {};
  return {
    gender: sanitizeEnum(data.gender, ["m", "f"], DEFAULT_FORM_DATA.gender),
    age: sanitizeIntegerField(data.age),
    weight: sanitizeIntegerField(data.weight),
    height: sanitizeIntegerField(data.height),
    activity: sanitizeNumber(
      data.activity,
      1.2,
      2.4,
      DEFAULT_FORM_DATA.activity,
    ),
    percentage: sanitizeNumber(
      data.percentage,
      75,
      125,
      DEFAULT_FORM_DATA.percentage,
    ),
    macroRatios: sanitizeMacroRatios(data.macroRatios),
    smokingStatus: sanitizeEnum(
      data.smokingStatus,
      ["no", "yes"],
      DEFAULT_FORM_DATA.smokingStatus,
    ),
  };
};

const sanitizePersistedState = (value: unknown): PersistedFormState => {
  const state = isObject(value) ? value : {};
  return {
    step: Math.floor(sanitizeNumber(state.step, 0, Number.MAX_SAFE_INTEGER, 0)),
    data: sanitizeFormData(state.data),
  };
};

const readPersistedState = (): PersistedFormState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? sanitizePersistedState(JSON.parse(saved)) : null;
  } catch {
    return null;
  }
};

export function useFormWizard(
  steps: WizardStep[],
  onSubmit: (data: FormData) => void,
): UseFormWizardReturn {
  const [currentStep, setCurrentStep] = useState<number>(
    () => readPersistedState()?.step ?? 0,
  );

  const [formData, setFormData] = useState<FormData>(
    () => readPersistedState()?.data ?? DEFAULT_FORM_DATA,
  );

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const safeState = sanitizePersistedState({
      step: currentStep,
      data: formData,
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  }, [currentStep, formData]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    [],
  );

  const handleMacroRatiosUpdate = useCallback(
    (ratios: MacroRatios | null) => handleInputChange("macroRatios", ratios),
    [handleInputChange],
  );

  const validateStep = useCallback((): boolean => {
    const currentStepData = steps[currentStep];
    const currentValue =
      formData[Object.keys(formData)[currentStep] as keyof FormData];
    if (currentStepData?.validate) {
      const validationError = currentStepData.validate(currentValue);
      if (validationError) {
        setError(validationError);
        return false;
      }
    }
    return true;
  }, [currentStep, formData, steps]);

  const handleNext = useCallback(() => {
    if (validateStep()) {
      if (currentStep === steps.length - 1) {
        if (formData.macroRatios) onSubmit(formData);
        else setError("Please ensure your macro ratios total 100%");
      } else {
        setCurrentStep((prev) => prev + 1);
        setError(null);
      }
    }
  }, [currentStep, formData, onSubmit, steps.length, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
    setError(null);
  }, []);

  return {
    currentStep,
    formData,
    error,
    handleNext,
    handlePrevious,
    handleInputChange,
    handleMacroRatiosUpdate,
    setError,
  };
}
