import { describe, expect, it, vi } from "vitest";
import { createHereEstimator } from "./travel";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const geocodeOk = () => json({ items: [{ position: { lat: -23.55, lng: -46.63 } }] });
const request = { origin: "Rua A, 1, São Paulo, SP", destination: "Rua B, 2, São Paulo, SP", mode: "Carro" };

describe("HERE travel estimator", () => {
  it("is unavailable without a key and never calls the provider", async () => {
    const fetcher = vi.fn();
    const result = await createHereEstimator({ apiKey: "", fetcher: fetcher as never }).estimate(request);
    expect(result.status).toBe("UNAVAILABLE");
    expect(fetcher).not.toHaveBeenCalled();
  });

  it("geocodes both addresses and sums the route duration in minutes", async () => {
    const fetcher = vi.fn()
      .mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(geocodeOk())
      .mockResolvedValueOnce(json({ routes: [{ sections: [{ summary: { duration: 1200 } }, { summary: { duration: 600 } }] }] }));
    const result = await createHereEstimator({ apiKey: "k", fetcher: fetcher as never }).estimate(request);
    expect(result).toEqual({ status: "OK", minutes: 30, mode: "Carro", method: "HERE" });
    const routeUrl = new URL(String(fetcher.mock.calls[2][0]));
    expect(routeUrl.searchParams.get("transportMode")).toBe("car");
    expect(routeUrl.searchParams.get("return")).toBe("summary");
    const geocodeUrl = new URL(String(fetcher.mock.calls[0][0]));
    expect(geocodeUrl.searchParams.get("in")).toBe("countryCode:BRA");
  });

  it.each([["Caminhada", "pedestrian"], ["Bicicleta", "bicycle"]])("maps %s to the %s routing mode", async (mode, expected) => {
    const fetcher = vi.fn().mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(json({ routes: [{ sections: [{ summary: { duration: 60 } }] }] }));
    await createHereEstimator({ apiKey: "k", fetcher: fetcher as never }).estimate({ ...request, mode });
    expect(new URL(String(fetcher.mock.calls[2][0])).searchParams.get("transportMode")).toBe(expected);
  });

  it("uses the transit service for bus and metro/train, with distinct modes", async () => {
    const make = () => vi.fn().mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(json({ routes: [{ sections: [{ travelSummary: { duration: 900 } }, { travelSummary: { duration: 900 } }] }] }));
    const bus = make(); const metro = make();
    const busResult = await createHereEstimator({ apiKey: "k", fetcher: bus as never }).estimate({ ...request, mode: "Ônibus" });
    await createHereEstimator({ apiKey: "k", fetcher: metro as never }).estimate({ ...request, mode: "Metrô/trem" });
    expect(busResult).toMatchObject({ status: "OK", minutes: 30 });
    const busUrl = new URL(String(bus.mock.calls[2][0])), metroUrl = new URL(String(metro.mock.calls[2][0]));
    expect(busUrl.hostname).toContain("transit");
    expect(busUrl.searchParams.get("modes")).toBe("bus,busRapid");
    expect(metroUrl.searchParams.get("modes")).toContain("subway");
    expect(metroUrl.searchParams.get("modes")).not.toContain("bus");
  });

  it("reports failures as unavailable without inventing a time", async () => {
    const run = (fetcher: unknown) => createHereEstimator({ apiKey: "k", fetcher: fetcher as never }).estimate(request);
    expect((await run(vi.fn().mockResolvedValue(json({}, 429)))).status).toBe("UNAVAILABLE");
    expect((await run(vi.fn().mockResolvedValue(json({}, 401)))).status).toBe("UNAVAILABLE");
    expect((await run(vi.fn().mockRejectedValue(new Error("network")))).status).toBe("UNAVAILABLE");
    expect((await run(vi.fn().mockResolvedValue(json({ items: [] })))).status).toBe("UNAVAILABLE");
    const noRoute = vi.fn().mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(json({ routes: [] }));
    expect((await run(noRoute)).status).toBe("UNAVAILABLE");
    expect((await createHereEstimator({ apiKey: "k", fetcher: vi.fn() as never }).estimate({ ...request, mode: "Teletransporte" })).status).toBe("UNAVAILABLE");
  });

  it("refuses a city-only geocoding match and says whose address it was", async () => {
    const coarse = vi.fn().mockResolvedValueOnce(geocodeOk()).mockResolvedValueOnce(json({ items: [{ resultType: "locality", position: { lat: -23.5, lng: -46.6 } }] }));
    const result = await createHereEstimator({ apiKey: "k", fetcher: coarse as never }).estimate(request);
    expect(result).toMatchObject({ status: "UNAVAILABLE" });
    expect(JSON.stringify(result)).toContain("da vaga");
    expect(coarse).toHaveBeenCalledTimes(2);
  });

  it("never puts the key in a returned reason", async () => {
    const result = await createHereEstimator({ apiKey: "SEGREDO123", fetcher: vi.fn().mockResolvedValue(json({}, 403)) as never }).estimate(request);
    expect(JSON.stringify(result)).not.toContain("SEGREDO123");
  });
});
