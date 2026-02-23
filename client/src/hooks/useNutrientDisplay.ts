import { useState } from "react";
import type { NutrientMap } from "../services/api";

export interface DisplayNutrient {
  name: string;
  key: string;
  unit: string;
  value?: number;
}

export interface SelectedNutrientInfo {
  name: string;
  rda?: number;
  ul?: number;
  unit: string;
  amount?: number;
}

export interface UseNutrientDisplayReturn {
  selectedNutrient: SelectedNutrientInfo | null;
  showAmount: boolean;
  showBounds: boolean;
  handleNutrientClick: (nutrient: DisplayNutrient) => void;
  closePopup: () => void;
}

export const useNutrientDisplay = (
  nutrients: DisplayNutrient[],
  lowerBounds: NutrientMap | null | undefined,
  upperBounds: NutrientMap | null | undefined,
  showBoundsInLayout: boolean,
): UseNutrientDisplayReturn => {
  const [selectedNutrient, setSelectedNutrient] =
    useState<SelectedNutrientInfo | null>(null);

  const showAmount = nutrients.some((n) => n.value !== undefined);
  const showBounds = !!(lowerBounds || upperBounds) && showBoundsInLayout;

  const handleNutrientClick = (nutrient: DisplayNutrient): void => {
    setSelectedNutrient({
      name: nutrient.name,
      rda: lowerBounds ? lowerBounds[nutrient.key] : undefined,
      ul: upperBounds ? upperBounds[nutrient.key] : undefined,
      unit: nutrient.unit,
      amount: nutrient.value,
    });
  };

  const closePopup = (): void => setSelectedNutrient(null);

  return {
    selectedNutrient,
    showAmount,
    showBounds,
    handleNutrientClick,
    closePopup,
  };
};
