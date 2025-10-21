"use client";

import { createContext, useContext, useEffect, useState } from "react";

//theme constants
const DARK_THEME = "dark";
const LIGHT_THEME = "light";

interface ThemeContextType {
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }) {
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(
    LIGHT_THEME
  );

  useEffect(() => {
    // Get initial theme from system preference
    if (window !== undefined) {
      const getSystemTheme = window.matchMedia(
        `(prefers-color-scheme: ${DARK_THEME})`
      ).matches
        ? DARK_THEME
        : LIGHT_THEME;
      setResolvedTheme(getSystemTheme);
    }
  }, []);

  useEffect(() => {
    // Apply theme classes to document root
    const root = document.documentElement;
    root.classList.remove(DARK_THEME, LIGHT_THEME);
    root.classList.add(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    // Listen for system theme changes
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleThemeChange = () => {
        setResolvedTheme(mediaQuery.matches ? DARK_THEME : LIGHT_THEME);
      };

      mediaQuery.addEventListener("change", handleThemeChange);

      return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ resolvedTheme }}>
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
