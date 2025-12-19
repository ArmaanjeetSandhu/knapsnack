import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import ActivitySlider from "./ActivitySlider";
import CalorieTargetSlider from "./CalorieTargetSlider";
import MacroRatioValidator from "./MacroRatioValidator";

const STORAGE_KEY = "knapsnack_form_state";

const PersonalInfoForm = ({ onSubmit }) => {
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
      JSON.stringify({ step: currentStep, data: formData })
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
    [handleInputChange]
  );
  const steps = useMemo(
    () => [
      {
        title: (
          <div className="flex items-center gap-2">
            First, what&apos;s your gender?
          </div>
        ),
        component: (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.gender === "m" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleInputChange("gender", "m")}
            >
              Male
            </Button>
            <Button
              type="button"
              variant={formData.gender === "f" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleInputChange("gender", "f")}
            >
              Female
            </Button>
          </div>
        ),
      },
      {
        title: "How old are you?",
        component: (
          <Input
            type="number"
            autoFocus
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            placeholder="Enter your age"
            className="text-lg"
          />
        ),
        validate: (value) => {
          const age = parseInt(value);
          if (!value || age < 19 || age > 100) {
            return "Age must be between 19 and 100";
          }
          return null;
        },
      },
      {
        title: "What's your weight in kilograms?",
        component: (
          <Input
            type="number"
            autoFocus
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            placeholder="Enter your weight (kg)"
            className="text-lg"
          />
        ),
        validate: (value) => {
          const weight = parseInt(value);
          if (!value || weight < 30 || weight > 200) {
            return "Weight must be between 30 and 200 kg";
          }
          return null;
        },
      },
      {
        title: "And your height in centimeters?",
        component: (
          <Input
            type="number"
            autoFocus
            value={formData.height}
            onChange={(e) => handleInputChange("height", e.target.value)}
            placeholder="Enter your height (cm)"
            className="text-lg"
          />
        ),
        validate: (value) => {
          const height = parseInt(value);
          if (!value || height < 135 || height > 200) {
            return "Height must be between 135 and 200 cm";
          }
          return null;
        },
      },
      {
        title: "How active are you on a daily basis?",
        component: (
          <ActivitySlider
            value={formData.activity}
            onChange={(value) => handleInputChange("activity", value)}
          />
        ),
      },
      {
        title: (
          <div className="flex items-center gap-2">
            Do you smoke?
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="cursor-help">
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>
                    Smokers require an additional 35mg of vitamin C per day.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ),
        component: (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.smokingStatus === "no" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleInputChange("smokingStatus", "no")}
            >
              No
            </Button>
            <Button
              type="button"
              variant={formData.smokingStatus === "yes" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleInputChange("smokingStatus", "yes")}
            >
              Yes
            </Button>
          </div>
        ),
      },
      {
        title: "What's your caloric goal?",
        component: (
          <CalorieTargetSlider
            value={formData.percentage}
            onChange={(value) => handleInputChange("percentage", value)}
          />
        ),
      },
      {
        title: "Finally, let's set your macro ratios",
        component: (
          <MacroRatioValidator
            initialMacros={formData.macroRatios}
            onValidRatios={handleMacroRatiosUpdate}
          />
        ),
        validate: (value) => {
          if (!value) {
            return "Please set valid macro ratios that total 100%";
          }
          return null;
        },
      },
    ],
    [formData, handleInputChange, handleMacroRatiosUpdate]
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
        if (formData.macroRatios) {
          onSubmit(formData);
        } else {
          setError(
            "Please ensure your macro ratios total 100% and are within the guidelines"
          );
        }
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
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        if (e.target.tagName.toLowerCase() === "input") {
          e.preventDefault();
        }
        handleNext();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext]);
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
      <div className="min-h-[400px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1"
          >
            <h2 className="text-2xl font-semibold mb-6">
              {steps[currentStep].title}
            </h2>
            <div className="mb-8">{steps[currentStep].component}</div>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button onClick={handleNext} className="flex items-center gap-2">
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
PersonalInfoForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};
export default PersonalInfoForm;
