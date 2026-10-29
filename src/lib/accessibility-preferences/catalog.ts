// Catalog of interface preferences saved in the account (OPEN-013). Extending it only requires a new code here.
export const preferenceCatalog = {
  // AUTO follows the operating system/browser (prefers-contrast); ON/OFF are explicit choices made in the platform control.
  HIGH_CONTRAST: { values: ["AUTO", "ON", "OFF"], defaultValue: "AUTO", label: "Alto contraste" }
} as const;

export type PreferenceCode = keyof typeof preferenceCatalog;
export type Preferences = { [K in PreferenceCode]: (typeof preferenceCatalog)[K]["values"][number] };

export const preferenceCodes = Object.keys(preferenceCatalog) as PreferenceCode[];

export function defaultPreferences(): Preferences {
  return Object.fromEntries(preferenceCodes.map((code) => [code, preferenceCatalog[code].defaultValue])) as Preferences;
}

/** Reads stored JSON defensively: unknown codes and invalid values are ignored and defaults fill the gaps. */
export function normalizePreferences(stored: unknown): Preferences {
  const result: Record<string, string> = { ...defaultPreferences() };
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    for (const code of preferenceCodes) {
      const value = (stored as Record<string, unknown>)[code];
      if (typeof value === "string" && (preferenceCatalog[code].values as readonly string[]).includes(value)) result[code] = value;
    }
  }
  return result as Preferences;
}
