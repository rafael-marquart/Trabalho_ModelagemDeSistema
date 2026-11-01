import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

const { detailMock } = vi.hoisted(() => ({ detailMock: vi.fn() }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
vi.mock("next/navigation", () => ({ redirect: vi.fn(), notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }), usePathname: () => "/", useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/components/theme-toggle", () => ({ default: () => <button type="button">Tema</button> }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => ({ id: "cand", role: "CANDIDATE", fullName: "Maria Silva", email: "m@example.com", isActive: true }) }));
vi.mock("@/lib/jobs/detail-service", () => ({ getJobDetailForCandidate: detailMock }));
import Page from "./page";

const dim = (score: number | null) => ({ status: score === null ? "INSUFFICIENT" : "EVALUATED", score, components: [{ label: "Item", score, detail: "Detalhe do critério." }] });
const base = {
  title: "Analista de Dados", companyName: "TechPlus", description: "Trabalhar com dados.", requirements: "Não informados",
  criteria: { skills: ["SQL"], experience: [], educationMinLevel: "", languages: [{ language: "Inglês", level: "Intermediário" }] },
  modality: "Híbrido", professionalArea: "Não informada", location: "Av. Paulista, 1000, São Paulo/SP", salary: "Não informada", deadline: "31/12/2026",
  compatibilityFromApplication: null, origin: "Publicada pela empresa no Acessa Vagas", availability: { code: "OPEN", label: "Aberta", message: "Inscrições abertas até 31/12/2026." },
  jobAccessibility: [{ label: "Rampas de acesso", status: "PRESENT", statusLabel: "Presente" }, { label: "Elevadores", status: "NOT_INFORMED", statusLabel: "Não informado" }],
  companyInfrastructure: { updatedAt: "2026-10-27T00:00:00Z", items: [{ category: "Acesso físico e circulação", label: "Rampas de acesso", status: "PRESENT", statusLabel: "Presente", note: "Só no térreo" }] },
  compatibility: { id: "r", status: "COMPLETE", score: 86, executedAt: "", factors: [], missing: [], appliedWeights: { A: 0.5, T: 0.3, D: 0.2 }, critical: { applied: false, barriers: [], pending: [] },
    dimensions: { A: dim(100), T: dim(60), D: { status: "EVALUATED", score: 90, components: [{ label: "Deslocamento", score: 75, detail: "Tempo estimado de cerca de 31 min (carro, saindo às 7h em dia útil)." }] } } },
  action: { allowed: true, message: "Você atende às condições indispensáveis desta vaga." }
};
const show = async (detail: unknown) => { detailMock.mockResolvedValue(detail); return render(await Page({ params: Promise.resolve({ id: "job-1" }) })); };

describe("job detail page", () => {
  afterEach(() => cleanup());
  it("shows the job, separates job and company accessibility, and the SPEC-007 result", async () => {
    await show(base);
    expect(screen.getByRole("heading", { level: 1, name: "Analista de Dados" })).toBeTruthy();
    expect(screen.getByText("Vaga aberta")).toBeTruthy();
    expect(screen.getAllByText("Não informada").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Declarado para esta vaga" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Informações gerais da empresa" })).toBeTruthy();
    expect(screen.getByText("Só no térreo")).toBeTruthy();
    expect(screen.getByText("86%", { selector: "strong" })).toBeTruthy();
    expect(screen.getByText(/31 min \(carro, saindo às 7h/, { selector: ".score-travel p" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Você pode se candidatar" })).toBeTruthy();
  });
  it("tells a critical incompatibility apart and blocks the next step", async () => {
    await show({ ...base, compatibility: { ...base.compatibility, status: "INCOMPATIBLE", score: null, critical: { applied: true, barriers: [{ needCode: "A01", needName: "Rampa", jobItem: "RAMPS" }], pending: [] } },
      action: { allowed: false, message: "Esta vaga não é elegível para você." } });
    expect(screen.getByText(/declara não ter rampas de acesso/)).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Candidatura não disponível" })).toBeTruthy();
    expect(screen.queryByText(/%$/, { selector: ".score-dialog-total strong" })).toBeNull();
  });
  it("says eligibility is not concluded when an indispensable resource was not informed", async () => {
    await show({ ...base, compatibility: { ...base.compatibility, status: "INSUFFICIENT_DATA", score: null, critical: { applied: false, barriers: [], pending: [{ needCode: "A02", needName: "Elevador", jobItem: "ELEVATORS" }] } },
      action: { allowed: false, message: "A elegibilidade ainda não foi concluída." } });
    expect(screen.getByText(/Elegibilidade não concluída/)).toBeTruthy();
  });
  it("shows a closed job without compatibility", async () => {
    await show({ ...base, availability: { code: "CLOSED", label: "Encerrada", message: "Esta vaga foi encerrada e não recebe candidaturas." }, compatibility: null, action: { allowed: false, message: "Esta vaga foi encerrada e não recebe candidaturas." } });
    expect(screen.getByText("Vaga encerrada")).toBeTruthy();
    expect(screen.getByText(/fica disponível depois do encerramento para quem se candidatou/)).toBeTruthy();
  });
  it("shows the result registered with the application on a closed job", async () => {
    await show({ ...base, availability: { code: "CLOSED", label: "Encerrada", message: "Esta vaga foi encerrada e não recebe candidaturas." }, compatibilityFromApplication: "2026-10-31T15:00:00.000Z",
      action: { allowed: false, applied: true, message: "Você se candidatou em 31/10/2026 às 12:00. Etapa atual: Inscrito." } });
    expect(screen.getByText(/Resultado registrado na sua candidatura, em 31\/10\/2026/)).toBeTruthy();
    expect(screen.getByText("86%", { selector: "strong" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Você já se candidatou" })).toBeTruthy();
  });
  it("returns not found for drafts or unknown jobs", async () => {
    detailMock.mockResolvedValue(null);
    await expect(Page({ params: Promise.resolve({ id: "x" }) })).rejects.toThrow("NOT_FOUND");
  });
  it("has no automated accessibility violations", async () => {
    const { container } = await show(base);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.html).join(" | ")}`)).toEqual([]);
  });
});
