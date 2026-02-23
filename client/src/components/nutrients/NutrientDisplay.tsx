import { useCallback } from "react";
import {
  useNutrientDisplay,
  type DisplayNutrient,
} from "../../hooks/useNutrientDisplay";
import { useSortableData } from "../../hooks/useSortableData";
import type { NutrientMap } from "../../services/api";
import NutrientInfoPopup from "../nutrients/NutrientInfoPopup";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const BlinkingDot = () => (
  <div className="h-2 w-2 shrink-0 animate-[pulse_2s_ease-in-out_infinite] rounded-full bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" />
);

const formatBoundValue = (
  bounds: NutrientMap | null | undefined,
  key: string,
  unit: string,
): string => {
  const value = bounds?.[key];
  if (value !== undefined && value !== null && value !== ("" as unknown))
    return unit ? `${value.toLocaleString()} ${unit}` : value.toLocaleString();
  return "N/A";
};

interface NutrientDisplayProps {
  nutrients: DisplayNutrient[];
  lowerBounds?: NutrientMap | null;
  upperBounds?: NutrientMap | null;
  showBoundsInLayout?: boolean;
}

export const NutrientTable = ({
  nutrients,
  lowerBounds,
  upperBounds,
  showBoundsInLayout = true,
}: NutrientDisplayProps) => {
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
    (nutrient: DisplayNutrient, key: string): string | number => {
      if (key === "nutrient") return nutrient.name.toLowerCase();
      if (key === "amount") return nutrient.value ?? 0;
      if (key === "rda") return lowerBounds?.[nutrient.key] ?? 0;
      if (key === "ul") return upperBounds?.[nutrient.key] ?? 0;
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
                className="no-select cursor-pointer font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                Nutrient{getSortIcon("nutrient")}
              </TableHead>
              {showAmount && (
                <TableHead
                  onClick={() => requestSort("amount")}
                  className="no-select cursor-pointer text-right font-medium text-foreground transition-colors hover:bg-muted/50"
                >
                  Amount{getSortIcon("amount")}
                </TableHead>
              )}
              {showBounds && (
                <>
                  <TableHead
                    onClick={() => requestSort("rda")}
                    className="no-select cursor-pointer text-right font-medium text-foreground transition-colors hover:bg-muted/50"
                  >
                    RDA{getSortIcon("rda")}
                  </TableHead>
                  <TableHead
                    onClick={() => requestSort("ul")}
                    className="no-select cursor-pointer text-right font-medium text-foreground transition-colors hover:bg-muted/50"
                  >
                    UL{getSortIcon("ul")}
                  </TableHead>
                </>
              )}
              <TableHead
                onClick={() => requestSort("unit")}
                className="no-select cursor-pointer text-right font-medium text-foreground transition-colors hover:bg-muted/50"
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
                  className="cursor-pointer transition-colors hover:bg-muted/50"
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
                        {lowerBounds?.[key] != null
                          ? lowerBounds[key].toLocaleString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {upperBounds?.[key] != null
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
}: NutrientDisplayProps) => {
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
      <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nutrients.map((nutrient, index) => {
          const key = nutrient.key;
          return (
            <Card
              key={index}
              className="cursor-pointer transition-all duration-200 hover:shadow-md"
              onClick={() => handleNutrientClick(nutrient)}
            >
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <BlinkingDot />
                  <h4 className="text-sm font-medium text-muted-foreground">
                    {nutrient.name}
                  </h4>
                </div>
                <div className="mt-2 space-y-1">
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
                          {formatBoundValue(lowerBounds, key, nutrient.unit)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">UL:</span>
                        <span className="font-medium">
                          {formatBoundValue(upperBounds, key, nutrient.unit)}
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
