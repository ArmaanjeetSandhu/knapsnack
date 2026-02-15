import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../../ui/card";

const MacroRatioValidator = ({ onValidRatios, initialMacros, autoFocus }) => {
  const firstInputRef = useRef(null);

  const [macros, setMacros] = useState(
    initialMacros || {
      protein: 30,
      carbohydrate: 40,
      fats: 30,
    },
  );

  const total = Object.values(macros).reduce((sum, value) => sum + value, 0);

  useEffect(() => {
    const validTotal = total === 100;
    onValidRatios(validTotal ? macros : null);
  }, [macros, total, onValidRatios]);

  useEffect(() => {
    if (autoFocus && firstInputRef.current) firstInputRef.current.focus();
  }, [autoFocus]);

  const handleMacroChange = useCallback((macroType, newValue) => {
    newValue = Math.max(0, Math.min(100, Number(newValue)));
    setMacros((prev) => ({
      ...prev,
      [macroType]: newValue,
    }));
  }, []);

  const macroColors = useMemo(
    () => ({
      protein: {
        bg: "bg-pink-500 dark:bg-pink-400",
      },
      carbohydrate: {
        bg: "bg-indigo-500 dark:bg-indigo-400",
      },
      fats: {
        bg: "bg-yellow-500 dark:bg-yellow-400",
      },
    }),
    [],
  );

  return (
    <Card className="w-full mb-6">
      <CardContent className="space-y-8 p-6">
        {Object.entries(macros).map(([macro, value], index) => (
          <div key={macro} className="space-y-3">
            <div className="flex justify-between">
              <label className="text-sm font-medium capitalize text-foreground">
                {macro}
              </label>
              <span className="text-sm font-bold text-foreground">
                {value}%
              </span>
            </div>

            <div className="relative group">
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 transition-all duration-200">
                <div
                  className={`h-full transition-all duration-300 ${macroColors[macro].bg}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              <input
                ref={index === 0 ? firstInputRef : null}
                type="range"
                min="0"
                max="100"
                step="5"
                value={value}
                onChange={(e) => handleMacroChange(macro, e.target.value)}
                className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MacroRatioValidator;
