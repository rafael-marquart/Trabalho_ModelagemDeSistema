"use client";

import React from "react";

import { useTheme } from "@/components/theme-provider";
import ContrastToggle from "@/components/contrast-toggle";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <span className="appearance-controls">
    <button
      type="button"
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={theme === "dark"}
      title={theme === "dark" ? "Desativar tema escuro" : "Ativar tema escuro"}
    >
      <span aria-hidden="true">☾</span>
      <span>Tema escuro</span>
    </button>
    <ContrastToggle />
    </span>
  );
}
