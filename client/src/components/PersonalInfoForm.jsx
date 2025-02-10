import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import ActivitySlider from './ActivitySlider';
import CalorieTargetSlider from './CalorieTargetSlider';
import MacroRatioValidator from './MacroRatioValidator';

const PersonalInfoForm = ({ onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    gender: 'm',
    age: '',
    weight: '',
    height: '',
    activity: 1.2,
    percentage: 100,
    macroRatios: null
  });
  const [error, setError] = useState(null);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  }, []);

  const steps = useMemo(() => [
    {
      title: "First, what's your gender?",
      component: (
        <Select 
          defaultValue={formData.gender}
          onValueChange={(value) => handleInputChange('gender', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="m">Male</SelectItem>
            <SelectItem value="f">Female</SelectItem>
          </SelectContent>
        </Select>
      )
    },
    {
      title: "How old are you?",
      component: (
        <Input
          type="number"
          value={formData.age}
          onChange={(e) => handleInputChange('age', e.target.value)}
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
      }
    },
    {
      title: "What's your weight in kilograms?",
      component: (
        <Input
          type="number"
          value={formData.weight}
          onChange={(e) => handleInputChange('weight', e.target.value)}
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
      }
    },
    {
      title: "And your height in centimeters?",
      component: (
        <Input
          type="number"
          value={formData.height}
          onChange={(e) => handleInputChange('height', e.target.value)}
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
      }
    },
    {
      title: "How active are you on a daily basis?",
      component: (
        <ActivitySlider
          value={formData.activity}
          onChange={(value) => handleInputChange('activity', value)}
        />
      )
    },
    {
      title: "What's your caloric goal?",
      component: (
        <CalorieTargetSlider
          value={formData.percentage}
          onChange={(value) => handleInputChange('percentage', value)}
        />
      )
    },
    {
      title: "Finally, let's set your macro ratios",
      component: (
        <MacroRatioValidator
          onValidRatios={(ratios) => handleInputChange('macroRatios', ratios)}
        />
      ),
      validate: (value) => {
        if (!value) {
          return "Please set valid macro ratios that total 100%";
        }
        return null;
      }
    }
  ], [formData, handleInputChange]);

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
          setError("Please ensure your macro ratios total 100% and are within the guidelines");
        }
      } else {
        setCurrentStep(prev => prev + 1);
        setError(null);
      }
    }
  }, [currentStep, formData, onSubmit, steps.length, validateStep]);

  const handlePrevious = useCallback(() => {
    setCurrentStep(prev => prev - 1);
    setError(null);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        if (e.target.tagName.toLowerCase() === 'input') {
          e.preventDefault();
        }
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
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

            <div className="mb-8">
              {steps[currentStep].component}
            </div>

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

          <Button
            onClick={handleNext}
            className="flex items-center gap-2"
          >
            {currentStep === steps.length - 1 ? 'Submit' : 'Next'}
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