import { Minus, Scale, TrendingDown, TrendingUp } from "lucide-react";
import CategorisedSlider from "../../CategorisedSlider";

const CalorieTargetSlider = ({ value, onChange, autoFocus }) => {
  const categories = [
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

  const getCurrentCategory = (val, cats) => {
    if (val < 100) return cats[0];
    else if (val === 100) return cats[1];
    else return cats[2];
  };

  const isCategoryActive = (category, val) => {
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

  const getDetailText = (category) => {
    if (category.name === "Calorie Deficit") return "Range: 75% - 95%";
    if (category.name === "Maintenance") return "Target: 100%";
    if (category.name === "Calorie Surplus") return "Range: 105% - 125%";
    return "";
  };

  return (
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
      getCurrentCategory={getCurrentCategory}
      isCategoryActive={isCategoryActive}
      getDetailText={getDetailText}
      formatValue={(val) => `${val}%`}
      labels={["75%", "125%"]}
    />
  );
};

export default CalorieTargetSlider;
