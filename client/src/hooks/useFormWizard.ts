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
  handleMacroRatiosUpdate: (ratios: MacroRatios) => void;
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

export function useFormWizard(
  steps: WizardStep[],
  onSubmit: (data: FormData) => void,
): UseFormWizardReturn {
  const [currentStep, setCurrentStep] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? (JSON.parse(saved) as PersistedFormState).step : 0;
    } catch {
      return 0;
    }
  });

  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? (JSON.parse(saved) as PersistedFormState).data
        : DEFAULT_FORM_DATA;
    } catch {
      return DEFAULT_FORM_DATA;
    }
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: currentStep, data: formData }),
    );
  }, [currentStep, formData]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: unknown) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setError(null);
    },
    [],
  );

  const handleMacroRatiosUpdate = useCallback(
    (ratios: MacroRatios) => handleInputChange("macroRatios", ratios),
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
