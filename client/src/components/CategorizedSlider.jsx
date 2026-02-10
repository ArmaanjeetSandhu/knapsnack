import { useEffect, useRef, useState } from "react";

const CategorizedSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  title,
  Icon, 
  categories,
  gradientClass,
  getCurrentCategory,
  isCategoryActive,
  getDetailText,
  formatValue,
  labels,
  autoFocus,
}) => {
  const inputRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

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
      orange: {
        text: "text-orange-500 dark:text-orange-400",
        bg: "bg-orange-500 dark:bg-orange-400",
        border: "border-orange-500 dark:border-orange-400",
        bgOpacity: "bg-orange-500/20 dark:bg-orange-400/20",
      },
    };
    return colorMap[baseColor] || colorMap.gray;
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

  const currentCategory = getCurrentCategory(value, categories);
  const progress = ((value - min) / (max - min)) * 100;
  const currentColorClasses = getColorClasses(currentCategory.baseColor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`w-5 h-5 ${currentColorClasses.text}`} />}
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        <span className="text-lg font-bold text-foreground">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>

      <div className="relative">
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${gradientClass}`}
            style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
          />
        </div>
        <input
          ref={inputRef}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>{labels?.[0] || min}</span>
          <span>{labels?.[1] || max}</span>
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
            {getDetailText(currentCategory, value)}
          </div>
        </div>
      </div>

      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${categories.length}, minmax(0, 1fr))`,
        }}
      >
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

export default CategorizedSlider;
