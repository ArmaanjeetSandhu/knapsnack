import { type ComponentType, useEffect, useRef, useState } from "react";

type Color = "gray" | "green" | "blue" | "purple" | "red" | "orange";

interface ColorClasses {
  text: string;
  bg: string;
  border: string;
  bgOpacity: string;
}

const COLORS: Color[] = ["gray", "green", "blue", "purple", "red", "orange"];

const COLOR_MAP = COLORS.reduce<Record<Color, ColorClasses>>(
  (acc, color) => {
    acc[color] = {
      text: `text-${color}-500 dark:text-${color}-400`,
      bg: `bg-${color}-500 dark:bg-${color}-400`,
      border: `border-${color}-500 dark:border-${color}-400`,
      bgOpacity: `bg-${color}-500/20 dark:bg-${color}-400/20`,
    };
    return acc;
  },
  {} as Record<Color, ColorClasses>,
);

export interface Category {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  baseColor: Color;
  [key: string]: unknown;
}

export interface CategorisedSliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  title: string;
  Icon?: ComponentType<{ className?: string }>;
  categories: Category[];
  gradientClass: string;
  getCurrentCategory: (value: number, categories: Category[]) => Category;
  isCategoryActive: (cat: Category, value: number) => boolean;
  getDetailText: (cat: Category, value: number) => React.ReactNode;
  formatValue?: (value: number) => string;
  labels?: [string, string];
  autoFocus?: boolean;
}

const CategorisedSlider = ({
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
}: CategorisedSliderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const getColorClasses = (baseColor: string): ColorClasses =>
    COLOR_MAP[baseColor as Color] ?? COLOR_MAP.gray;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(e.target.value));
    setIsAnimating(true);
  };

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!isAnimating) return;
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [isAnimating]);

  const currentCategory = getCurrentCategory(value, categories);
  const progress = ((value - min) / (max - min)) * 100;
  const currentColorClasses = getColorClasses(currentCategory.baseColor);
  const CategoryIcon = currentCategory.icon;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {Icon && <Icon className={`h-5 w-5 ${currentColorClasses.text}`} />}
          <h3 className="text-sm font-medium text-foreground">{title}</h3>
        </div>
        <span className="text-lg font-bold text-foreground">
          {formatValue ? formatValue(value) : value}
        </span>
      </div>

      <div className="group relative">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 transition-all duration-200 group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 dark:bg-gray-700">
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
          className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          <span>{labels?.[0] ?? min}</span>
          <span>{labels?.[1] ?? max}</span>
        </div>
      </div>

      <div
        className={`transform transition-all duration-300 ${isAnimating ? "scale-105" : "scale-100"}`}
      >
        <div
          className={`rounded-lg border bg-card p-4 dark:bg-card ${currentColorClasses.border} shadow-sm`}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 ${currentColorClasses.bgOpacity}`}
            >
              <CategoryIcon className={`h-5 w-5 ${currentColorClasses.text}`} />
            </div>
            <div>
              <h4
                className={`text-base font-semibold ${currentColorClasses.text}`}
              >
                {currentCategory.name}
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
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

export default CategorisedSlider;
