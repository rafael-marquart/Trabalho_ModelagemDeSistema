"use client";

import React, { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export type ContrastMode = "AUTO" | "ON" | "OFF";
type ContrastContextValue = { mode: ContrastMode; active: boolean; toggle: () => void };

const ContrastContext = createContext<ContrastContextValue | null>(null);
export const CONTRAST_STORAGE_KEY = "acessa-vagas-contrast";
// "local" = chosen while nobody was signed in (may be offered to the account at login); "account" = mirrors the account.
const SOURCE_KEY = "acessa-vagas-contrast-source";

const isMode = (value: unknown): value is ContrastMode => value === "AUTO" || value === "ON" || value === "OFF";
const systemPrefersMore = () => Boolean(typeof window !== "undefined" && window.matchMedia?.("(prefers-contrast: more)").matches);

function readLocal(): ContrastMode {
  try {
    const saved = window.localStorage.getItem(CONTRAST_STORAGE_KEY);
    if (isMode(saved)) return saved;
  } catch { /* storage may be unavailable; the preference then lasts for this page only */ }
  return "AUTO";
}
function readSource(): "local" | "account" {
  try { return window.localStorage.getItem(SOURCE_KEY) === "account" ? "account" : "local"; } catch { return "local"; }
}
function writeLocal(mode: ContrastMode, source: "local" | "account") {
  try {
    window.localStorage.setItem(CONTRAST_STORAGE_KEY, mode);
    window.localStorage.setItem(SOURCE_KEY, source);
  } catch { /* see readLocal */ }
}
/** Returns true when the account stored it; anonymous visitors receive 401 and keep the preference only in this browser. */
async function saveToAccount(mode: ContrastMode) {
  try {
    const response = await fetch("/api/conta/preferencias", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preferences: { HIGH_CONTRAST: mode } }) });
    return response.ok;
  } catch { return false; }
}

/** Optional: returns null outside the provider so the control simply does not render. */
export function useContrast() {
  return useContext(ContrastContext);
}

export default function ContrastProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ContrastMode>("AUTO");
  const [systemMore, setSystemMore] = useState(false);
  // Client-side navigation (e.g. right after signing in) does not remount the provider, so the route is a trigger to re-read the account.
  const pathname = usePathname();

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
      if (remote === "AUTO" && local !== "AUTO" && readSource() === "local") {
        // A choice made before signing in is offered to an account that never set one.
        if (await saveToAccount(local)) writeLocal(local, "account");
        return;
      }
      writeLocal(remote, "account");
      if (remote !== local) apply(remote);
    }).catch(() => { /* anonymous or offline: keep the local preference */ });
    return () => { active = false; };
  }, [apply, pathname]);

  const effective = mode === "ON" || (mode === "AUTO" && systemMore);
  const toggle = useCallback(() => {
    const next: ContrastMode = effective ? "OFF" : "ON";
    apply(next); writeLocal(next, "local");
    void saveToAccount(next).then(saved => { if (saved) writeLocal(next, "account"); });
  }, [apply, effective]);

  return <ContrastContext.Provider value={{ mode, active: effective, toggle }}>{children}</ContrastContext.Provider>;
}
