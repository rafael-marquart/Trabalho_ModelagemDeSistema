import { describe, expect, it } from "vitest";
import { buildFacets, matchesFilters, matchesText, paginate, parseSearchParams, sortResults, toSearchParams, type Ranked, type SearchableJob, type SearchQuery } from "./search";

const job = (over: Partial<SearchableJob> = {}): SearchableJob => ({
  id: "j1", title: "Analista de Dados", description: "Trabalho com relatórios e SQL", companyName: "Inova Tecnologia",
  modality: "HIBRIDO", professionalArea: "Tecnologia da informação", locationCity: "São Paulo", locationState: "SP",
  accessibility: { RAMPS: "PRESENT", ELEVATORS: "ABSENT" }, publishedAt: new Date("2026-10-20T00:00:00Z"), ...over
});
const query = (over: Partial<SearchQuery> = {}): SearchQuery => ({ q: "", cargo: [], area: [], modalidade: [], local: [], acessibilidade: [], ordem: "compatibilidade", pagina: 1, ...over });

describe("job search text (OPEN-037)", () => {
  it("ignores case and accents and accepts fragments", () => {
    expect(matchesText(job(), "ANALISTA")).toBe(true);
    expect(matchesText(job(), "relatorio")).toBe(true);
    expect(matchesText(job(), "sao")).toBe(false);
  });
  it("requires every term, possibly spread across title, description and company", () => {
    expect(matchesText(job(), "dados inova sql")).toBe(true);
    expect(matchesText(job(), "dados marketing")).toBe(false);
  });
  it("does not restrict when empty", () => {
    expect(matchesText(job(), "   ")).toBe(true);
  });
});

describe("job search filters (OPEN-036)", () => {
  it("combines categories with AND and values of one category with OR", () => {
    expect(matchesFilters(job(), query({ modalidade: ["HIBRIDO", "REMOTO"] }))).toBe(true);
    expect(matchesFilters(job(), query({ modalidade: ["REMOTO"] }))).toBe(false);
    expect(matchesFilters(job(), query({ modalidade: ["HIBRIDO"], local: ["Campinas/SP"] }))).toBe(false);
    expect(matchesFilters(job(), query({ modalidade: ["HIBRIDO"], local: ["sao paulo/sp"] }))).toBe(true);
  });
  it("filters by job title, area and declared accessibility resources", () => {
    expect(matchesFilters(job(), query({ cargo: ["analista de dados"] }))).toBe(true);
    expect(matchesFilters(job(), query({ area: ["Saúde"] }))).toBe(false);
    expect(matchesFilters(job(), query({ acessibilidade: ["RAMPS"] }))).toBe(true);
    expect(matchesFilters(job(), query({ acessibilidade: ["ELEVATORS"] }))).toBe(false);
    expect(matchesFilters(job(), query({ acessibilidade: ["ELEVATORS", "RAMPS"] }))).toBe(true);
  });
  it("offers only values that exist among open jobs", () => {
    const facets = buildFacets([job(), job({ id: "j2", title: "analista de dados", modality: "REMOTO", locationCity: "", locationState: "", professionalArea: "" })]);
    expect(facets.cargo).toEqual(["Analista de Dados"]);
    expect(facets.modalidade).toEqual(["HIBRIDO", "REMOTO"]);
    expect(facets.local).toEqual(["São Paulo/SP"]);
    expect(facets.area).toEqual(["Tecnologia da informação"]);
  });
});

describe("ordering and pagination (OPEN-038)", () => {
  const ranked = (id: string, score: number | null, day: number | null, status: Ranked["status"] = score === null ? "INSUFFICIENT_DATA" : "COMPLETE"): Ranked =>
    ({ id, score, status, publishedAt: day === null ? null : new Date(Date.UTC(2026, 9, day)) });
  it("orders by score, with incomplete analyses after scored ones and ties by id", () => {
    const sorted = sortResults([ranked("c", null, 1), ranked("b", 80, 2), ranked("a", 80, 3), ranked("d", 95, 4)], "compatibilidade");
    expect(sorted.map(item => item.id)).toEqual(["d", "a", "b", "c"]);
  });
  it("orders by publication date in both directions", () => {
    const items = [ranked("a", 10, 5), ranked("b", 90, 9), ranked("c", 50, 1), ranked("d", 50, null)];
    expect(sortResults(items, "recentes").map(item => item.id)).toEqual(["b", "a", "c", "d"]);
    expect(sortResults(items, "antigas").map(item => item.id)).toEqual(["c", "a", "b", "d"]);
  });
  it("shows 20 per page and at most 100 results", () => {
    const items = Array.from({ length: 130 }, (_, index) => index);
    const first = paginate(items, 1);
    expect(first).toMatchObject({ page: 1, pages: 5, total: 100 });
    expect(first.items).toHaveLength(20);
    expect(paginate(items, 5).items.at(-1)).toBe(99);
    expect(paginate(items, 9).page).toBe(5);
    expect(paginate([], 1)).toMatchObject({ page: 1, pages: 1, total: 0 });
  });
});

describe("query string", () => {
  it("parses repeated filters and round-trips the state", () => {
    const parsed = parseSearchParams(new URLSearchParams("q=dados&modalidade=HIBRIDO&modalidade=REMOTO&ordem=recentes&pagina=2"));
    expect(parsed.success && parsed.data).toMatchObject({ q: "dados", modalidade: ["HIBRIDO", "REMOTO"], ordem: "recentes", pagina: 2 });
    if (parsed.success) expect(toSearchParams(parsed.data).toString()).toBe("q=dados&modalidade=HIBRIDO&modalidade=REMOTO&ordem=recentes&pagina=2");
  });
  it("rejects unknown filters and values", () => {
    expect(parseSearchParams(new URLSearchParams("modalidade=TELETRABALHO")).success).toBe(false);
    expect(parseSearchParams(new URLSearchParams("salario=10")).success).toBe(false);
    expect(parseSearchParams(new URLSearchParams("pagina=6")).success).toBe(false);
  });
});
