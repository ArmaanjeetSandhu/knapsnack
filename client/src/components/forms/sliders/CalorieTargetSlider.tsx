import { Minus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import CategorisedSlider, { type Category } from "../../CategorisedSlider";

type CalorieCategory = Category & {
  name: "Calorie Deficit" | "Maintenance" | "Calorie Surplus";
};

const categories: CalorieCategory[] = [
  {
    name: "Calorie Deficit",
    icon: TrendingDown,
    baseColor: "orange",
    description: "Fat loss, cutting phase",
  },
  {
    name: "Maintenance",
    icon: Minus,
    baseColor: "green",
    description: "Weight maintenance",
  },
  {
    name: "Calorie Surplus",
    icon: TrendingUp,
    baseColor: "blue",
    description: "Muscle gain, bulking phase",
  },
];

const getCurrentCategory = (
  val: number,
  cats: CalorieCategory[],
): CalorieCategory => {
  if (val < 100) return cats[0];
  if (val === 100) return cats[1];
  return cats[2];
};

const isCategoryActive = (category: CalorieCategory, val: number): boolean => {
  switch (category.name) {
    case "Calorie Deficit":
      return val < 100;
    case "Maintenance":
      return val === 100;
    case "Calorie Surplus":
      return val > 100;
    default:
      return false;
  }
};

const getDetailText = (category: CalorieCategory): string => {
  if (category.name === "Calorie Deficit") return "Range: 75% - 95%";
  if (category.name === "Maintenance") return "Target: 100%";
  if (category.name === "Calorie Surplus") return "Range: 105% - 125%";
  return "";
};

interface CalorieTargetSliderProps {
  value: number;
  onChange: (value: number) => void;
  autoFocus?: boolean;
}

const CalorieTargetSlider = ({
  value,
  onChange,
  autoFocus,
}: CalorieTargetSliderProps) => (
  <CategorisedSlider
    value={value}
    onChange={onChange}
    autoFocus={autoFocus}
    min={75}
    max={125}
    step={5}
    title="Target Caloric Intake"
    Icon={Scale}
    gradientClass="bg-gradient-to-r from-orange-500 via-green-500 to-blue-500 dark:from-orange-400 dark:via-green-400 dark:to-blue-400"
    categories={categories}
    getCurrentCategory={
      getCurrentCategory as (val: number, cats: Category[]) => Category
    }
    isCategoryActive={
      isCategoryActive as (cat: Category, val: number) => boolean
    }
    getDetailText={getDetailText as (cat: Category, val: number) => string}
    formatValue={(val) => `${val}%`}
    labels={["75%", "125%"]}
  />
);

export default CalorieTargetSlider;
