"use client";

import { createContext, useContext, useEffect, useState } from "react";

//theme constants
const DARK_THEME = "dark";
const LIGHT_THEME = "light";
const SYSTEM_THEME = "system";
const THEME_STORAGE_KEY = "theme";

export type ThemePreference = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState<ThemePreference>(SYSTEM_THEME);
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(
    LIGHT_THEME
  );

  // Get system theme preference
  const getSystemTheme = (): "light" | "dark" => {
    if (typeof window === "undefined") return LIGHT_THEME;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? DARK_THEME
      : LIGHT_THEME;
  };

  // Resolve theme based on preference
  const resolveTheme = (preference: ThemePreference): "light" | "dark" => {
    if (preference === SYSTEM_THEME) {
      return getSystemTheme();
    }
    return preference;
  };

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemePreference | null;
      const initialTheme = savedTheme || SYSTEM_THEME;
      setThemeState(initialTheme);
      setResolvedTheme(resolveTheme(initialTheme));
    }
  }, []);

  // Update resolved theme when theme preference changes
  useEffect(() => {
    setResolvedTheme(resolveTheme(theme));
  }, [theme]);

  // Apply theme classes to document root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(DARK_THEME, LIGHT_THEME);
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes (only if theme is set to "system")
  useEffect(() => {
    if (typeof window !== "undefined" && theme === SYSTEM_THEME) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleThemeChange = () => {
        setResolvedTheme(getSystemTheme());
      };

      mediaQuery.addEventListener("change", handleThemeChange);

      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }
  }, [theme]);

  // Set theme function that persists to localStorage
  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
