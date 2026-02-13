import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "../../ui/card";

const MacroRatioValidator = ({ onValidRatios, initialMacros, autoFocus }) => {
  const firstInputRef = useRef(null);

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") updateTheme();
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
        text: "text-pink-500 dark:text-pink-400",
        border: "border-pink-500 dark:border-pink-400",
        bg: "bg-pink-500 dark:bg-pink-400",
        range: "bg-pink-100 dark:bg-pink-900/30",
        invalid: "bg-pink-50 dark:bg-pink-900/10",
        slider: {
          light: {
            main: "#ec4899",
            track: "#e5e7eb",
          },
          dark: {
            main: "#f472b6",
            track: "#374151",
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
            main: "#6366f1",
            track: "#e5e7eb",
          },
          dark: {
            main: "#818cf8",
            track: "#374151",
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
            main: "#eab308",
            track: "#e5e7eb",
          },
          dark: {
            main: "#facc15",
            track: "#374151",
          },
        },
      },
    }),
    [],
  );

  const getSliderBackground = useCallback(
    (macro) => {
      const value = macros[macro];
      const colors = macroColors[macro].slider;
      const currentColors = isDark ? colors.dark : colors.light;

      return `linear-gradient(to right,
        ${currentColors.track} 0%,
        ${currentColors.main} ${value}%,
        ${currentColors.track} ${value}%,
        ${currentColors.track} 100%
      )`;
    },
    [macros, macroColors, isDark],
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
            <div className="relative pb-6">
              <input
                ref={index === 0 ? firstInputRef : null}
                type="range"
                min="0"
                max="100"
                step="5"
                value={value}
                onChange={(e) => handleMacroChange(macro, e.target.value)}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-gray-200 to-gray-200 dark:from-gray-700 dark:to-gray-700"
                style={{
                  background: getSliderBackground(macro),
                }}
              />
              <div className="absolute top-7 left-0 right-0 flex justify-between text-xs text-muted-foreground pt-1">
                <span>0%</span>
                <span>100%</span>
              </div>
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

export default MacroRatioValidator;
