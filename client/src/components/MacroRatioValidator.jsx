import { useState } from 'react';
import PropTypes from 'prop-types';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';

const MacroRatioValidator = ({ onValidRatios }) => {
  const amdrRanges = {
    protein: { min: 10, max: 40 },
    carbohydrate: { min: 40, max: 65 },
    fats: { min: 20, max: 35 }
  };

  const [macros, setMacros] = useState({
    protein: 30,
    carbohydrate: 40,
    fats: 30
  });

  const total = Object.values(macros).reduce((sum, value) => sum + value, 0);
  
  const getAMDRViolations = () => {
    const violations = [];
    Object.entries(macros).forEach(([macro, value]) => {
      const range = amdrRanges[macro];
      if (value < range.min) {
        violations.push(`${macro} is below minimum (${range.min}%)`);
      } else if (value > range.max) {
        violations.push(`${macro} exceeds maximum (${range.max}%)`);
      }
    });
    return violations;
  };

  const handleMacroChange = (macroType, newValue) => {
    const range = amdrRanges[macroType];
    newValue = Math.max(range.min, Math.min(range.max, Number(newValue)));
    
    const updatedMacros = {
      ...macros,
      [macroType]: newValue
    };
    
    setMacros(updatedMacros);

    const total = Object.values(updatedMacros).reduce((sum, value) => sum + value, 0);
    if (total === 100 && getAMDRViolations().length === 0) {
      onValidRatios(updatedMacros);
    }
  };

  const getAlertMessages = () => {
    const messages = [];
    
    const difference = Math.abs(100 - total);
    if (total === 100) {
      messages.push({
        type: 'success',
        message: 'Perfect! Your macros total 100% and are within AMDR guidelines'
      });
    } else if (total < 100) {
      messages.push({
        type: 'warning',
        message: `Your macros total ${total}%. Please add ${difference}% to reach 100%`
      });
    } else {
      messages.push({
        type: 'warning',
        message: `Your macros total ${total}%. Please reduce by ${difference}% to reach 100%`
      });
    }

    const violations = getAMDRViolations();
    if (violations.length > 0) {
      messages.push({
        type: 'error',
        message: `AMDR violations detected: ${violations.join(', ')}`
      });
    }

    return messages;
  };

  const macroColors = {
    protein: {
      main: '#ec4899',
      range: '#fce7f3',
      invalid: '#fdf2f8'
    },
    carbohydrate: {
      main: '#6366f1',
      range: '#e0e7ff',
      invalid: '#eef2ff'
    },
    fats: {
      main: '#eab308',
      range: '#fef9c3',
      invalid: '#fefce8'
    }
  };

  const getSliderBackground = (macro) => {
    const range = amdrRanges[macro];
    const value = macros[macro];
    const colors = macroColors[macro];
    
    return `linear-gradient(to right,
      ${colors.invalid} 0%,
      ${colors.invalid} ${range.min}%,
      ${colors.range} ${range.min}%,
      ${colors.main} ${value}%,
      ${colors.range} ${value}%,
      ${colors.range} ${range.max}%,
      ${colors.invalid} ${range.max}%,
      ${colors.invalid} 100%
    )`;
  };

  return (
    <Card className="w-full mb-6">
      <CardContent className="space-y-6 p-6">
        {getAlertMessages().map((alert, index) => (
          <Alert key={index} variant={alert.type === 'success' ? 'default' : 'warning'}>
            {alert.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        ))}

        <Alert variant="default" className="bg-blue-50">
          <Info className="h-4 w-4" />
          <AlertDescription>
            AMDR Guidelines:
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div>Protein: {amdrRanges.protein.min}-{amdrRanges.protein.max}%</div>
              <div>Carbs: {amdrRanges.carbohydrate.min}-{amdrRanges.carbohydrate.max}%</div>
              <div>Fat: {amdrRanges.fats.min}-{amdrRanges.fats.max}%</div>
            </div>
          </AlertDescription>
        </Alert>

        {Object.entries(macros).map(([macro, value]) => (
          <div key={macro} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium capitalize">
                {macro}
              </label>
              <span className="text-sm text-gray-500">
                {value}%
              </span>
            </div>
            <div className="relative">
              <div className="absolute -top-2 left-0 right-0 flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span 
                  style={{left: `${amdrRanges[macro].min}%`}}
                  className="absolute transform -translate-x-1/2"
                >
                  min
                </span>
                <span 
                  style={{left: `${amdrRanges[macro].max}%`}}
                  className="absolute transform -translate-x-1/2"
                >
                  max
                </span>
                <span>100%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={(e) => handleMacroChange(macro, e.target.value)}
                className="w-full mt-4 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: getSliderBackground(macro)
                }}
              />
            </div>
            <div 
              className="h-2 rounded-full transition-all duration-200"
              style={{
                width: `${value}%`,
                backgroundColor: macroColors[macro].main
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
MacroRatioValidator.propTypes = {
  onValidRatios: PropTypes.func.isRequired
};

export default MacroRatioValidator;