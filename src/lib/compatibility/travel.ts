import { DEFAULT_QUOTA_PERCENT, type HereService, type QuotaGuard } from "./quota";
// Travel-time estimation behind a port, so the calculation never depends on a provider (SPEC-007, OPEN-088).
export type TravelEstimate =
  | { status: "OK"; minutes: number; mode: string; method: string }
  // permanent: the inputs themselves prevent an estimate (address not found, unsupported mode); retrying the same inputs is useless.
  | { status: "UNAVAILABLE"; reason: string; permanent?: boolean; responsible?: "CANDIDATE" | "COMPANY" | "PLATFORM" };

export type TravelRequest = { origin: string; destination: string; mode: string; departureTime?: string };
export interface TravelEstimator {
  estimate(request: TravelRequest): Promise<TravelEstimate>;
}

const unavailable = (reason: string, permanent = false): TravelEstimate => (permanent ? { status: "UNAVAILABLE", reason, permanent } : { status: "UNAVAILABLE", reason });

// HERE mapping of the five approved means of transport (to be confirmed against the provider documentation, per OPEN-088).
const ROUTER_MODES: Record<string, string> = { "Caminhada": "pedestrian", "Bicicleta": "bicycle", "Carro": "car" };
const TRANSIT_MODES: Record<string, string> = {
  "Ônibus": "bus,busRapid",
  "Metrô/trem": "subway,lightRail,monorail,regionalTrain,cityTrain,interRegionalTrain"
};

type Fetcher = typeof fetch;
type HereConfig = { quota?: QuotaGuard; apiKey?: string; geocodeUrl?: string; routerUrl?: string; transitUrl?: string; fetcher?: Fetcher; timeoutMs?: number };

export function createHereEstimator(config: HereConfig = {}): TravelEstimator {
  // Read on every call so a key added to .env is picked up without depending on module caching.
  const readKey = () => (config.apiKey ?? process.env.HERE_API_KEY ?? "").trim();
  const geocodeUrl = config.geocodeUrl ?? process.env.HERE_GEOCODE_URL ?? "https://geocode.search.hereapi.com/v1/geocode";
  const routerUrl = config.routerUrl ?? process.env.HERE_ROUTER_URL ?? "https://router.hereapi.com/v8/routes";
  const transitUrl = config.transitUrl ?? process.env.HERE_TRANSIT_URL ?? "https://transit.router.hereapi.com/v8/routes";
  const fetcher = config.fetcher ?? fetch;
  const timeoutMs = config.timeoutMs ?? 8000;

  async function getJson(url: URL, service: HereService): Promise<{ ok: true; body: unknown } | { ok: false; reason: string }> {
    try {
      if (config.quota && !(await config.quota.tryConsume(service))) {
        return { ok: false, reason: `O limite de segurança do serviço de rotas (${process.env.HERE_QUOTA_PERCENT || DEFAULT_QUOTA_PERCENT}% da cota gratuita do mês) foi atingido; o tempo de deslocamento volta a ser calculado no próximo mês.` };
      }
      const response = await fetcher(url, { signal: AbortSignal.timeout(timeoutMs), cache: "no-store" });
      if (response.status === 401 || response.status === 403) return { ok: false, reason: "A chave da API de rotas é inválida ou não tem permissão." };
      if (response.status === 429) return { ok: false, reason: "O limite de uso do serviço de rotas foi atingido." };
      if (!response.ok) return { ok: false, reason: "O serviço de rotas não conseguiu responder." };
      return { ok: true, body: await response.json() };
    } catch {
      return { ok: false, reason: "O serviço de rotas está indisponível no momento." };
    }
  }

  // HERE result types too coarse to estimate a trip (only the city/state/country was recognized).
  const COARSE_RESULTS = new Set(["locality", "administrativeArea", "country"]);

  // Successful geocodes are kept in memory for a day, so a search over many jobs geocodes the candidate address once.
  const geocodeCache = new Map<string, { lat: number; lng: number; at: number }>();
  const CACHE_TTL_MS = 24 * 60 * 60 * 1000, CACHE_MAX = 1000;

  async function geocode(text: string, whose: string): Promise<{ lat: number; lng: number } | { reason: string; permanent?: boolean; responsible?: "CANDIDATE" | "COMPANY" }> {
    const cacheKey = text.trim().toLocaleLowerCase("pt-BR");
    const cached = geocodeCache.get(cacheKey);
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) return { lat: cached.lat, lng: cached.lng };
    const found = await geocodeRemote(text, whose);
    if (!("reason" in found)) {
      if (geocodeCache.size >= CACHE_MAX) geocodeCache.delete(geocodeCache.keys().next().value as string);
      geocodeCache.set(cacheKey, { ...found, at: Date.now() });
    }
    return found;
  }

  async function geocodeRemote(text: string, whose: string): Promise<{ lat: number; lng: number } | { reason: string; permanent?: boolean; responsible?: "CANDIDATE" | "COMPANY" }> {
    const url = new URL(geocodeUrl);
    url.searchParams.set("q", text);
    url.searchParams.set("in", "countryCode:BRA");
    url.searchParams.set("limit", "1");
    url.searchParams.set("apiKey", readKey());
    const result = await getJson(url, "geocode");
    if (!result.ok) return { reason: result.reason };
    const item = (result.body as { items?: { resultType?: string; position?: { lat?: number; lng?: number } }[] })?.items?.[0];
    const position = item?.position;
    if (typeof position?.lat !== "number" || typeof position?.lng !== "number") return { reason: `Não foi possível localizar o endereço ${whose}.`, permanent: true, responsible: whose === "da vaga" ? "COMPANY" : "CANDIDATE" };
    if (item?.resultType && COARSE_RESULTS.has(item.resultType)) return { reason: `O endereço ${whose} foi localizado só pela cidade; ${whose === "da vaga" ? "a empresa precisa informar rua ou bairro" : "informe rua ou bairro no seu perfil"} para estimar o tempo.`, permanent: true, responsible: whose === "da vaga" ? "COMPANY" : "CANDIDATE" };
    return { lat: position.lat, lng: position.lng };
  }

  return {
    async estimate({ origin, destination, mode, departureTime }) {
      if (!readKey()) return unavailable("O serviço de rotas não está configurado: a chave HERE_API_KEY não foi encontrada no arquivo .env do servidor.");
      const routerMode = ROUTER_MODES[mode];
      const transitModes = TRANSIT_MODES[mode];
      if (!routerMode && !transitModes) return unavailable("Meio de transporte não suportado.", true);

      const from = await geocode(origin, "do candidato");
      if ("reason" in from) return { ...unavailable(from.reason, from.permanent), ...(from.responsible ? { responsible: from.responsible } : {}) } as TravelEstimate;
      const to = await geocode(destination, "da vaga");
      if ("reason" in to) return { ...unavailable(to.reason, to.permanent), ...(to.responsible ? { responsible: to.responsible } : {}) } as TravelEstimate;

      const url = new URL(routerMode ? routerUrl : transitUrl);
      url.searchParams.set("origin", `${from.lat},${from.lng}`);
      url.searchParams.set("destination", `${to.lat},${to.lng}`);
      if (routerMode) { url.searchParams.set("transportMode", routerMode); url.searchParams.set("return", "summary"); }
      else { url.searchParams.set("modes", transitModes); url.searchParams.set("return", "travelSummary"); }
      // Reference departure (peak hour) so the estimate does not depend on when the candidate looks (car traffic and transit timetables).
      if (departureTime) url.searchParams.set("departureTime", departureTime);
      url.searchParams.set("apiKey", readKey());
      const result = await getJson(url, routerMode ? "routing" : "transit");
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
