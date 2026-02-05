import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
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
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const showAmount = nutrients.some((n) => n.value !== undefined);
  const showBounds = (lowerBounds || upperBounds) && showBoundsInLayout;

  const getNutrientKey = (nutrient) => {
    return nutrient.key || `${nutrient.name} (${nutrient.unit})`;
  };

  const handleRowClick = (nutrient) => {
    const key = getNutrientKey(nutrient);
    setSelectedNutrient({
      name: nutrient.name,
      rda: lowerBounds ? lowerBounds[key] : undefined,
      ul: upperBounds ? upperBounds[key] : undefined,
      unit: nutrient.unit,
      amount: nutrient.value,
    });
  };

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending")
      direction = "descending";
    setSortConfig({ key, direction });
  };

  const getSortedNutrients = () => {
    const sortableNutrients = [...nutrients];
    if (sortConfig.key) {
      sortableNutrients.sort((a, b) => {
        let aValue, bValue;
        const keyA = getNutrientKey(a);
        const keyB = getNutrientKey(b);
        if (sortConfig.key === "nutrient") {
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
        } else if (sortConfig.key === "amount") {
          aValue = a.value || 0;
          bValue = b.value || 0;
        } else if (sortConfig.key === "rda") {
          aValue = (lowerBounds && lowerBounds[keyA]) || 0;
          bValue = (lowerBounds && lowerBounds[keyB]) || 0;
        } else if (sortConfig.key === "ul") {
          aValue = (upperBounds && upperBounds[keyA]) || 0;
          bValue = (upperBounds && upperBounds[keyB]) || 0;
        } else if (sortConfig.key === "unit") {
          aValue = a.unit.toLowerCase();
          bValue = b.unit.toLowerCase();
        }
        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return sortableNutrients;
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "ascending" ? " ↑" : " ↓";
  };

  const sortedNutrients = getSortedNutrients();

  return (
    <>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader style={{ position: "sticky", top: 0, zIndex: 10 }}>
            <TableRow>
              <TableHead
                onClick={() => handleSort("nutrient")}
                className="cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
              >
                Nutrient{getSortIcon("nutrient")}
              </TableHead>
              {showAmount && (
                <TableHead
                  onClick={() => handleSort("amount")}
                  className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
                >
                  Amount{getSortIcon("amount")}
                </TableHead>
              )}
              {showBounds && (
                <>
                  <TableHead
                    onClick={() => handleSort("rda")}
                    className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
                  >
                    RDA{getSortIcon("rda")}
                  </TableHead>
                  <TableHead
                    onClick={() => handleSort("ul")}
                    className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
                  >
                    UL{getSortIcon("ul")}
                  </TableHead>
                </>
              )}
              <TableHead
                onClick={() => handleSort("unit")}
                className="text-right cursor-pointer hover:bg-muted/50 transition-colors no-select text-foreground font-medium"
              >
                Unit{getSortIcon("unit")}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedNutrients.map((nutrient, index) => {
              const key = getNutrientKey(nutrient);
              return (
                <TableRow
                  key={index}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(nutrient)}
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
                        {lowerBounds[key]?.toLocaleString() ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {upperBounds[key]?.toLocaleString() ?? "N/A"}
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
          onClose={() => setSelectedNutrient(null)}
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
  const [selectedNutrient, setSelectedNutrient] = useState(null);

  const getNutrientKey = (nutrient) => {
    return nutrient.key || `${nutrient.name} (${nutrient.unit})`;
  };

  const showAmount = nutrients.some((n) => n.value !== undefined);
  const showBounds = (lowerBounds || upperBounds) && showBoundsInLayout;

  const handleCardClick = (nutrient) => {
    const key = getNutrientKey(nutrient);
    setSelectedNutrient({
      name: nutrient.name,
      rda: lowerBounds ? lowerBounds[key] : undefined,
      ul: upperBounds ? upperBounds[key] : undefined,
      unit: nutrient.unit,
      amount: nutrient.value,
    });
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-3">
        {nutrients.map((nutrient, index) => {
          const key = getNutrientKey(nutrient);
          return (
            <Card
              key={index}
              className="cursor-pointer hover:shadow-md transition-all duration-200"
              onClick={() => handleCardClick(nutrient)}
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
                          {lowerBounds && lowerBounds[key] != null
                            ? `${lowerBounds[key].toLocaleString()} ${
                                nutrient.unit
                              }`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">UL:</span>
                        <span className="font-medium">
                          {upperBounds && upperBounds[key] != null
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
          onClose={() => setSelectedNutrient(null)}
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
