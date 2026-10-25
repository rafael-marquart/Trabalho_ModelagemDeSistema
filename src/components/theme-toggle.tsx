import React from "react";
"use client";

import { useTheme } from "@/components/theme-provider";

export default function ThemeToggle() {
  const { theme, toggleTheme, ready } = useTheme();
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={ready ? (theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro") : "Alternar tema claro e escuro"}
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Usar tema claro" : "Usar tema escuro"}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
      <span>{theme === "dark" ? "Tema claro" : "Tema escuro"}</span>
    </button>
  );
}
