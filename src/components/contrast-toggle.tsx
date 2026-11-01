"use client";

import React from "react";
import { useContrast } from "@/components/contrast-provider";

export default function ContrastToggle() {
  const contrast = useContrast();
  if (!contrast) return null;
  return (
    <button type="button" className="theme-toggle contrast-toggle" onClick={contrast.toggle} aria-pressed={contrast.active}
      title={contrast.active ? "Desativar alto contraste" : "Ativar alto contraste"}>
      <span aria-hidden="true">◐</span>
      <span>Alto contraste</span>
    </button>
  );
}
