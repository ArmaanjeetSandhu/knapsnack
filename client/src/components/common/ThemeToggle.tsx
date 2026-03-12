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
    window.dispatchEvent(new Event("knapsnack-theme-change"));
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "\\") {
        event.preventDefault();
        toggleTheme();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  const isLanding = variant === "landing";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className={`no-select relative flex h-8 w-14 cursor-pointer rounded-full p-1 outline-none transition-all focus-visible:ring-2 sm:h-10 sm:w-20 ${
              isLanding
                ? "border border-border bg-muted/50 shadow-inner focus-visible:ring-primary dark:border-white/10 dark:bg-[#011d16]/80"
                : "border border-gray-700 bg-gray-900 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-[#011d16]"
            }`}
            aria-label="Toggle theme"
          >
            <div
              className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 dark:bg-white/10 ${
                isLanding
                  ? `bg-background shadow-sm ${isDark ? "left-[calc(50%+2px)]" : "left-1"}`
                  : `bg-gray-800 ${isDark ? "left-[50%]" : "left-1"}`
              }`}
            />

            <div
              className={`z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${
                !isDark
                  ? isLanding
                    ? "text-amber-500"
                    : "text-yellow-400"
                  : isLanding
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white hover:text-gray-200"
              }`}
            >
              <Sun className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>

            <div
              className={`z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${
                isDark
                  ? isLanding
                    ? "text-indigo-400"
                    : "text-blue-400"
                  : isLanding
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white hover:text-gray-200"
              }`}
            >
              <Moon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="center"
          className={
            isLanding
              ? "border border-gray-200 bg-card text-card-foreground dark:border-border"
              : "border border-gray-200 dark:border-gray-800"
          }
        >
          <p className="flex items-center text-xs font-medium leading-none">
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
