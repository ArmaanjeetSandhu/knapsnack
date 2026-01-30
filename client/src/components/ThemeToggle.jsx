import { Moon, Sun } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("knapsnack_theme");

    if (storedTheme) {
      const isDarkStored = storedTheme === "dark";
      setIsDark(isDarkStored);
      if (isDarkStored) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      const isSystemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDark(isSystemDark);
      if (isSystemDark) document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);

    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("knapsnack_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("knapsnack_theme", "light");
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "\\") {
        event.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleTheme]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={`w-10 h-10 rounded-full hover:bg-transparent transition-colors ${
        isDark
          ? "text-yellow-500 hover:text-yellow-200"
          : "text-white hover:text-gray-300"
      }`}
      title="Ctrl (or ⌘) + \"
    >
      {isDark ? (
        <Sun className="h-5 w-5 transition-all" />
      ) : (
        <Moon className="h-5 w-5 transition-all" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};

export default ThemeToggle;
