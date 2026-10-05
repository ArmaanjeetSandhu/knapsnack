import { useEffect, useRef } from "react";

import {
  macroRatioTotal,
  type MacroRatios,
} from "../../../hooks/useFormWizard";
import { Card, CardContent } from "../../ui/card";

type MacroKey = keyof MacroRatios;

interface MacroColors {
  bg: string;
}

const MACRO_COLORS: Record<MacroKey, MacroColors> = {
  protein: { bg: "bg-pink-500 dark:bg-pink-400" },
  carbs: { bg: "bg-indigo-500 dark:bg-indigo-400" },
  fat: { bg: "bg-yellow-500 dark:bg-yellow-400" },
};

interface MacroRatioValidatorProps {
  value: MacroRatios;
  onChange: (ratios: MacroRatios) => void;
  autoFocus?: boolean;
}

const MacroRatioValidator = ({
  value: macros,
  onChange,
  autoFocus,
}: MacroRatioValidatorProps) => {
  const firstInputRef = useRef<HTMLInputElement>(null);

  const total = macroRatioTotal(macros);

  useEffect(() => {
    if (autoFocus && firstInputRef.current) firstInputRef.current.focus();
  }, [autoFocus]);

  const handleMacroChange = (macroType: MacroKey, newValue: string) => {
    const clamped = Math.max(0, Math.min(100, Number(newValue)));
    onChange({ ...macros, [macroType]: clamped });
  };

  const macroEntries = Object.entries(macros) as [MacroKey, number][];

  return (
    <Card className="mb-6 w-full">
      <CardContent className="space-y-8 p-6">
        {macroEntries.map(([macro, value], index) => (
          <div key={macro} className="space-y-3">
            <div className="flex justify-between">
              <label className="text-foreground text-sm font-medium capitalize">
                {macro}
              </label>
              <span className="text-foreground text-sm font-bold">
                {value}%
              </span>
            </div>
            <div className="group relative">
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 transition-all duration-200 group-focus-within:ring-2 group-focus-within:ring-blue-500/50 group-focus-within:ring-offset-2 dark:bg-gray-700">
                <div
                  className={`h-full transition-all duration-300 ${MACRO_COLORS[macro].bg}`}
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
                className="absolute inset-0 h-2 w-full cursor-pointer opacity-0"
              />
            </div>
          </div>
        ))}
        {total !== 100 && (
          <p className="text-destructive text-center text-sm font-medium">
            Total: {total}% — must equal 100%
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default MacroRatioValidator;
