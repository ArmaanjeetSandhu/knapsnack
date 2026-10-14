import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useEffect, useState } from "react";

import {
  macroRatioTotal,
  useFormWizard,
  type FormData,
  type WizardStep,
} from "../../hooks/useFormWizard";
import { LIMITS } from "../../lib/limits";
import { preventInvalidIntegerChars } from "../../lib/utils";
import NotificationToast from "../common/NotificationToast";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

import ActivitySlider from "./sliders/ActivitySlider";
import CalorieTargetSlider from "./sliders/CalorieTargetSlider";
import MacroRatioValidator from "./sliders/MacroRatioValidator";

interface SelectionOption<T extends string> {
  label: string;
  value: T;
}

interface SelectionGroupProps<T extends string> {
  readonly options: SelectionOption<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

function SelectionGroup<T extends string>({
  options,
  value,
  onChange,
}: SelectionGroupProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? "default" : "outline"}
          className="flex-1"
          onClick={() => onChange(option.value)}
          autoFocus={value === option.value}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

const STEP_CONFIGS: WizardStep[] = [
  { field: "gender", title: "First, what's your gender?" },
  {
    field: "age",
    title: "How old are you?",
    validate: (value: unknown) => {
      const age = Number.parseInt(String(value));
      if (!value || age < LIMITS.AGE_MIN || age > LIMITS.AGE_MAX)
        return `Age must be between ${LIMITS.AGE_MIN} and ${LIMITS.AGE_MAX}`;
      return null;
    },
  },
  {
    field: "weight",
    title: "What's your weight in kilograms?",
    validate: (value: unknown) => {
      const weight = Number.parseInt(String(value));
      if (!value || weight < LIMITS.WEIGHT_MIN || weight > LIMITS.WEIGHT_MAX)
        return `Weight must be between ${LIMITS.WEIGHT_MIN} and ${LIMITS.WEIGHT_MAX} kg`;
      return null;
    },
  },
  {
    field: "height",
    title: "And your height in centimeters?",
    validate: (value: unknown) => {
      const height = Number.parseInt(String(value));
      if (!value || height < LIMITS.HEIGHT_MIN || height > LIMITS.HEIGHT_MAX)
        return `Height must be between ${LIMITS.HEIGHT_MIN} and ${LIMITS.HEIGHT_MAX} cm`;
      return null;
    },
  },
  { field: "activity", title: "How active are you on a daily basis?" },
  { field: "smokingStatus", title: "Do you smoke?" },
  { field: "percentage", title: "What's your caloric goal?" },
  {
    field: "macroRatios",
    title: "Finally, let's set your macro ratios",
    validate: (value: unknown) => {
      if (macroRatioTotal(value as FormData["macroRatios"]) !== 100)
        return "Please set valid macro ratios that total 100%";
      return null;
    },
  },
];

interface PersonalInfoFormProps {
  onSubmit: (data: FormData) => void;
}

const PersonalInfoForm = ({ onSubmit }: PersonalInfoFormProps) => {
  const [showSmokingHelp, setShowSmokingHelp] = useState(false);
  const [showCaloricHelp, setShowCaloricHelp] = useState(false);

  const {
    currentStep,
    formData,
    error,
    setError,
    handleNext,
    handlePrevious,
    handleInputChange,
  } = useFormWizard(STEP_CONFIGS, onSubmit);

  const renderStepUI = (): React.ReactNode => {
    switch (currentStep) {
      case 0:
        return (
          <SelectionGroup
            options={[
              { label: "Male", value: "m" as const },
              { label: "Female", value: "f" as const },
            ]}
            value={formData.gender}
            onChange={(val) => handleInputChange("gender", val)}
          />
        );
      case 1:
        return (
          <Input
            type="number"
            autoFocus
            value={formData.age}
            onKeyDown={preventInvalidIntegerChars}
            onChange={(e) => handleInputChange("age", e.target.value)}
            placeholder="Enter your age"
            className="text-lg"
          />
        );
      case 2:
        return (
          <Input
            type="number"
            autoFocus
            value={formData.weight}
            onKeyDown={preventInvalidIntegerChars}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            placeholder="Enter your weight (kg)"
            className="text-lg"
          />
        );
      case 3:
        return (
          <Input
            type="number"
            autoFocus
            value={formData.height}
            onKeyDown={preventInvalidIntegerChars}
            onChange={(e) => handleInputChange("height", e.target.value)}
            placeholder="Enter your height (cm)"
            className="text-lg"
          />
        );
      case 4:
        return (
          <ActivitySlider
            value={formData.activity}
            onChange={(value) => handleInputChange("activity", value)}
            autoFocus={true}
          />
        );
      case 5:
        return (
          <SelectionGroup
            options={[
              { label: "No", value: "no" as const },
              { label: "Yes", value: "yes" as const },
            ]}
            value={formData.smokingStatus}
            onChange={(val) => handleInputChange("smokingStatus", val)}
          />
        );
      case 6:
        return (
          <CalorieTargetSlider
            value={formData.percentage}
            onChange={(value) => handleInputChange("percentage", value)}
            autoFocus={true}
          />
        );
      case 7:
        return (
          <MacroRatioValidator
            value={formData.macroRatios}
            onChange={(ratios) => handleInputChange("macroRatios", ratios)}
            autoFocus={true}
          />
        );
      default:
        return null;
    }
  };

  const renderTitle = (): React.ReactNode => {
    if (currentStep === 5) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span>Do you smoke?</span>
            <button
              type="button"
              className="translate-y-0.5 cursor-help"
              onClick={(e) => {
                e.preventDefault();
                setShowSmokingHelp((prev) => !prev);
              }}
            >
              <HelpCircle className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
            </button>
          </div>
          <AnimatePresence>
            {showSmokingHelp && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-muted-foreground text-base font-normal"
              >
                Knap[Snack] adjusts your vitamin C requirements to account for
                the increased oxidative stress associated with smoking.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    }
    if (currentStep === 6) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span>What&apos;s your caloric goal?</span>
            <button
              type="button"
              className="translate-y-0.5 cursor-help"
              onClick={(e) => {
                e.preventDefault();
                setShowCaloricHelp((prev) => !prev);
              }}
            >
              <HelpCircle className="text-muted-foreground hover:text-foreground h-4 w-4 transition-colors" />
            </button>
          </div>
          <AnimatePresence>
            {showCaloricHelp && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-muted-foreground text-base font-normal"
              >
                What percentage of the calories you burn daily do you plan to
                consume every day?
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return STEP_CONFIGS[currentStep]?.title as string;
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        if (currentStep > 0) handlePrevious();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        const activeElement = document.activeElement as HTMLElement | null;
        const tagName = activeElement?.tagName.toLowerCase();
        if (tagName === "a") return;

        const isSelectedButton = (): boolean => {
          if (tagName !== "button") return false;
          const text = activeElement?.textContent?.trim();
          if (currentStep === 0)
            return (
              (text === "Male" && formData.gender === "m") ||
              (text === "Female" && formData.gender === "f")
            );
          if (currentStep === 5)
            return (
              (text === "Yes" && formData.smokingStatus === "yes") ||
              (text === "No" && formData.smokingStatus === "no")
            );
          return false;
        };

        if (tagName === "input") {
          e.preventDefault();
          handleNext();
        } else if (tagName === "button") {
          if (isSelectedButton()) {
            e.preventDefault();
            handleNext();
          }
        } else handleNext();
      }
    };

    globalThis.addEventListener("keydown", handleKeyPress);
    return () => globalThis.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious, currentStep, formData]);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / STEP_CONFIGS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      <div className="flex min-h-[400px] flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h2 className="mb-6 text-2xl font-semibold">{renderTitle()}</h2>
            <div className="mb-8">{renderStepUI()}</div>
            <AnimatePresence>
              {error && (
                <NotificationToast
                  message={error}
                  onDismiss={() => setError(null)}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button onClick={handleNext} className="flex items-center gap-2">
            {currentStep === STEP_CONFIGS.length - 1 ? "Submit" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
