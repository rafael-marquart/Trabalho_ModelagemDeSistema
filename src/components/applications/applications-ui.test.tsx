import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
import FunnelBoard from "./funnel-board";
import ApplicationDetail from "./application-detail";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const board = { job: { id: "job-1", title: "Analista", status: "OPEN" }, counts: { INSCRITO: 1, TRIAGEM: 1 }, applications: [
  { id: "a1", candidateName: "Ana Lima", appliedAt: "2026-10-31T15:00:00Z", stage: "INSCRITO", stageLabel: "Inscrito", score: 84 },
  { id: "a2", candidateName: "Bia Souza", appliedAt: "2026-10-31T16:00:00Z", stage: "TRIAGEM", stageLabel: "Triagem", score: null }
] };
const detail = (stage = "INSCRITO", nextStages = [{ stage: "TRIAGEM", label: "Triagem" }]) => ({ application: {
  id: "a1", job: { id: "job-1", title: "Analista" }, candidate: { fullName: "Ana Lima", email: "ana@example.com" }, appliedAt: "2026-10-31T15:00:00Z",
  stage, stageLabel: stage === "INSCRITO" ? "Inscrito" : "Triagem", score: 84,
  dimensions: [{ code: "A", status: "EVALUATED", score: 100 }, { code: "T", status: "EVALUATED", score: 60 }, { code: "D", status: "INSUFFICIENT", score: null }],
  profile: { education: [], experience: [{ role: "Analista", company: "X", period: "2024" }], languages: [], courses: [], certifications: [], links: [] },
  accessibility: { declaration: "NEEDS_DECLARED", needs: ["Rampa"], essentialResources: [] },
  history: [{ at: "2026-10-31T15:00:00Z", from: null, to: "Inscrito", kind: "Candidatura registrada", actor: "Ana Lima (candidato)", note: null }],
  nextStages, blockingIssues: []
} });

describe("company funnel screens (SPEC-013)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("lists applications with counts and filters by stage", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(board)));
    render(<FunnelBoard basePath="/empresa/vagas" jobId="job-1" />);
    expect(await screen.findByRole("heading", { name: "Candidaturas — Analista" })).toBeTruthy();
    expect(screen.getByText("Sem score (dados insuficientes)")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Triagem/ }));
    expect(screen.queryByText("Ana Lima")).toBeNull();
    expect(screen.getByRole("link", { name: "Abrir candidatura de Bia Souza" }).getAttribute("href")).toBe("/empresa/vagas/job-1/candidaturas/a2");
  });
  it("asks for confirmation before moving and refreshes the stage and history", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json(detail()))
      .mockResolvedValueOnce(json({ ok: true, stage: "TRIAGEM" }))
      .mockResolvedValueOnce(json(detail("TRIAGEM", [{ stage: "ENTREVISTA", label: "Entrevista" }, { stage: "RECUSADA", label: "Recusada" }])));
    vi.stubGlobal("fetch", fetchMock);
    render(<ApplicationDetail basePath="/empresa/vagas" jobId="job-1" applicationId="a1" />);
    fireEvent.click(await screen.findByRole("button", { name: "Mover para Triagem" }));
    expect(screen.getByText("Mover Ana Lima de Inscrito para Triagem?")).toBeTruthy();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Perfil aderente" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(await screen.findByText("Etapa alterada para Triagem.")).toBeTruthy();
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "POST", body: JSON.stringify({ toStage: "TRIAGEM", note: "Perfil aderente" }) });
    await waitFor(() => expect(screen.getByRole("button", { name: "Recusar candidatura" })).toBeTruthy());
  });
  it("shows that a final stage cannot move and has no accessibility violations", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json(detail("CONTRATADO", []))));
    const { container } = render(<ApplicationDetail basePath="/empresa/vagas" jobId="job-1" applicationId="a1" />);
    expect(await screen.findByText(/etapa final/)).toBeTruthy();
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
    expect(result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.html).join(" | ")}`)).toEqual([]);
  });
});
