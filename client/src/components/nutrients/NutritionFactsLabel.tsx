import { Download } from "lucide-react";
import React, { useRef } from "react";

import {
  VITAMINS_CONFIG,
  MINERALS_CONFIG,
  OTHERS_CONFIG,
  type NutrientConfig,
} from "../../config/nutrientData";
import { adjustNutrientsForServingSize } from "../../lib/foodHelpers";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

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
  const labelRef = useRef<HTMLDivElement>(null);

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

  const handleDownload = async () => {
    if (!labelRef.current) return;
    try {
      const { default: html2canvas } = await import("html2canvas");
      const isDark = document.documentElement.classList.contains("dark");
      const canvas = await html2canvas(labelRef.current, {
        scale: 2,
        backgroundColor: isDark ? "#141210" : "#ffffff",
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      const safeFileName = foodName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      link.download = `${safeFileName}_nutrition_label.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error("Failed to download label image:", error);
    }
  };

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
        className={`flex justify-between border-b border-neutral-400 py-1 text-sm dark:border-neutral-600 ${
          indent ? "pl-4" : ""
        }`}
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
      <div>
        <div className="h-4 bg-white dark:bg-[#141210]"></div>
        <div
          className="border-black text-sm font-black uppercase dark:border-[#f2f2f2]"
          style={{
            borderBottomWidth: 2,
            borderBottomStyle: "solid",
            paddingBottom: 4,
          }}
        >
          {title}
        </div>
        {activeRows.map((n) => renderRow(n.name, n.key, n.unit, false, false))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto bg-white text-black dark:bg-[#141210] dark:text-[#f2f2f2] sm:max-w-lg [&>button]:hidden">
        <DialogHeader>
          <DialogTitle className="sr-only">
            Nutrition Facts for {foodName}
          </DialogTitle>
        </DialogHeader>

        <div
          ref={labelRef}
          className="relative border-2 border-black bg-white p-2 font-sans dark:border-[#f2f2f2] dark:bg-[#141210] md:p-4"
        >
          <button
            onClick={handleDownload}
            data-html2canvas-ignore="true"
            className="absolute right-2 top-2 text-neutral-400 transition-colors hover:text-black focus:outline-none dark:hover:text-[#f2f2f2] md:right-4 md:top-4"
            title="Download Label as Image"
            aria-label="Download Label as Image"
          >
            <Download className="h-5 w-5" />
          </button>

          <h1
            className="border-black font-black tracking-tight dark:border-[#f2f2f2]"
            style={{
              borderBottomWidth: 4,
              borderBottomStyle: "solid",
              paddingBottom: 4,
              marginBottom: 0,
              fontSize: "1.75rem",
            }}
          >
            Nutrition Facts
          </h1>

          <div
            className="border-black dark:border-[#f2f2f2]"
            style={{
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            <div className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
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

          <div
            className="flex justify-end text-xs font-bold"
            style={{ marginTop: 8, paddingBottom: 4 }}
          >
            <div className="flex w-1/2 justify-end" style={{ gap: 16 }}>
              <span className="w-20 text-right">Per Serving</span>
              <span className="w-20 text-right">Total</span>
            </div>
          </div>

          <div
            className="border-black dark:border-[#f2f2f2]"
            style={{ borderBottomWidth: 2, borderBottomStyle: "solid" }}
          ></div>

          <div
            className="flex items-end justify-between border-black dark:border-[#f2f2f2]"
            style={{
              borderBottomWidth: 4,
              borderBottomStyle: "solid",
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            <div>
              <span className="font-black" style={{ fontSize: "1.15rem" }}>
                Calories
              </span>
            </div>
            <div
              className="flex w-1/2 justify-end font-black"
              style={{ gap: 16, fontSize: "1.05rem" }}
            >
              <span className="w-20 text-right">
                {perServingCals.toFixed(2)}
              </span>
              <span className="w-20 text-right">
                {totalServingCals.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="h-4 bg-white dark:bg-[#141210]"></div>
          <div
            className="border-black text-sm font-black uppercase dark:border-[#f2f2f2]"
            style={{
              borderBottomWidth: 2,
              borderBottomStyle: "solid",
              paddingBottom: 4,
            }}
          >
            Macronutrients
          </div>
          {renderRow("Water", "Water (mL)", "mL", false, true)}
          {renderRow("Total Fat", "fats", "g", false, true)}
          {renderRow("Saturated Fat", "saturated_fats", "g", true, false)}
          {renderRow("Total Carbohydrate", "carbohydrate", "g", false, true)}
          {renderRow("Dietary Fibre", "fibre", "g", true, false)}
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
