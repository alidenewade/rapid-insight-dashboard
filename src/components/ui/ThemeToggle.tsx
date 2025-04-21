
import React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const { theme, setTheme, systemTheme } = useTheme();

  // Determine current theme (systemFallback to light)
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      aria-label="Toggle Dark Mode"
      type="button"
      className="p-2 rounded-md bg-muted hover:bg-accent transition-colors"
      onClick={() =>
        setTheme(currentTheme === "dark" ? "light" : "dark")
      }
    >
      {currentTheme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-gray-900" />
      )}
    </button>
  );
};

export default ThemeToggle;

