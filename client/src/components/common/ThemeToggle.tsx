import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ThemeToggleProps {
  variant?: "header" | "landing";
}

const ThemeToggle = ({ variant = "header" }: ThemeToggleProps) => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem("knapsnack_theme");
    if (storedTheme) return storedTheme === "dark";
    return false;
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("knapsnack_theme", newIsDark ? "dark" : "light");
    globalThis.dispatchEvent(new Event("knapsnack-theme-change"));
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "\\") {
        event.preventDefault();
        toggleTheme();
      }
    };
    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  const isLanding = variant === "landing";
  const iconClass = isLanding
    ? "h-[1.25em] w-[1.25em]"
    : "h-3.5 w-3.5 sm:h-5 sm:w-5";

  const landingPillPos = isDark ? "left-1/2" : "left-[0.25em]";
  const defaultPillPos = isDark ? "left-[50%]" : "left-1";

  const pillPositionClass = isLanding ? landingPillPos : defaultPillPos;
  const pillBgClass = isLanding ? "bg-background shadow-sm" : "bg-gray-800";
  const pillDynamicClasses = `${pillBgClass} ${pillPositionClass}`;

  const darkSunClass = isLanding
    ? "text-muted-foreground hover:text-foreground"
    : "text-white hover:text-gray-200";
  const lightSunClass = isLanding ? "text-amber-500" : "text-yellow-400";

  const sunColorClass = isDark ? darkSunClass : lightSunClass;

  const darkMoonClass = isLanding ? "text-indigo-400" : "text-blue-400";
  const lightMoonClass = isLanding
    ? "text-muted-foreground hover:text-foreground"
    : "text-white hover:text-gray-200";

  const moonColorClass = isDark ? darkMoonClass : lightMoonClass;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className={`no-select relative flex cursor-pointer rounded-full transition-all outline-none focus-visible:ring-2 ${
              isLanding
                ? "border-border bg-muted/50 focus-visible:ring-primary h-[2.5em] w-[5em] border p-[0.25em] shadow-inner dark:border-white/10 dark:bg-[#011d16]/80"
                : "h-8 w-14 border border-gray-700 bg-gray-900 p-1 focus-visible:ring-blue-500 sm:h-10 sm:w-20 dark:border-white/10 dark:bg-[#011d16]"
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`absolute rounded-full transition-all duration-300 dark:bg-white/10 ${
                isLanding
                  ? "top-[0.25em] bottom-[0.25em] w-[calc(50%-0.25em)]"
                  : "top-1 bottom-1 w-[calc(50%-4px)]"
              } ${pillDynamicClasses}`}
            />

            <div
              className={`z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${sunColorClass}`}
            >
              <Sun className={iconClass} />
            </div>

            <div
              className={`z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${moonColorClass}`}
            >
              <Moon className={iconClass} />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="center"
          className={
            isLanding
              ? "bg-card text-card-foreground dark:border-border border border-gray-200"
              : "border border-gray-200 dark:border-gray-800"
          }
        >
          <p className="flex items-center text-xs leading-none font-medium">
            <span>Ctrl (or&nbsp;</span>
            <span className="-translate-y-[1px] text-xl">⌘</span>
            <span className="ml-[1px]">) + \</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ThemeToggle;
