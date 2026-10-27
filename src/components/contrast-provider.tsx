"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type ContrastMode = "AUTO" | "ON" | "OFF";
type ContrastContextValue = { mode: ContrastMode; active: boolean; toggle: () => void };

const ContrastContext = createContext<ContrastContextValue | null>(null);
export const CONTRAST_STORAGE_KEY = "acessa-vagas-contrast";

const isMode = (value: unknown): value is ContrastMode => value === "AUTO" || value === "ON" || value === "OFF";
const systemPrefersMore = () => Boolean(typeof window !== "undefined" && window.matchMedia?.("(prefers-contrast: more)").matches);

function readLocal(): ContrastMode {
  try {
    const saved = window.localStorage.getItem(CONTRAST_STORAGE_KEY);
    if (isMode(saved)) return saved;
  } catch { /* storage may be unavailable; the preference then lasts for this page only */ }
  return "AUTO";
}
function writeLocal(mode: ContrastMode) {
  try { window.localStorage.setItem(CONTRAST_STORAGE_KEY, mode); } catch { /* see readLocal */ }
}
async function saveToAccount(mode: ContrastMode) {
  try {
    // Anonymous visitors receive 401 and keep the preference only in this browser.
    await fetch("/api/conta/preferencias", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferences: { HIGH_CONTRAST: mode } }) });
  } catch { /* the page already changed; account sync is best-effort */ }
}

/** Optional: returns null outside the provider so the control simply does not render. */
export function useContrast() {
  return useContext(ContrastContext);
}

export default function ContrastProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ContrastMode>("AUTO");
  const [systemMore, setSystemMore] = useState(false);

  const apply = useCallback((next: ContrastMode) => {
    setModeState(next);
    document.documentElement.dataset.contrast = next === "ON" ? "high" : next === "OFF" ? "normal" : "auto";
  }, []);

  useEffect(() => {
    const query = window.matchMedia?.("(prefers-contrast: more)");
    setSystemMore(systemPrefersMore());
    const onChange = () => setSystemMore(systemPrefersMore());
    query?.addEventListener?.("change", onChange);
    return () => query?.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    let active = true;
    const local = readLocal();
    apply(local);
    // The account preference, when set, wins so it follows the user across devices (OPEN-013).
    fetch("/api/conta/preferencias").then(async response => {
      if (!response.ok || !active) return;
      const data = await response.json();
      const remote = data?.preferences?.HIGH_CONTRAST;
      if (!isMode(remote)) return;
      if (remote === "AUTO" && local !== "AUTO") { void saveToAccount(local); return; }
      if (remote !== local) { writeLocal(remote); apply(remote); }
    }).catch(() => { /* anonymous or offline: keep the local preference */ });
    return () => { active = false; };
  }, [apply]);

  const effective = mode === "ON" || (mode === "AUTO" && systemMore);
  const toggle = useCallback(() => {
    const next: ContrastMode = effective ? "OFF" : "ON";
    apply(next); writeLocal(next); void saveToAccount(next);
  }, [apply, effective]);

  return <ContrastContext.Provider value={{ mode, active: effective, toggle }}>{children}</ContrastContext.Provider>;
}
