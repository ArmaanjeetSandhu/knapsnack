import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem("knapsnack_theme");
    if (storedTheme) return storedTheme === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("knapsnack_theme", newIsDark ? "dark" : "light");
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

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={toggleTheme}
            className="no-select relative flex h-8 w-14 cursor-pointer rounded-full border border-gray-700 bg-gray-900 p-1 outline-none transition-all focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-[#011d16] sm:h-10 sm:w-20"
            aria-label="Toggle theme"
          >
            <div
              className={`absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full bg-gray-800 transition-all duration-300 dark:bg-white/10 ${
                isDark ? "left-[50%]" : "left-1"
              }`}
            />

            <div
              className={`z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${
                !isDark ? "text-yellow-400" : "text-white hover:text-gray-200"
              }`}
            >
              <Sun className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>

            <div
              className={`z-10 flex flex-1 items-center justify-center transition-colors duration-300 ${
                isDark ? "text-blue-400" : "text-white hover:text-gray-200"
              }`}
            >
              <Moon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="center"
          className="border border-gray-200 dark:border-gray-800"
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
