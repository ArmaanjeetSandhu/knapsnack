import {
  Activity,
  Award,
  Briefcase,
  Coffee,
  Dumbbell,
  Heart,
} from "lucide-react";
import CategorisedSlider from "../../CategorisedSlider";

const ActivitySlider = ({ value, onChange, autoFocus }) => {
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

  const getCurrentCategory = (val, cats) => {
    if (val < 1.4) return cats[0];
    else if (val < 1.6) return cats[1];
    else if (val < 1.8) return cats[2];
    else if (val < 2.0) return cats[3];
    else return cats[4];
  };

  const isCategoryActive = (category, val) => {
    return val >= category.min && val < category.max;
  };

  const getDetailText = (category) =>
    `Range: ${category.min.toFixed(1)} - ${category.max.toFixed(1)}`;

  return (
    <CategorisedSlider
      value={value}
      onChange={onChange}
      autoFocus={autoFocus}
      min={1.2}
      max={2.4}
      step={0.1}
      title="Activity Level"
      Icon={Heart}
      gradientClass="bg-gradient-to-r from-gray-400 via-blue-500 to-red-500 dark:from-gray-500 dark:via-blue-400 dark:to-red-400"
      categories={categories}
      getCurrentCategory={getCurrentCategory}
      isCategoryActive={isCategoryActive}
      getDetailText={getDetailText}
      formatValue={(val) => val.toFixed(1)}
      labels={["1.2", "2.4"]}
    />
  );
};

export default ActivitySlider;
