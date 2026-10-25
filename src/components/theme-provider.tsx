"use client";

import React from "react";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type ThemeContextValue = { theme: Theme; toggleTheme: () => void; ready: boolean };

const ThemeContext = createContext<ThemeContextValue | null>(null);
const STORAGE_KEY = "acessa-vagas-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    // Storage may be disabled; fall back to the operating system preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider.");
  return context;
}

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.dataset.theme = initial;
    setReady(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(current => {
      const next: Theme = current === "light" ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // The current page still changes theme even when persistence is unavailable.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}
