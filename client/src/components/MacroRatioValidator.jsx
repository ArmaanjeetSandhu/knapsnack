import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import PropTypes from "prop-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Card, CardContent } from "../components/ui/card";
const MacroRatioValidator = ({ onValidRatios, initialMacros, autoFocus }) => {
  const firstInputRef = useRef(null);
  const amdrRanges = useMemo(
    () => ({
      protein: { min: 10, max: 40 },
      carbohydrate: { min: 40, max: 65 },
      fats: { min: 20, max: 35 },
    }),
    []
  );
  const [macros, setMacros] = useState(
    initialMacros || {
      protein: 30,
      carbohydrate: 40,
      fats: 30,
    }
  );
  const total = Object.values(macros).reduce((sum, value) => sum + value, 0);
  const getAMDRViolations = useCallback(() => {
    const violations = [];
    Object.entries(macros).forEach(([macro, value]) => {
      const range = amdrRanges[macro];
      if (value < range.min) {
        violations.push(`${macro} is below minimum (${range.min}%)`);
      } else if (value > range.max) {
        violations.push(`${macro} exceeds maximum (${range.max}%)`);
      }
    });
    return violations;
  }, [macros, amdrRanges]);
  useEffect(() => {
    const violations = getAMDRViolations();
    const validTotal = total === 100;
    const isValid = violations.length === 0 && validTotal;
    onValidRatios(isValid ? macros : null);
  }, [macros, total, onValidRatios, getAMDRViolations]);
  useEffect(() => {
    if (autoFocus && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [autoFocus]);
  const handleMacroChange = useCallback(
    (macroType, newValue) => {
      const range = amdrRanges[macroType];
      newValue = Math.max(range.min, Math.min(range.max, Number(newValue)));
      setMacros((prev) => ({
        ...prev,
        [macroType]: newValue,
      }));
    },
    [amdrRanges]
  );
  const macroColors = useMemo(
    () => ({
      protein: {
        text: "text-pink-500 dark:text-pink-400",
        border: "border-pink-500 dark:border-pink-400",
        bg: "bg-pink-500 dark:bg-pink-400",
        range: "bg-pink-100 dark:bg-pink-900/30",
        invalid: "bg-pink-50 dark:bg-pink-900/10",
        slider: {
          light: {
            invalid: "#fdf2f8",
            range: "#fce7f3",
            main: "#ec4899",
          },
          dark: {
            invalid: "#831843",
            range: "#9d174d",
            main: "#f472b6",
          },
        },
      },
      carbohydrate: {
        text: "text-indigo-500 dark:text-indigo-400",
        border: "border-indigo-500 dark:border-indigo-400",
        bg: "bg-indigo-500 dark:bg-indigo-400",
        range: "bg-indigo-100 dark:bg-indigo-900/30",
        invalid: "bg-indigo-50 dark:bg-indigo-900/10",
        slider: {
          light: {
            invalid: "#eef2ff",
            range: "#e0e7ff",
            main: "#6366f1",
          },
          dark: {
            invalid: "#312e81",
            range: "#3730a3",
            main: "#818cf8",
          },
        },
      },
      fats: {
        text: "text-yellow-500 dark:text-yellow-400",
        border: "border-yellow-500 dark:border-yellow-400",
        bg: "bg-yellow-500 dark:bg-yellow-400",
        range: "bg-yellow-100 dark:bg-yellow-900/30",
        invalid: "bg-yellow-50 dark:bg-yellow-900/10",
        slider: {
          light: {
            invalid: "#fefce8",
            range: "#fef9c3",
            main: "#eab308",
          },
          dark: {
            invalid: "#713f12",
            range: "#854d0e",
            main: "#facc15",
          },
        },
      },
    }),
    []
  );
  const getAlertMessages = useCallback(() => {
    const messages = [];
    const difference = Math.abs(100 - total);
    if (total === 100) {
      messages.push({
        type: "success",
        message:
          "Perfect! Your macros total 100% and are within AMDR guidelines",
      });
    } else if (total < 100) {
      messages.push({
        type: "warning",
        message: `Your macros total ${total}%. Please add ${difference}% to reach 100%`,
      });
    } else {
      messages.push({
        type: "warning",
        message: `Your macros total ${total}%. Please reduce by ${difference}% to reach 100%`,
      });
    }
    const violations = getAMDRViolations();
    if (violations.length > 0) {
      messages.push({
        type: "error",
        message: `AMDR violations detected: ${violations.join(", ")}`,
      });
    }
    return messages;
  }, [total, getAMDRViolations]);
  const getSliderBackground = useCallback(
    (macro) => {
      const range = amdrRanges[macro];
      const value = macros[macro];
      const colors = macroColors[macro].slider;
      const isDark = document.documentElement.classList.contains("dark");
      const currentColors = isDark ? colors.dark : colors.light;
      return `linear-gradient(to right,
      ${currentColors.invalid} 0%,
      ${currentColors.invalid} ${range.min}%,
      ${currentColors.range} ${range.min}%,
      ${currentColors.main} ${value}%,
      ${currentColors.range} ${value}%,
      ${currentColors.range} ${range.max}%,
      ${currentColors.invalid} ${range.max}%,
      ${currentColors.invalid} 100%
    )`;
    },
    [amdrRanges, macros, macroColors]
  );
  return (
    <Card className="w-full mb-6">
      <CardContent className="space-y-6 p-6">
        {getAlertMessages().map((alert, index) => (
          <Alert
            key={index}
            variant={alert.type === "success" ? "default" : "warning"}
            className={
              alert.type === "success"
                ? "bg-success/10 dark:bg-success/20 border-success/50"
                : undefined
            }
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-4 w-4 text-success" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        ))}
        <Alert
          variant="default"
          className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
        >
          <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
          <AlertDescription>
            AMDR Guidelines:
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm text-foreground">
              <div>
                Protein: {amdrRanges.protein.min}-{amdrRanges.protein.max}%
              </div>
              <div>
                Carbs: {amdrRanges.carbohydrate.min}-
                {amdrRanges.carbohydrate.max}%
              </div>
              <div>
                Fat: {amdrRanges.fats.min}-{amdrRanges.fats.max}%
              </div>
            </div>
          </AlertDescription>
        </Alert>
        {Object.entries(macros).map(([macro, value], index) => (
          <div key={macro} className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium capitalize text-foreground">
                {macro}
              </label>
              <span className="text-sm text-muted-foreground">{value}%</span>
            </div>
            <div className="relative">
              <div className="absolute -top-2 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span
                  style={{ left: `${amdrRanges[macro].min}%` }}
                  className="absolute transform -translate-x-1/2"
                >
                  min
                </span>
                <span
                  style={{ left: `${amdrRanges[macro].max}%` }}
                  className="absolute transform -translate-x-1/2"
                >
                  max
                </span>
                <span>100%</span>
              </div>
              <input
                ref={index === 0 ? firstInputRef : null}
                type="range"
                min="0"
                max="100"
                step="5"
                value={value}
                onChange={(e) => handleMacroChange(macro, e.target.value)}
                className="w-full mt-4 h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-700 dark:to-gray-700"
                style={{
                  background: getSliderBackground(macro),
                }}
              />
            </div>
            <div
              className={`h-2 rounded-full transition-all duration-200 ${macroColors[macro].bg}`}
              style={{
                width: `${value}%`,
              }}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
MacroRatioValidator.propTypes = {
  onValidRatios: PropTypes.func.isRequired,
  initialMacros: PropTypes.object,
  autoFocus: PropTypes.bool,
};
export default MacroRatioValidator;
