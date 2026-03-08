import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { adjustNutrientsForServingSize } from "../../lib/foodHelpers";
import {
  VITAMINS_CONFIG,
  MINERALS_CONFIG,
  OTHERS_CONFIG,
  type NutrientConfig,
} from "../../config/nutrientData";
import type { NutrientMap } from "../../services/api";

interface NutritionFactsLabelProps {
  foodName: string;
  servingSize: number;
  servings: number;
  nutrients: NutrientMap;
  isOpen: boolean;
  onClose: () => void;
}

const NutritionFactsLabel: React.FC<NutritionFactsLabelProps> = ({
  foodName,
  servingSize,
  servings,
  nutrients,
  isOpen,
  onClose,
}) => {
  const perServingNutrients = adjustNutrientsForServingSize(
    nutrients,
    servingSize,
  );
  const totalServingSize = servingSize * servings;
  const totalServingNutrients = adjustNutrientsForServingSize(
    nutrients,
    totalServingSize,
  );

  const calculateCalories = (n: NutrientMap) =>
    (n.protein || 0) * 4 + (n.carbohydrate || 0) * 4 + (n.fats || 0) * 9;

  const perServingCals = calculateCalories(perServingNutrients);
  const totalServingCals = calculateCalories(totalServingNutrients);

  const renderRow = (
    label: string,
    key: string,
    unit: string,
    indent = false,
    isBold = false,
  ) => {
    const perVal = perServingNutrients[key] ?? 0;
    const totVal = totalServingNutrients[key] ?? 0;

    if (perVal.toFixed(2) === "0.00" && totVal.toFixed(2) === "0.00")
      return null;

    return (
      <div
        className={`flex justify-between border-b border-neutral-400 py-1 text-sm ${indent ? "pl-4" : ""}`}
      >
        <span className={isBold ? "font-bold" : "font-medium"}>{label}</span>
        <div className="flex w-1/2 justify-end space-x-2 sm:space-x-4">
          <span className="w-20 text-right">
            {perVal.toFixed(2)}
            <span className="text-muted-foreground"> {unit}</span>
          </span>
          <span className="w-20 text-right">
            {totVal.toFixed(2)}
            <span className="text-muted-foreground"> {unit}</span>
          </span>
        </div>
      </div>
    );
  };

  const renderSection = (title: string, config: NutrientConfig[]) => {
    if (!config || config.length === 0) return null;

    const activeRows = config.filter((n) => {
      const p = perServingNutrients[n.key] ?? 0;
      const t = totalServingNutrients[n.key] ?? 0;
      return p.toFixed(2) !== "0.00" || t.toFixed(2) !== "0.00";
    });

    if (activeRows.length === 0) return null;

    return (
      <div className="mt-2">
        <div className="border-b-2 border-black pb-1 text-sm font-black uppercase">
          {title}
        </div>
        {activeRows.map((n) => renderRow(n.name, n.key, n.unit, false, false))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto bg-white text-black dark:bg-white dark:text-black sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Nutrition Facts for {foodName}
          </DialogTitle>
        </DialogHeader>

        <div className="border-2 border-black p-2 font-sans md:p-4">
          <h1 className="border-b-4 border-black pb-1 text-2xl font-black tracking-tight md:text-3xl">
            Nutrition Facts
          </h1>

          <div className="border-b-2 border-black pb-2 pt-2">
            <div className="text-lg font-semibold text-neutral-800">
              {foodName}
            </div>

            <div className="mt-2 flex justify-between text-sm font-medium">
              <span>Serving Size</span>
              <span>{servingSize}g</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>No. of Servings</span>
              <span>{servings}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Total Serving</span>
              <span>{totalServingSize.toFixed(1)}g</span>
            </div>
          </div>

          <div className="mt-2 flex justify-end pb-1 text-xs font-bold sm:text-sm">
            <div className="flex w-1/2 justify-end space-x-2 sm:space-x-4">
              <span className="w-20 text-right">Per Serving</span>
              <span className="w-20 text-right">Total</span>
            </div>
          </div>

          <div className="border-b-2 border-black"></div>

          <div className="flex items-end justify-between border-b-4 border-black py-2">
            <div>
              <span className="text-lg font-black md:text-xl">Calories</span>
            </div>
            <div className="flex w-1/2 justify-end space-x-2 font-black sm:space-x-4 md:text-lg">
              <span className="w-20 text-right">
                {perServingCals.toFixed(2)}
              </span>
              <span className="w-20 text-right">
                {totalServingCals.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="border-b-2 border-black pb-1 pt-2 text-sm font-black uppercase">
            Macronutrients
          </div>
          {renderRow("Water", "Water (mL)", "mL", false, true)}
          {renderRow("Total Fat", "fats", "g", false, true)}
          {renderRow("Saturated Fat", "saturated_fats", "g", true, false)}
          {renderRow("Total Carbohydrate", "carbohydrate", "g", false, true)}
          {renderRow("Dietary Fiber", "fibre", "g", true, false)}
          {renderRow("Protein", "protein", "g", false, true)}

          {renderSection("Vitamins", VITAMINS_CONFIG)}
          {renderSection("Minerals", MINERALS_CONFIG)}
          {renderSection("Others", OTHERS_CONFIG)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NutritionFactsLabel;
