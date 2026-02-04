import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, HelpCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useFormWizard } from "../hooks/useFormWizard";
import ActivitySlider from "./ActivitySlider";
import CalorieTargetSlider from "./CalorieTargetSlider";
import MacroRatioValidator from "./MacroRatioValidator";

const preventInvalidChars = (e) => {
  if ([".", "+", "-", "e", "E"].includes(e.key)) e.preventDefault();
};

const PersonalInfoForm = ({ onSubmit }) => {
  const [showSmokingHelp, setShowSmokingHelp] = useState(false);

  const stepConfigs = [
    { title: "First, what's your gender?" },
    {
      title: "How old are you?",
      validate: (value) => {
        const age = parseInt(value);
        if (!value || age < 19 || age > 100)
          return "Age must be between 19 and 100";
        return null;
      },
    },
    {
      title: "What's your weight in kilograms?",
      validate: (value) => {
        const weight = parseInt(value);
        if (!value || weight < 30 || weight > 200)
          return "Weight must be between 30 and 200 kg";
        return null;
      },
    },
    {
      title: "And your height in centimeters?",
      validate: (value) => {
        const height = parseInt(value);
        if (!value || height < 135 || height > 200)
          return "Height must be between 135 and 200 cm";
        return null;
      },
    },
    { title: "How active are you on a daily basis?" },
    { title: "Do you smoke?" },
    { title: "What's your caloric goal?" },
    {
      title: "Finally, let's set your macro ratios",
      validate: (value) => {
        if (!value) return "Please set valid macro ratios that total 100%";
        return null;
      },
    },
  ];

  const {
    currentStep,
    formData,
    error,
    handleNext,
    handlePrevious,
    handleInputChange,
    handleMacroRatiosUpdate,
  } = useFormWizard(stepConfigs, onSubmit);

  const currentStepUI = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.gender === "m" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleInputChange("gender", "m")}
              autoFocus={formData.gender === "m"}
            >
              Male
            </Button>
            <Button
              type="button"
              variant={formData.gender === "f" ? "default" : "outline"}
              className="flex-1"
              onClick={() => handleInputChange("gender", "f")}
              autoFocus={formData.gender === "f"}
            >
              Female
            </Button>
          </div>
        );
      case 1:
        return (
          <Input
            type="number"
            autoFocus
            value={formData.age}
            onKeyDown={preventInvalidChars}
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
            onKeyDown={preventInvalidChars}
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
            onKeyDown={preventInvalidChars}
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

  const renderTitle = () => {
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
              <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
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
    return stepConfigs[currentStep].title;
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        if (currentStep > 0) handlePrevious();
        return;
      }

      if (e.key === "Enter" && !e.shiftKey) {
        const activeElement = document.activeElement;
        const tagName = activeElement.tagName.toLowerCase();

        const isSelectedButton = () => {
          if (tagName !== "button") return false;
          const text = activeElement.textContent?.trim();

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
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious, currentStep, formData]);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{
              width: `${((currentStep + 1) / stepConfigs.length) * 100}%`,
            }}
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
            <h2 className="text-2xl font-semibold mb-6">{renderTitle()}</h2>
            <div className="mb-8">{currentStepUI}</div>
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
            {currentStep === stepConfigs.length - 1 ? "Submit" : "Next"}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfoForm;
