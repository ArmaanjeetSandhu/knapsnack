import { useState, useEffect } from 'react';
import { Scale, TrendingDown, Minus, TrendingUp } from 'lucide-react';
import PropTypes from 'prop-types';

const CalorieTargetSlider = ({ value, onChange }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const categories = [
    { 
      name: "Calorie Deficit", 
      icon: TrendingDown, 
      baseColor: "orange", 
      description: "Fat loss, cutting phase" 
    },
    { 
      name: "Maintenance", 
      icon: Minus, 
      baseColor: "green", 
      description: "Weight maintenance" 
    },
    { 
      name: "Calorie Surplus", 
      icon: TrendingUp, 
      baseColor: "blue", 
      description: "Muscle gain, bulking phase" 
    }
  ];

  const getColorClasses = (baseColor) => {
    const colorMap = {
      orange: {
        text: "text-orange-500 dark:text-orange-400",
        bg: "bg-orange-500 dark:bg-orange-400",
        border: "border-orange-500 dark:border-orange-400",
        bgOpacity: "bg-orange-500/20 dark:bg-orange-400/20"
      },
      green: {
        text: "text-green-500 dark:text-green-400",
        bg: "bg-green-500 dark:bg-green-400",
        border: "border-green-500 dark:border-green-400",
        bgOpacity: "bg-green-500/20 dark:bg-green-400/20"
      },
      blue: {
        text: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-500 dark:bg-blue-400",
        border: "border-blue-500 dark:border-blue-400",
        bgOpacity: "bg-blue-500/20 dark:bg-blue-400/20"
      }
    };
    return colorMap[baseColor];
  };

  const getCurrentCategory = (val) => {
    if (val < 100) {
      return categories[0];
    } else if (val === 100) {
      return categories[1];
    } else {
      return categories[2];
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
  const currentColorClasses = getColorClasses(currentCategory.baseColor);

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
          <Scale className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <h3 className="text-sm font-medium text-foreground">Target Caloric Intake</h3>
        </div>
        <span className="text-lg font-bold text-foreground">{value}%</span>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 dark:from-orange-400 dark:via-green-400 dark:to-blue-400 transition-all duration-300"
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
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>75%</span>
          <span>125%</span>
        </div>
      </div>

      <div className={`transform transition-all duration-300 ${isAnimating ? 'scale-105' : 'scale-100'}`}>
        <div className={`p-4 rounded-lg bg-card dark:bg-card border ${currentColorClasses.border} shadow-sm`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${currentColorClasses.bgOpacity}`}>
              <currentCategory.icon className={`w-5 h-5 ${currentColorClasses.text}`} />
            </div>
            <div>
              <h4 className={`text-base font-semibold ${currentColorClasses.text}`}>
                {currentCategory.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentCategory.description}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {currentCategory.name === "Calorie Deficit" && "Range: 75% - 95%"}
            {currentCategory.name === "Maintenance" && "Target: 100%"}
            {currentCategory.name === "Calorie Surplus" && "Range: 105% - 125%"}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {categories.map((cat) => {
          const colorClasses = getColorClasses(cat.baseColor);
          return (
            <div
              key={cat.name}
              className={`h-2 rounded-full transition-all duration-300 ${
                isCategoryActive(cat, value)
                  ? colorClasses.bg
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};

CalorieTargetSlider.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired
};

export default CalorieTargetSlider;