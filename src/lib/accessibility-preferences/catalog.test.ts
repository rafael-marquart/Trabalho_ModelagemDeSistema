import { describe, expect, it } from "vitest";
import { defaultPreferences, normalizePreferences } from "./catalog";

describe("accessibility preference catalog", () => {
  it("defaults to following the system", () => {
    expect(defaultPreferences()).toEqual({ HIGH_CONTRAST: "AUTO", EMAIL_NOTIFICATIONS: "ON" });
  });
  it("keeps valid stored values and ignores unknown codes or invalid values", () => {
    expect(normalizePreferences({ HIGH_CONTRAST: "ON", OTHER: "X" })).toEqual({ HIGH_CONTRAST: "ON", EMAIL_NOTIFICATIONS: "ON" });
    expect(normalizePreferences({ HIGH_CONTRAST: "MAYBE" })).toEqual({ HIGH_CONTRAST: "AUTO", EMAIL_NOTIFICATIONS: "ON" });
    expect(normalizePreferences(null)).toEqual({ HIGH_CONTRAST: "AUTO", EMAIL_NOTIFICATIONS: "ON" });
    expect(normalizePreferences([])).toEqual({ HIGH_CONTRAST: "AUTO", EMAIL_NOTIFICATIONS: "ON" });
  });
});
