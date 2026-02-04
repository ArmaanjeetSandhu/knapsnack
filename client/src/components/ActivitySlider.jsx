import {
  Activity,
  Award,
  Briefcase,
  Coffee,
  Dumbbell,
  Heart,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
const ActivitySlider = ({ value, onChange, autoFocus }) => {
  const inputRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const categories = [
    {
      name: "Sedentary",
      icon: Coffee,
      baseColor: "gray",
      description: "Office workers, drivers",
      min: 1.2,
      max: 1.4,
    },
    {
      name: "Light Activity",
      icon: Briefcase,
      baseColor: "green",
      description: "Teachers, retail workers",
      min: 1.4,
      max: 1.6,
    },
    {
      name: "Moderate Activity",
      icon: Activity,
      baseColor: "blue",
      description: "Construction workers, waiters",
      min: 1.6,
      max: 1.8,
    },
    {
      name: "Very Active",
      icon: Dumbbell,
      baseColor: "purple",
      description: "Athletes, dancers",
      min: 1.8,
      max: 2.0,
    },
    {
      name: "Extremely Active",
      icon: Award,
      baseColor: "red",
      description: "Competitive athletes, heavy manual laborers",
      min: 2.0,
      max: 2.4,
    },
  ];
  const getColorClasses = (baseColor) => {
    const colorMap = {
      gray: {
        text: "text-gray-500 dark:text-gray-400",
        bg: "bg-gray-500 dark:bg-gray-400",
        border: "border-gray-500 dark:border-gray-400",
        bgOpacity: "bg-gray-500/20 dark:bg-gray-400/20",
      },
      green: {
        text: "text-green-500 dark:text-green-400",
        bg: "bg-green-500 dark:bg-green-400",
        border: "border-green-500 dark:border-green-400",
        bgOpacity: "bg-green-500/20 dark:bg-green-400/20",
      },
      blue: {
        text: "text-blue-500 dark:text-blue-400",
        bg: "bg-blue-500 dark:bg-blue-400",
        border: "border-blue-500 dark:border-blue-400",
        bgOpacity: "bg-blue-500/20 dark:bg-blue-400/20",
      },
      purple: {
        text: "text-purple-500 dark:text-purple-400",
        bg: "bg-purple-500 dark:bg-purple-400",
        border: "border-purple-500 dark:border-purple-400",
        bgOpacity: "bg-purple-500/20 dark:bg-purple-400/20",
      },
      red: {
        text: "text-red-500 dark:text-red-400",
        bg: "bg-red-500 dark:bg-red-400",
        border: "border-red-500 dark:border-red-400",
        bgOpacity: "bg-red-500/20 dark:bg-red-400/20",
      },
    };
    return colorMap[baseColor];
  };
  const getCurrentCategory = (val) => {
    if (val < 1.4) return categories[0];
    else if (val < 1.6) return categories[1];
    else if (val < 1.8) return categories[2];
    else if (val < 2.0) return categories[3];
    else return categories[4];
  };
  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
    setIsAnimating(true);
  };
  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);
  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isAnimating]);
  const currentCategory = getCurrentCategory(value);
  const progress = ((value - 1.2) / (2.4 - 1.2)) * 100;
  const currentColorClasses = getColorClasses(currentCategory.baseColor);
  const isCategoryActive = (category, value) => {
    return value >= category.min && value < category.max;
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500 dark:text-red-400" />
          <h3 className="text-sm font-medium text-foreground">
            Activity Level
          </h3>
        </div>
        <span className="text-lg font-bold text-foreground">
          {value.toFixed(1)}
        </span>
      </div>
      <div className="relative">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gray-400 via-blue-500 to-red-500 dark:from-gray-500 dark:via-blue-400 dark:to-red-400 transition-all duration-300"
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <input
          ref={inputRef}
          type="range"
          min="1.2"
          max="2.4"
          step="0.1"
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>1.2</span>
          <span>2.4</span>
        </div>
      </div>
      <div
        className={`transform transition-all duration-300 ${
          isAnimating ? "scale-105" : "scale-100"
        }`}
      >
        <div
          className={`p-4 rounded-lg bg-card dark:bg-card border ${currentColorClasses.border} shadow-sm`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-full ${currentColorClasses.bgOpacity}`}
            >
              <currentCategory.icon
                className={`w-5 h-5 ${currentColorClasses.text}`}
              />
            </div>
            <div>
              <h4
                className={`text-base font-semibold ${currentColorClasses.text}`}
              >
                {currentCategory.name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentCategory.description}
              </p>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Range: {currentCategory.min.toFixed(1)} -{" "}
            {currentCategory.max.toFixed(1)}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {categories.map((cat) => {
          const colorClasses = getColorClasses(cat.baseColor);
          return (
            <div
              key={cat.name}
              className={`h-2 rounded-full transition-all duration-300 ${
                isCategoryActive(cat, value)
                  ? colorClasses.bg
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
};
export default ActivitySlider;
