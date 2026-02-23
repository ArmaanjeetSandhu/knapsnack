import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  useFormWizard,
  type FormData,
  type WizardStep,
} from "../../hooks/useFormWizard";
import { preventInvalidIntegerChars } from "../../lib/utils";
import api from "../../services/api";
import type { ServiceLimits } from "../../services/api";
import LoadingSpinner from "../common/LoadingSpinner";
import NotificationToast from "../common/NotificationToast";
import ActivitySlider from "./sliders/ActivitySlider";
import CalorieTargetSlider from "./sliders/CalorieTargetSlider";
import MacroRatioValidator from "./sliders/MacroRatioValidator";
import { Alert, AlertDescription } from "../ui/alert";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface SelectionOption<T extends string> {
  label: string;
  value: T;
}

interface SelectionGroupProps<T extends string> {
  options: SelectionOption<T>[];
  value: T;
  onChange: (value: T) => void;
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

interface PersonalInfoFormProps {
  onSubmit: (data: FormData) => void;
}

const PersonalInfoForm = ({ onSubmit }: PersonalInfoFormProps) => {
  const [showSmokingHelp, setShowSmokingHelp] = useState(false);
  const [limits, setLimits] = useState<ServiceLimits | null>(null);
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const configData = await api.getServiceConfig();
        if (configData?.limits) setLimits(configData.limits);
        else setConfigError(true);
      } catch (error) {
        console.error("Failed to load validation limits:", error);
        setConfigError(true);
      }
    };
    fetchConfig();
  }, []);

  const stepConfigs = useMemo((): WizardStep[] => {
    if (!limits) return [];
    return [
      { title: "First, what's your gender?" },
      {
        title: "How old are you?",
        validate: (value: unknown) => {
          const age = parseInt(String(value));
          if (!value || age < limits.AGE_MIN || age > limits.AGE_MAX)
            return `Age must be between ${limits.AGE_MIN} and ${limits.AGE_MAX}`;
          return null;
        },
      },
      {
        title: "What's your weight in kilograms?",
        validate: (value: unknown) => {
          const weight = parseInt(String(value));
          if (
            !value ||
            weight < limits.WEIGHT_MIN ||
            weight > limits.WEIGHT_MAX
          )
            return `Weight must be between ${limits.WEIGHT_MIN} and ${limits.WEIGHT_MAX} kg`;
          return null;
        },
      },
      {
        title: "And your height in centimeters?",
        validate: (value: unknown) => {
          const height = parseInt(String(value));
          if (
            !value ||
            height < limits.HEIGHT_MIN ||
            height > limits.HEIGHT_MAX
          )
            return `Height must be between ${limits.HEIGHT_MIN} and ${limits.HEIGHT_MAX} cm`;
          return null;
        },
      },
      { title: "How active are you on a daily basis?" },
      { title: "Do you smoke?" },
      { title: "What's your caloric goal?" },
      {
        title: "Finally, let's set your macro ratios",
        validate: (value: unknown) => {
          if (!value) return "Please set valid macro ratios that total 100%";
          return null;
        },
      },
    ];
  }, [limits]);

  const {
    currentStep,
    formData,
    error,
    setError,
    handleNext,
    handlePrevious,
    handleInputChange,
    handleMacroRatiosUpdate,
  } = useFormWizard(stepConfigs, onSubmit);

  const currentStepUI = useMemo(() => {
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
            initialMacros={formData.macroRatios}
            onValidRatios={handleMacroRatiosUpdate}
            autoFocus={true}
          />
        );
      default:
        return null;
    }
  }, [currentStep, formData, handleInputChange, handleMacroRatiosUpdate]);

  const renderTitle = (): React.ReactNode => {
    if (currentStep === 5) {
      return (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            Do you smoke?
            <button
              type="button"
              className="cursor-help"
              onClick={(e) => {
                e.preventDefault();
                setShowSmokingHelp((prev) => !prev);
              }}
            >
              <HelpCircle className="h-4 w-4 text-muted-foreground transition-colors hover:text-foreground" />
            </button>
          </div>
          <AnimatePresence>
            {showSmokingHelp && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="text-base font-normal text-muted-foreground"
              >
                Knap[Snack] adjusts your vitamin C requirements to account for
                the increased oxidative stress associated with smoking.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      );
    }
    return stepConfigs[currentStep]?.title as string;
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
        } else {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious, currentStep, formData]);

  if (!limits && !configError)
    return <LoadingSpinner message="Loading configuration..." />;

  if (configError)
    return (
      <Alert variant="destructive" className="mx-auto mt-8 max-w-2xl">
        <AlertDescription>
          Failed to load application configuration. Please refresh the page.
        </AlertDescription>
      </Alert>
    );

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <div className="h-2 rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / stepConfigs.length) * 100}%`,
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
            <div className="mb-8">{currentStepUI}</div>
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
            {currentStep === stepConfigs.length - 1 ? "Submit" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
