import { z } from "zod";
import { infrastructureItems } from "@/lib/company-infrastructure/items";
import { normalizeText } from "@/lib/compatibility/text";
import { jobModalities, professionalAreas, type JobModalityValue } from "./constants";

// SPEC-008 (OPEN-036/037/038): text search, structured filters, ordering and pagination. Pure functions, testable in isolation.
export const SEARCH_PAGE_SIZE = 20;
export const SEARCH_LIMIT = 100;
export const sortOptions = ["compatibilidade", "recentes", "antigas"] as const;
export type SortOption = (typeof sortOptions)[number];
export const sortLabels: Record<SortOption, string> = { compatibilidade: "Maior compatibilidade", recentes: "Mais recentes", antigas: "Mais antigas" };
const accessibilityCodes = infrastructureItems.map((item) => item.code) as [string, ...string[]];

const list = <T extends z.ZodTypeAny>(item: T, max: number) => z.array(item).max(max).default([]);
export const searchQuerySchema = z.object({
  q: z.string().trim().max(200, "Use até 200 caracteres na busca.").default(""),
  cargo: list(z.string().trim().min(1).max(160), 30),
  area: list(z.enum(professionalAreas), professionalAreas.length),
  modalidade: list(z.enum(jobModalities), jobModalities.length),
  local: list(z.string().trim().min(1).max(130), 50),
  acessibilidade: list(z.enum(accessibilityCodes), accessibilityCodes.length),
  ordem: z.enum(sortOptions).default("compatibilidade"),
  pagina: z.coerce.number().int().min(1).max(SEARCH_LIMIT / SEARCH_PAGE_SIZE).default(1)
}).strict();
export type SearchQuery = z.infer<typeof searchQuerySchema>;

const arrayKeys = ["cargo", "area", "modalidade", "local", "acessibilidade"] as const;

export function parseSearchParams(params: URLSearchParams) {
  const raw: Record<string, unknown> = {};
  for (const key of new Set(params.keys())) {
    raw[key] = (arrayKeys as readonly string[]).includes(key) ? params.getAll(key).filter((value) => value.trim()) : params.get(key) ?? undefined;
  }
  if (raw.q === "") delete raw.q;
  return searchQuerySchema.safeParse(raw);
}

/** Query string that preserves the search, filters and order (page 1 is omitted). */
export function toSearchParams(query: Partial<SearchQuery>): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  for (const key of arrayKeys) for (const value of query[key] ?? []) params.append(key, value);
  if (query.ordem && query.ordem !== "compatibilidade") params.set("ordem", query.ordem);
  if (query.pagina && query.pagina > 1) params.set("pagina", String(query.pagina));
  return params;
}

export type SearchableJob = {
  id: string; title: string; description: string; companyName: string; modality: JobModalityValue | "";
  professionalArea: string; locationCity: string; locationState: string; accessibility: Record<string, string>; publishedAt: Date | null;
};

export const locationLabel = (job: Pick<SearchableJob, "locationCity" | "locationState">) =>
  job.locationCity.trim() ? `${job.locationCity.trim()}/${job.locationState}` : "";

// Word endings removed before comparing (decision of 29/10/2026, complementing OPEN-037): "engenharia" finds "engenheiro",
// "enfermagem" finds "enfermeira", "vendas" finds "vendedor". Deterministic; no synonyms, typo correction or AI.
const SUFFIXES = [
  "amentos", "imentos", "amento", "imento", "idades", "idade", "acoes", "icoes", "arias", "aria", "eiros", "eiras", "eiro", "eira",
  "istas", "ista", "ismos", "ismo", "agens", "agem", "acao", "icao", "dores", "doras", "dor", "dora", "ivos", "ivas", "ivo", "iva",
  "icos", "icas", "ico", "ica", "ias", "ia", "os", "as", "es", "o", "a", "e", "s"
];
const MIN_STEM = 4;

/** Root of a normalized word: the longest listed ending is removed when at least four letters remain. */
export function stem(word: string): string {
  for (const suffix of SUFFIXES) {
    if (word.endsWith(suffix) && word.length - suffix.length >= MIN_STEM) return word.slice(0, -suffix.length);
  }
  return word;
}

/**
 * Every term must be found in the title, description or company name, ignoring case and accents: as a fragment of the text
 * or as a word with the same root (a word of the job starting with the term's root).
 */
export function matchesText(job: SearchableJob, q: string): boolean {
  const terms = normalizeText(q).split(" ").filter(Boolean);
  if (!terms.length) return true;
  const haystack = normalizeText(`${job.title} ${job.description} ${job.companyName}`);
  const roots = haystack.split(" ").filter(Boolean).map(stem);
  return terms.every((term) => {
    if (haystack.includes(term)) return true;
    const root = stem(term);
    return root.length >= MIN_STEM && roots.some((word) => word.startsWith(root));
  });
}

/** Different categories combine with AND; values inside one category combine with OR; empty categories do not restrict. */
export function matchesFilters(job: SearchableJob, query: SearchQuery): boolean {
  const anyOf = (selected: readonly string[], test: (value: string) => boolean) => selected.length === 0 || selected.some(test);
  return anyOf(query.cargo, (value) => normalizeText(value) === normalizeText(job.title))
    && anyOf(query.area, (value) => value === job.professionalArea)
    && anyOf(query.modalidade, (value) => value === job.modality)
    && anyOf(query.local, (value) => normalizeText(value) === normalizeText(locationLabel(job)))
    && anyOf(query.acessibilidade, (code) => job.accessibility[code] === "PRESENT");
}

export type Facets = { cargo: string[]; area: string[]; modalidade: string[]; local: string[] };

/** Filter options come from the open jobs themselves, so a filter never offers a value with no job behind it. */
export function buildFacets(jobs: SearchableJob[]): Facets {
  const distinct = (values: string[]) => {
    const seen = new Map<string, string>();
    for (const value of values) if (value.trim() && !seen.has(normalizeText(value))) seen.set(normalizeText(value), value.trim());
    return [...seen.values()].sort((a, b) => a.localeCompare(b, "pt-BR"));
  };
  return {
    cargo: distinct(jobs.map((job) => job.title)),
    area: professionalAreas.filter((area) => jobs.some((job) => job.professionalArea === area)),
    modalidade: jobModalities.filter((modality) => jobs.some((job) => job.modality === modality)),
    local: distinct(jobs.map(locationLabel))
  };
}

export type Ranked = { id: string; publishedAt: Date | null; status: "COMPLETE" | "INSUFFICIENT_DATA" | "INCOMPATIBLE"; score: number | null };

const byId = (a: Ranked, b: Ranked) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

/**
 * Highest compatibility first (scores from SPEC-007); results without a complete score come after the scored ones,
 * since missing data is never treated as compatibility. Date orders use the publication date. Ties use the internal id.
 */
export function sortResults<T extends Ranked>(items: T[], order: SortOption): T[] {
  const copy = [...items];
  if (order === "compatibilidade") {
    return copy.sort((a, b) => {
      const sa = a.status === "COMPLETE" && a.score !== null ? a.score : -1;
      const sb = b.status === "COMPLETE" && b.score !== null ? b.score : -1;
      return sb - sa || byId(a, b);
    });
  }
  const time = (item: Ranked) => item.publishedAt?.getTime() ?? null;
  return copy.sort((a, b) => {
    const ta = time(a), tb = time(b);
    if (ta === tb) return byId(a, b);
    if (ta === null) return 1;
    if (tb === null) return -1;
    return order === "recentes" ? tb - ta : ta - tb;
  });
}

export function paginate<T>(items: T[], page: number) {
  const limited = items.slice(0, SEARCH_LIMIT);
  const pages = Math.max(1, Math.ceil(limited.length / SEARCH_PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  return { items: limited.slice((current - 1) * SEARCH_PAGE_SIZE, current * SEARCH_PAGE_SIZE), page: current, pages, total: limited.length };
}
