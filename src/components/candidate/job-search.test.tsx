import React from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { replaceMock } = vi.hoisted(() => ({ replaceMock: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: replaceMock, push: vi.fn() }), usePathname: () => "/candidato/vagas" }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
import JobSearch from "./job-search";
import ScoreDialog from "./score-dialog";
import { searchQuerySchema } from "@/lib/jobs/search";
import type { Compatibility, SearchResult } from "./types";

const dimension = (score: number | null, detail = "ok") => ({ status: score === null ? "INSUFFICIENT" : "EVALUATED", score, components: [{ label: "Item", score, detail }] }) as Compatibility["dimensions"]["A"];
const complete: Compatibility = {
  id: "r1", status: "COMPLETE", score: 92, executedAt: "2026-10-29T00:00:00Z", factors: [], missing: [], appliedWeights: { A: 0.5, T: 0.3, D: 0.2 },
  dimensions: { A: dimension(100), T: dimension(80), D: { status: "EVALUATED", score: 90, components: [{ label: "Modalidade", score: 100, detail: "Atende." }, { label: "Deslocamento", score: 75, detail: "Tempo estimado de cerca de 31 min (carro)." }] } }
};
const insufficient: Compatibility = { ...complete, id: "r2", status: "INSUFFICIENT_DATA", score: null, dimensions: { ...complete.dimensions, D: dimension(null, "Endereço não informado") },
  missing: [{ dimension: "D", item: "Endereço do candidato", action: "Informe o endereço no perfil." }] };
const result = (over: Partial<SearchResult> = {}): SearchResult => ({
  jobs: [
    { id: "j1", title: "Analista de Dados", companyName: "TechPlus", modality: "HIBRIDO", professionalArea: "Tecnologia da informação", location: "São Paulo/SP", publishedAt: null,
      accessibility: [{ code: "RAMPS", label: "Rampas de acesso", status: "PRESENT", statusLabel: "Presente" }], compatibility: complete },
    { id: "j2", title: "Assistente", companyName: "Horizonte", modality: "PRESENCIAL", professionalArea: "", location: "Campinas/SP", publishedAt: null, accessibility: [], compatibility: insufficient }
  ],
  page: 1, pages: 2, total: 22, hiddenIncompatible: 1, facets: { cargo: ["Analista de Dados", "Assistente"], area: ["Tecnologia da informação"], modalidade: ["HIBRIDO", "PRESENCIAL"], local: ["Campinas/SP", "São Paulo/SP"] }, ...over
});
const fetchMock = vi.fn();

describe("candidate job search", () => {
  beforeEach(() => { fetchMock.mockReset(); fetchMock.mockImplementation(async () => new Response(JSON.stringify(result()), { status: 200 })); vi.stubGlobal("fetch", fetchMock); replaceMock.mockReset(); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("lists jobs with the score circle, the hidden-job note and filters from the open jobs", async () => {
    render(<JobSearch initialQuery={searchQuerySchema.parse({})} />);
    expect(await screen.findByRole("heading", { name: "22 vagas encontradas" })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Compatibilidade: 92%/ })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Compatibilidade: Dados insuficientes/ })).toBeTruthy();
    expect(screen.getByText(/1 vaga não aparece/)).toBeTruthy();
    expect(screen.getByRole("group", { name: "Modalidade" })).toBeTruthy();
    expect(within(screen.getByRole("group", { name: "Localização" })).getAllByRole("checkbox")).toHaveLength(2);
  });

  it("applies filters and search, going back to page 1 and keeping the state in the address", async () => {
    render(<JobSearch initialQuery={searchQuerySchema.parse({ pagina: 2 })} />);
    await screen.findByRole("heading", { name: "22 vagas encontradas" });
    expect(fetchMock.mock.calls[0][0]).toBe("/api/candidato/vagas?pagina=2");
    fireEvent.click(within(screen.getByRole("group", { name: "Modalidade" })).getByRole("checkbox", { name: "Híbrido" }));
    await waitFor(() => expect(fetchMock.mock.calls.at(-1)![0]).toBe("/api/candidato/vagas?modalidade=HIBRIDO"));
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "dados" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));
    await waitFor(() => expect(fetchMock.mock.calls.at(-1)![0]).toBe("/api/candidato/vagas?q=dados&modalidade=HIBRIDO"));
    expect(replaceMock).toHaveBeenLastCalledWith("/candidato/vagas?q=dados&modalidade=HIBRIDO", { scroll: false });
  });

  it("paginates with numbered pages and keeps the filters", async () => {
    render(<JobSearch initialQuery={searchQuerySchema.parse({ modalidade: ["HIBRIDO"], ordem: "recentes" })} />);
    await screen.findByRole("heading", { name: "22 vagas encontradas" });
    expect(screen.getByRole("button", { name: "Página 1" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));
    await waitFor(() => expect(fetchMock.mock.calls.at(-1)![0]).toBe("/api/candidato/vagas?modalidade=HIBRIDO&ordem=recentes&pagina=2"));
  });

  it("communicates an empty result accessibly", async () => {
    fetchMock.mockImplementation(async () => new Response(JSON.stringify(result({ jobs: [], total: 0, pages: 1, hiddenIncompatible: 0 })), { status: 200 }));
    render(<JobSearch initialQuery={searchQuerySchema.parse({ q: "inexistente" })} />);
    expect(await screen.findByRole("heading", { name: "Nenhuma vaga elegível encontrada" })).toBeTruthy();
    expect(screen.getAllByRole("button", { name: "Limpar busca e filtros" }).length).toBeGreaterThan(0);
  });

  it("has no automated accessibility violations", async () => {
    const { container } = render(<main><JobSearch initialQuery={searchQuerySchema.parse({})} /></main>);
    await screen.findByRole("heading", { name: "22 vagas encontradas" });
    const found = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
    expect(found.violations.map(v => v.id)).toEqual([]);
  });
});

describe("score dialog", () => {
  afterEach(() => cleanup());
  it("opens with the dimension scores and the travel time, and closes back to the circle", () => {
    render(<ScoreDialog jobTitle="Analista" result={complete} />);
    const trigger = screen.getByRole("button", { name: /Compatibilidade: 92%/ });
    fireEvent.click(trigger);
    expect(screen.getByText("92%", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText("Acessibilidade")).toBeTruthy();
    expect(screen.getByText("Tempo estimado de cerca de 31 min (carro).", { selector: ".score-travel p" })).toBeTruthy();
    expect(screen.getByText("Peso 50% no score final.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(document.activeElement).toBe(trigger);
  });
  it("never shows a number when data is missing and points to the profile", () => {
    render(<ScoreDialog jobTitle="Assistente" result={insufficient} />);
    fireEvent.click(screen.getByRole("button", { name: /Dados insuficientes/ }));
    expect(screen.getByText(/nenhum valor foi presumido/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Completar meu perfil" }).getAttribute("href")).toBe("/candidato/perfil");
    expect(screen.queryByText(/%$/, { selector: ".score-dialog-total strong" })).toBeNull();
  });
  it("separates what the candidate must fill from what the company did not inform", () => {
    const mixed: Compatibility = { ...insufficient, missing: [
      { dimension: "D", item: "Tempo de deslocamento: Endereço do local de trabalho da vaga não informado", action: "A empresa precisa informar o endereço completo do local de trabalho na vaga.", responsible: "COMPANY" },
      { dimension: "T", item: "Idiomas", action: "Informe seus idiomas e níveis no perfil.", responsible: "CANDIDATE" }
    ] };
    render(<ScoreDialog jobTitle="Assistente" result={mixed} />);
    fireEvent.click(screen.getByRole("button", { name: /Dados insuficientes/ }));
    expect(screen.getByRole("heading", { name: "A empresa não informou" })).toBeTruthy();
    expect(screen.getByText(/Não depende de você: a empresa precisa completar a vaga/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Falta no seu perfil" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Completar meu perfil" })).toHaveLength(1);
  });
  it("does not offer the profile link when only the company is missing data", () => {
    const companyOnly: Compatibility = { ...insufficient, missing: [{ dimension: "D", item: "Tempo de deslocamento: Endereço do local de trabalho da vaga não informado", action: "A empresa precisa informar o endereço completo do local de trabalho na vaga." }] };
    render(<ScoreDialog jobTitle="Assistente" result={companyOnly} />);
    fireEvent.click(screen.getByRole("button", { name: /Dados insuficientes/ }));
    expect(screen.getByRole("heading", { name: "A empresa não informou" })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Completar meu perfil" })).toBeNull();
  });
});
