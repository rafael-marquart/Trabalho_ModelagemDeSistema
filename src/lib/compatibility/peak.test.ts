import { describe, expect, it } from "vitest";
import { nextPeakDeparture } from "./peak";

describe("reference peak departure", () => {
  it("is the next Tuesday at 07:00 in Brasília", () => {
    expect(nextPeakDeparture(new Date("2026-10-29T23:00:00Z"))).toBe("2026-11-03T07:00:00-03:00"); // Thursday night
    expect(nextPeakDeparture(new Date("2026-11-03T09:00:00Z"))).toBe("2026-11-03T07:00:00-03:00"); // Tuesday 06:00 local
    expect(nextPeakDeparture(new Date("2026-11-03T10:30:00Z"))).toBe("2026-11-10T07:00:00-03:00"); // Tuesday 07:30 local
    expect(nextPeakDeparture(new Date("2026-11-03T02:00:00Z"))).toBe("2026-11-03T07:00:00-03:00"); // Monday 23:00 local
  });
});
