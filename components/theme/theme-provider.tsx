"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";

import {
  THEME_MEDIA_QUERY,
  type ThemeName,
  applyTheme,
  getSystemTheme,
  readStoredThemePreference,
  resolveTheme,
  writeStoredThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  mounted: boolean;
  resolvedTheme: ThemeName;
  themePreference: ThemeName | null;
  setThemePreference: (preference: ThemeName | null) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [themePreference, setThemePreferenceState] = useState<ThemeName | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<ThemeName>("dark");

  useEffect(() => {
    const mediaQuery = window.matchMedia(THEME_MEDIA_QUERY);

    const syncFromEnvironment = () => {
      const storedPreference = readStoredThemePreference();
      const nextTheme = resolveTheme(storedPreference, mediaQuery.matches);

      applyTheme(nextTheme);
      setThemePreferenceState(storedPreference);
      setResolvedTheme(nextTheme);
      setMounted(true);
    };

    syncFromEnvironment();

    const handleSystemThemeChange = (event: MediaQueryListEvent) => {
      const storedPreference = readStoredThemePreference();

      if (storedPreference !== null) {
        return;
      }

      const nextTheme = resolveTheme(null, event.matches);
      applyTheme(nextTheme);
      setThemePreferenceState(null);
      setResolvedTheme(nextTheme);
    };

    mediaQuery.addEventListener("change", handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
    };
  }, []);

  function setThemePreference(preference: ThemeName | null) {
    writeStoredThemePreference(preference);

    const nextTheme = preference ?? getSystemTheme();
    applyTheme(nextTheme);
    setThemePreferenceState(preference);
    setResolvedTheme(nextTheme);
    setMounted(true);
  }

  function toggleTheme() {
    setThemePreference(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <ThemeContext.Provider
      value={{
        mounted,
        resolvedTheme,
        themePreference,
        setThemePreference,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }

  return context;
}
