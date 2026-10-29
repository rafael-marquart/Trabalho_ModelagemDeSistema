import { describe, expect, it, vi } from "vitest";
import { createDbQuotaGuard, quotaCap, usageMonth } from "./quota";
import { createHereEstimator } from "./travel";

describe("HERE usage safety cap", () => {
  it("defaults to 60% of the free monthly allowance and accepts overrides", () => {
    expect(quotaCap("geocode", {})).toBe(18000);
    expect(quotaCap("routing", {})).toBe(3000);
    expect(quotaCap("transit", {})).toBe(3000);
    expect(quotaCap("routing", { HERE_QUOTA_PERCENT: "50", HERE_LIMIT_ROUTING: "30000" })).toBe(15000);
    expect(quotaCap("geocode", { HERE_QUOTA_PERCENT: "abc" })).toBe(18000);
    expect(quotaCap("geocode", { HERE_QUOTA_PERCENT: "250" })).toBe(30000);
  });

  it("counts per calendar month, so a new month starts unblocked", () => {
    expect(usageMonth(new Date("2026-10-31T23:59:59Z"))).toBe("2026-10");
    expect(usageMonth(new Date("2026-11-01T00:00:00Z"))).toBe("2026-11");
  });

  it("allows while the conditional upsert returns a row and blocks when it returns none", async () => {
    const db = { $queryRaw: vi.fn().mockResolvedValueOnce([{ count: 1 }]).mockResolvedValueOnce([]) };
    const guard = createDbQuotaGuard(db as never, { now: () => new Date("2026-10-29T12:00:00Z"), env: {} });
    expect(await guard.tryConsume("geocode")).toBe(true);
    expect(await guard.tryConsume("geocode")).toBe(false);
    expect(db.$queryRaw.mock.calls[0].slice(1)).toEqual(["2026-10", "geocode", 18000]);
  });

  it("blocks without touching the database when the cap is zero", async () => {
    const db = { $queryRaw: vi.fn() };
    expect(await createDbQuotaGuard(db as never, { env: { HERE_QUOTA_PERCENT: "0" } }).tryConsume("transit")).toBe(false);
    expect(db.$queryRaw).not.toHaveBeenCalled();
  });

  it("a blocked service yields unavailable travel and sends nothing to HERE", async () => {
    const fetcher = vi.fn();
    const quota = { tryConsume: vi.fn().mockResolvedValue(false) };
    const result = await createHereEstimator({ apiKey: "k", fetcher: fetcher as never, quota }).estimate({ origin: "Rua A, 1", destination: "Rua B, 2", mode: "Carro" });
    expect(result.status).toBe("UNAVAILABLE");
    expect(JSON.stringify(result)).toContain("limite de segurança");
    expect(fetcher).not.toHaveBeenCalled();
    expect(quota.tryConsume).toHaveBeenCalledWith("geocode");
  });

  it("charges routing and transit to their own counters", async () => {
    const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
    const geo = () => ok({ items: [{ position: { lat: -23.5, lng: -46.6 } }] });
    const quota = { tryConsume: vi.fn().mockResolvedValue(true) };
    const car = vi.fn().mockResolvedValueOnce(geo()).mockResolvedValueOnce(geo()).mockResolvedValueOnce(ok({ routes: [{ sections: [{ summary: { duration: 60 } }] }] }));
    await createHereEstimator({ apiKey: "k", fetcher: car as never, quota }).estimate({ origin: "a", destination: "b", mode: "Carro" });
    const bus = vi.fn().mockResolvedValueOnce(geo()).mockResolvedValueOnce(geo()).mockResolvedValueOnce(ok({ routes: [{ sections: [{ travelSummary: { duration: 60 } }] }] }));
    await createHereEstimator({ apiKey: "k", fetcher: bus as never, quota }).estimate({ origin: "a", destination: "b", mode: "Ônibus" });
    expect(quota.tryConsume.mock.calls.map(call => call[0])).toEqual(["geocode", "geocode", "routing", "geocode", "geocode", "transit"]);
  });
});
