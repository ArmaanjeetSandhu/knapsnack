import PropTypes from "prop-types";
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
  <div className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
);
export const NutrientTable = ({ nutrients, lowerBounds, upperBounds }) => {
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const handleRowClick = (nutrient) => {
    const key = `${nutrient.name} (${nutrient.unit})`;
    setSelectedNutrient({
      name: nutrient.name,
      rda: lowerBounds[key],
      ul: upperBounds[key],
      unit: nutrient.unit,
    });
  };
  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nutrient</TableHead>
            <TableHead className="text-right">RDA</TableHead>
            <TableHead className="text-right">UL</TableHead>
            <TableHead className="text-right">Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nutrients.map((nutrient, index) => {
            const key = `${nutrient.name} (${nutrient.unit})`;
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
                <TableCell className="text-right">
                  {lowerBounds[key]?.toLocaleString() ?? "N/A"}
                </TableCell>
                <TableCell className="text-right">
                  {upperBounds[key]?.toLocaleString() ?? "N/A"}
                </TableCell>
                <TableCell className="text-right">{nutrient.unit}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {selectedNutrient && (
        <NutrientInfoPopup
          isOpen={true}
          onClose={() => setSelectedNutrient(null)}
          nutrient={selectedNutrient.name}
          rda={selectedNutrient.rda}
          ul={selectedNutrient.ul}
          unit={selectedNutrient.unit}
        />
      )}
    </>
  );
};
export const NutrientCards = ({ nutrients, lowerBounds, upperBounds }) => {
  const [selectedNutrient, setSelectedNutrient] = useState(null);
  const handleCardClick = (nutrient) => {
    const key = `${nutrient.name} (${nutrient.unit})`;
    setSelectedNutrient({
      name: nutrient.name,
      rda: lowerBounds[key],
      ul: upperBounds[key],
      unit: nutrient.unit,
    });
  };
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {nutrients.map((nutrient, index) => {
          const key = `${nutrient.name} (${nutrient.unit})`;
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
                  <div className="flex justify-between">
                    <span className="text-sm">RDA:</span>
                    <span className="font-medium">
                      {lowerBounds[key] != null
                        ? `${lowerBounds[key].toLocaleString()} ${
                            nutrient.unit
                          }`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">UL:</span>
                    <span className="font-medium">
                      {upperBounds[key] != null
                        ? `${upperBounds[key].toLocaleString()} ${
                            nutrient.unit
                          }`
                        : "N/A"}
                    </span>
                  </div>
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
        />
      )}
    </>
  );
};
NutrientTable.propTypes = {
  nutrients: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      unit: PropTypes.string.isRequired,
    })
  ).isRequired,
  lowerBounds: PropTypes.objectOf(PropTypes.number).isRequired,
  upperBounds: PropTypes.objectOf(PropTypes.number).isRequired,
};
NutrientCards.propTypes = {
  nutrients: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      unit: PropTypes.string.isRequired,
    })
  ).isRequired,
  lowerBounds: PropTypes.objectOf(PropTypes.number).isRequired,
  upperBounds: PropTypes.objectOf(PropTypes.number).isRequired,
};
