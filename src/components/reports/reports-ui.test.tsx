import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
import ReportForm from "./report-form";
import ModerationDetail from "./moderation-detail";
import CompanyReports from "./company-reports";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const detail = (status = "EM_ANALISE") => ({ report: {
  id: "r1", createdAt: "2026-11-02T12:00:00Z", dueAt: "2026-11-09T12:00:00Z", overdue: false, categoryLabel: "Possível falsa inclusão", status, statusLabel: status === "EM_ANALISE" ? "Em análise" : "Recebida",
  highPriority: false, reporterFlaggedRisk: true, description: "Local sem rampa.", evidence: null, extensionReason: null, companyRequest: null, companyResponse: null, companyRespondedAt: null,
  decision: null, decisionLabel: null, reporterSummary: null, justification: null, measures: null, concludedAt: null,
  job: { id: "j1", title: "Analista", status: "OPEN", companyName: "Loja", accessibility: { PHYSICAL_ACCESS: "PRESENT" } }, evaluation: null,
  history: [{ at: "2026-11-02T12:00:00Z", kind: "SUBMITTED", from: null, to: "Recebida", actor: "Denunciante", note: null }]
} });

describe("report form (SPEC-019)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("requires category and description, then confirms without promising a decision", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true, reportId: "r1" }, 201));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ReportForm jobId="j1" jobTitle="Analista" companyName="Loja" evaluations={[{ id: "e1", submittedAt: "2026-11-01T12:00:00Z", interviewAt: "2026-10-30T12:00:00Z" }]} />);
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Registrar denúncia" }));
    expect(screen.getByText("Escolha o tipo da situação.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("radio", { name: /Possível falsa inclusão/ }));
    fireEvent.change(screen.getByLabelText("O que aconteceu"), { target: { value: "A entrevista foi num local sem rampa de acesso." } });
    fireEvent.change(screen.getByLabelText(/entrevista que você avaliou/), { target: { value: "e1" } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar denúncia" }));
    expect(await screen.findByRole("heading", { name: "Denúncia registrada" })).toBeTruthy();
    expect(screen.getByText(/não significa que houve irregularidade/)).toBeTruthy();
    expect(JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)).toMatchObject({ jobId: "j1", category: "FALSE_INCLUSION", evaluationId: "e1", reporterFlaggedRisk: false });
  });
  it("explains the daily limit", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ message: "Você já registrou 3 denúncias nas últimas 24 horas." }, 429)));
    render(<ReportForm jobId="j1" jobTitle="Analista" companyName="Loja" evaluations={[]} />);
    fireEvent.click(screen.getByRole("radio", { name: /incompatibilidade/ }));
    fireEvent.change(screen.getByLabelText("O que aconteceu"), { target: { value: "Não havia intérprete de Libras como declarado." } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar denúncia" }));
    expect((await screen.findByRole("alert")).textContent).toContain("3 denúncias");
  });
});

describe("moderation (SPEC-020)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("shows the context and asks for measures only when the report is upheld", async () => {
    const fetchMock = vi.fn(async (url: string) => url.endsWith("/acao") ? json({ ok: true }) : json(detail()));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<ModerationDetail reportId="r1" />);
    expect(await screen.findByText("O denunciante indicou risco atual à segurança ou à acessibilidade.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Registrar decisão" }));
    fireEvent.change(screen.getByLabelText("Conclusão"), { target: { value: "IMPROCEDENTE" } });
    expect(screen.queryByLabelText("Medidas administrativas")).toBeNull();
    fireEvent.change(screen.getByLabelText("Conclusão"), { target: { value: "PROCEDENTE" } });
    expect(screen.getByLabelText("Medidas administrativas")).toBeTruthy();
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.change(screen.getByLabelText("Justificativa resumida para o denunciante"), { target: { value: "Confirmamos a falta de rampa." } });
    fireEvent.change(screen.getByLabelText("Justificativa da decisão (vai para a empresa)"), { target: { value: "Local sem rampa, contrário ao declarado." } });
    fireEvent.change(screen.getByLabelText("Medidas administrativas"), { target: { value: "Corrigir a acessibilidade declarada." } });
    fireEvent.click(screen.getByRole("button", { name: "Registrar decisão e avisar as partes" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/admin/denuncias/r1/acao", expect.objectContaining({ method: "POST" })));
    const sent = JSON.parse((fetchMock.mock.calls.find((call) => String(call[0]).endsWith("/acao")) as unknown as [string, RequestInit])[1].body as string);
    expect(sent).toMatchObject({ action: "conclude", decision: "PROCEDENTE", measures: "Corrigir a acessibilidade declarada." });
  });
});

describe("company view (SPEC-019/020)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("answers the moderation's points without seeing who reported", async () => {
    const fetchMock = vi.fn(async (url: string) => url.endsWith("/resposta") ? json({ ok: true }) : json({ reports: [
      { id: "r1", createdAt: "2026-11-02T12:00:00Z", categoryLabel: "Possível falsa inclusão", status: "AGUARDANDO_INFORMACOES", statusLabel: "Aguardando informações", jobTitle: "Analista", request: "Informe se a sala tem rampa.", response: null, respondedAt: null, canRespond: true, decisionLabel: null, justification: null, measures: null, concludedAt: null }
    ] }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<CompanyReports />);
    expect(await screen.findByText("Informe se a sala tem rampa.")).toBeTruthy();
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.change(screen.getByLabelText("Sua resposta à moderação"), { target: { value: "Sim, a sala tem rampa na entrada principal." } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar resposta" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/empresa/denuncias/r1/resposta", expect.objectContaining({ method: "POST" })));
  });
});
