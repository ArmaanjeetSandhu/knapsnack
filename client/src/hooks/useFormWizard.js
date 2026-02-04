import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "knapsnack_form_state";

export function useFormWizard(steps, onSubmit) {
  const [currentStep, setCurrentStep] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved).step : 0;
    } catch {
      return 0;
    }
  });

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved
        ? JSON.parse(saved).data
        : {
            gender: "m",
            age: "",
            weight: "",
            height: "",
            activity: 1.2,
            percentage: 100,
            macroRatios: null,
            smokingStatus: "no",
          };
    } catch {
      return {
        gender: "m",
        age: "",
        weight: "",
        height: "",
        activity: 1.2,
        percentage: 100,
        macroRatios: null,
        smokingStatus: "no",
      };
    }
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: currentStep, data: formData }),
    );
  }, [currentStep, formData]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const handleMacroRatiosUpdate = useCallback(
    (ratios) => {
      handleInputChange("macroRatios", ratios);
    },
    [handleInputChange],
  );

  const validateStep = useCallback(() => {
    const currentStepData = steps[currentStep];
    const currentValue = formData[Object.keys(formData)[currentStep]];
    if (currentStepData.validate) {
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
        else
          setError(
            "Please ensure your macro ratios total 100% and are within the guidelines",
          );
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
