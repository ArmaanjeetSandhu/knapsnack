import { useCallback } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { useNutrientDisplay } from "../hooks/useNutrientDisplay";
import { useSortableData } from "../hooks/useSortableData";
import NutrientInfoPopup from "./NutrientInfoPopup";

const BlinkingDot = () => (
  <div className="w-2 h-2 shrink-0 rounded-full bg-blue-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
);

export const NutrientTable = ({
  nutrients,
  lowerBounds,
  upperBounds,
  showBoundsInLayout = true,
}) => {
  const {
    selectedNutrient,
    showAmount,
    showBounds,
    handleNutrientClick,
    closePopup,
  } = useNutrientDisplay(
    nutrients,
    lowerBounds,
    upperBounds,
    showBoundsInLayout,
  );

  const getNutrientSortValue = useCallback(
    (nutrient, key) => {
      const nutrientKey = nutrient.key;
      if (key === "nutrient") return nutrient.name.toLowerCase();
      if (key === "amount") return nutrient.value || 0;
      if (key === "rda") return (lowerBounds && lowerBounds[nutrientKey]) || 0;
      if (key === "ul") return (upperBounds && upperBounds[nutrientKey]) || 0;
      if (key === "unit") return nutrient.unit.toLowerCase();
      return 0;
    },
    [lowerBounds, upperBounds],
  );

  const {
    sortedItems: sortedNutrients,
    requestSort,
    getSortIcon,
  } = useSortableData(nutrients, getNutrientSortValue);

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <TableRow>
              <TableHead
                onClick={() => requestSort("nutrient")}
                className="cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
              >
                Nutrient{getSortIcon("nutrient")}
              </TableHead>
              {showAmount && (
                <TableHead
                  onClick={() => requestSort("amount")}
                  className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
                >
                  Amount{getSortIcon("amount")}
                </TableHead>
              )}
              {showBounds && (
                <>
                  <TableHead
                    onClick={() => requestSort("rda")}
                    className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
                  >
                    RDA{getSortIcon("rda")}
                  </TableHead>
                  <TableHead
                    onClick={() => requestSort("ul")}
                    className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
                  >
                    UL{getSortIcon("ul")}
                  </TableHead>
                </>
              )}
              <TableHead
                onClick={() => requestSort("unit")}
                className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
              >
                Unit{getSortIcon("unit")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedNutrients.map((nutrient, index) => {
              const key = nutrient.key;
              return (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleNutrientClick(nutrient)}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <BlinkingDot />
                      <span>{nutrient.name}</span>
                    </div>
                  </TableCell>
                  {showAmount && (
                    <TableCell className="text-right">
                      {nutrient.value}
                    </TableCell>
                  )}
                  {showBounds && (
                    <>
                      <TableCell className="text-right">
                        {lowerBounds[key] !== "" && lowerBounds[key] != null
                          ? lowerBounds[key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {upperBounds[key] !== "" && upperBounds[key] != null
                          ? upperBounds[key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                    </>
                  )}
                  <TableCell className="text-right">{nutrient.unit}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {selectedNutrient && (
        <NutrientInfoPopup
          isOpen={true}
          onClose={closePopup}
          nutrient={selectedNutrient.name}
          rda={selectedNutrient.rda}
          ul={selectedNutrient.ul}
          unit={selectedNutrient.unit}
          amount={selectedNutrient.amount}
        />
      )}
    </>
  );
};

export const NutrientCards = ({
  nutrients,
  lowerBounds,
  upperBounds,
  showBoundsInLayout = true,
}) => {
  const {
    selectedNutrient,
    showAmount,
    showBounds,
    handleNutrientClick,
    closePopup,
  } = useNutrientDisplay(
    nutrients,
    lowerBounds,
    upperBounds,
    showBoundsInLayout,
  );

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-3">
        {nutrients.map((nutrient, index) => {
          const key = nutrient.key;
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => handleNutrientClick(nutrient)}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <BlinkingDot />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {nutrient.name}
                  </h4>
                </div>
                <div className="space-y-1 mt-2">
                  {showAmount && (
                    <div className="flex justify-between">
                      <span className="text-sm">Amount:</span>
                      <span className="font-medium">
                        {nutrient.value} {nutrient.unit}
                      </span>
                    </div>
                  )}
                  {showBounds && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-sm">RDA:</span>
                        <span className="font-medium">
                          {lowerBounds &&
                          lowerBounds[key] !== "" &&
                          lowerBounds[key] != null
                            ? `${lowerBounds[key].toLocaleString()} ${
                                nutrient.unit
                              }`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">UL:</span>
                        <span className="font-medium">
                          {upperBounds &&
                          upperBounds[key] !== "" &&
                          upperBounds[key] != null
                            ? `${upperBounds[key].toLocaleString()} ${
                                nutrient.unit
                              }`
                            : "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {selectedNutrient && (
        <NutrientInfoPopup
          isOpen={true}
          onClose={closePopup}
          nutrient={selectedNutrient.name}
          rda={selectedNutrient.rda}
          ul={selectedNutrient.ul}
          unit={selectedNutrient.unit}
          amount={selectedNutrient.amount}
        />
      )}
    </>
  );
};
