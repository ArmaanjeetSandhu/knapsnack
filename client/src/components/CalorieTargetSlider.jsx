import { useState, useEffect } from 'react';
import { Scale, TrendingDown, Minus, TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';

const CalorieTargetSlider = ({ value, onChange }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const categories = [
    { 
      name: "Calorie Deficit", 
      icon: TrendingDown, 
      color: "text-orange-500", 
      description: "Fat loss, cutting phase" 
    },
    { 
      name: "Maintenance", 
      icon: Minus, 
      color: "text-green-500", 
      description: "Weight maintenance" 
    },
    { 
      name: "Calorie Surplus", 
      icon: TrendingUp, 
      color: "text-blue-500", 
      description: "Muscle gain, bulking phase" 
    }
  ];

  const getCurrentCategory = (val) => {
    if (val < 100) {
      return categories[0]; // Deficit
    } else if (val === 100) {
      return categories[1]; // Maintenance
    } else {
      return categories[2]; // Surplus
    }
  };

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);

  const currentCategory = getCurrentCategory(value);
  const progress = ((value - 75) / (125 - 75)) * 100;

  const isCategoryActive = (category, value) => {
    switch (category.name) {
      case "Calorie Deficit":
        return value < 100;
      case "Maintenance":
        return value === 100;
      case "Calorie Surplus":
        return value > 100;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Scale className="w-5 h-5 text-blue-500" />
          <h3 className="text-sm font-medium">Target Caloric Intake</h3>
        </div>
        <span className="text-lg font-bold">{value}%</span>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 transition-all duration-300"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <input
          type="range"
          min="75"
          max="125"
          step="5"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>75%</span>
          <span>125%</span>
        </div>
      </div>

      <div className={`transform transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
        <div className={`p-4 rounded-lg bg-gradient-to-br from-white to-gray-50 border ${currentCategory.color.replace('text', 'border')} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentCategory.color.replace('text', 'bg')} bg-opacity-20`}>
              <currentCategory.icon className={`w-5 h-5 ${currentCategory.color}`} />
            </div>
            <div>
              <h4 className={`text-base font-semibold ${currentCategory.color}`}>
                {currentCategory.name}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5">
                {currentCategory.description}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-600">
            {currentCategory.name === "Calorie Deficit" && "Range: 75% - 95%"}
            {currentCategory.name === "Maintenance" && "Target: 100%"}
            {currentCategory.name === "Calorie Surplus" && "Range: 105% - 125%"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`h-2 rounded-full transition-all duration-300 ${
              isCategoryActive(cat, value)
                ? cat.color.replace('text-orange-500', 'bg-orange-500')
                  .replace('text-green-500', 'bg-green-500')
                  .replace('text-blue-500', 'bg-blue-500')
                : 'bg-gray-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

CalorieTargetSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default CalorieTargetSlider;