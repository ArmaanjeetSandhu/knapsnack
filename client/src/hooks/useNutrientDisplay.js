import { useState } from "react";

export const useNutrientDisplay = (
  nutrients,
  lowerBounds,
  upperBounds,
  showBoundsInLayout,
) => {
  const [selectedNutrient, setSelectedNutrient] = useState(null);

  const showAmount = nutrients.some((n) => n.value !== undefined);
  const showBounds = (lowerBounds || upperBounds) && showBoundsInLayout;

  const handleNutrientClick = (nutrient) => {
    setSelectedNutrient({
      name: nutrient.name,
      rda: lowerBounds ? lowerBounds[nutrient.key] : undefined,
      ul: upperBounds ? upperBounds[nutrient.key] : undefined,
      unit: nutrient.unit,
      amount: nutrient.value,
    });
  };

  const closePopup = () => setSelectedNutrient(null);

  return {
    selectedNutrient,
    showAmount,
    showBounds,
    handleNutrientClick,
    closePopup,
  };
};
