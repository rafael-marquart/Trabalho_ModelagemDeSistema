// Travel-time estimation behind a port, so the calculation never depends on a provider (SPEC-007, OPEN-088).
export type TravelEstimate =
  | { status: "OK"; minutes: number; mode: string; method: string }
  | { status: "UNAVAILABLE"; reason: string };

export type TravelRequest = { origin: string; destination: string; mode: string };
export interface TravelEstimator {
  estimate(request: TravelRequest): Promise<TravelEstimate>;
}

const unavailable = (reason: string): TravelEstimate => ({ status: "UNAVAILABLE", reason });

// HERE mapping of the five approved means of transport (to be confirmed against the provider documentation, per OPEN-088).
const ROUTER_MODES: Record<string, string> = { "Caminhada": "pedestrian", "Bicicleta": "bicycle", "Carro": "car" };
const TRANSIT_MODES: Record<string, string> = {
  "Ônibus": "bus,busRapid",
  "Metrô/trem": "subway,lightRail,monorail,regionalTrain,cityTrain,interRegionalTrain"
};

type Fetcher = typeof fetch;
type HereConfig = { apiKey?: string; geocodeUrl?: string; routerUrl?: string; transitUrl?: string; fetcher?: Fetcher; timeoutMs?: number };

export function createHereEstimator(config: HereConfig = {}): TravelEstimator {
  // Read on every call so a key added to .env is picked up without depending on module caching.
  const readKey = () => (config.apiKey ?? process.env.HERE_API_KEY ?? "").trim();
  const geocodeUrl = config.geocodeUrl ?? process.env.HERE_GEOCODE_URL ?? "https://geocode.search.hereapi.com/v1/geocode";
  const routerUrl = config.routerUrl ?? process.env.HERE_ROUTER_URL ?? "https://router.hereapi.com/v8/routes";
  const transitUrl = config.transitUrl ?? process.env.HERE_TRANSIT_URL ?? "https://transit.router.hereapi.com/v8/routes";
  const fetcher = config.fetcher ?? fetch;
  const timeoutMs = config.timeoutMs ?? 8000;

  async function getJson(url: URL): Promise<{ ok: true; body: unknown } | { ok: false; reason: string }> {
    try {
      const response = await fetcher(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
      if (response.status === 401 || response.status === 403) return { ok: false, reason: "A chave da API de rotas é inválida ou não tem permissão." };
      if (response.status === 429) return { ok: false, reason: "O limite de uso do serviço de rotas foi atingido." };
      if (!response.ok) return { ok: false, reason: "O serviço de rotas não conseguiu responder." };
      return { ok: true, body: await response.json() };
    } catch {
      return { ok: false, reason: "O serviço de rotas está indisponível no momento." };
    }
  }

  async function geocode(text: string): Promise<{ lat: number; lng: number } | { reason: string }> {
    const url = new URL(geocodeUrl);
    url.searchParams.set("q", text);
    url.searchParams.set("in", "countryCode:BRA");
    url.searchParams.set("limit", "1");
    url.searchParams.set("apiKey", readKey());
    const result = await getJson(url);
    if (!result.ok) return { reason: result.reason };
    const position = (result.body as { items?: { position?: { lat?: number; lng?: number } }[] })?.items?.[0]?.position;
    if (typeof position?.lat !== "number" || typeof position?.lng !== "number") return { reason: "Não foi possível localizar um dos endereços." };
    return { lat: position.lat, lng: position.lng };
  }

  return {
    async estimate({ origin, destination, mode }) {
      if (!readKey()) return unavailable("O serviço de rotas não está configurado: a chave HERE_API_KEY não foi encontrada no arquivo .env do servidor.");
      const routerMode = ROUTER_MODES[mode];
      const transitModes = TRANSIT_MODES[mode];
      if (!routerMode && !transitModes) return unavailable("Meio de transporte não suportado.");

      const from = await geocode(origin);
      if ("reason" in from) return unavailable(from.reason);
      const to = await geocode(destination);
      if ("reason" in to) return unavailable(to.reason);

      const url = new URL(routerMode ? routerUrl : transitUrl);
      url.searchParams.set("origin", `${from.lat},${from.lng}`);
      url.searchParams.set("destination", `${to.lat},${to.lng}`);
      if (routerMode) { url.searchParams.set("transportMode", routerMode); url.searchParams.set("return", "summary"); }
      else { url.searchParams.set("modes", transitModes); url.searchParams.set("return", "travelSummary"); }
      url.searchParams.set("apiKey", readKey());
      const result = await getJson(url);
      if (!result.ok) return unavailable(result.reason);

      const sections = (result.body as { routes?: { sections?: { summary?: { duration?: number }; travelSummary?: { duration?: number } }[] }[] })?.routes?.[0]?.sections;
      if (!sections?.length) return unavailable("Não há rota disponível para este meio de transporte.");
      let seconds = 0;
      for (const section of sections) {
        const duration = section.summary?.duration ?? section.travelSummary?.duration;
        if (typeof duration !== "number") return unavailable("A rota retornada não informou o tempo de viagem.");
        seconds += duration;
      }
      return { status: "OK", minutes: seconds / 60, mode, method: "HERE" };
    }
  };
}
