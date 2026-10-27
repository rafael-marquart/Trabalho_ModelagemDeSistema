import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import JobsPanel from "./jobs-panel";
import JobEditor from "./job-editor";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next/link", () => ({ default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => <a href={href} className={className}>{children}</a> }));

const fetchMock = vi.fn();
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const job = { id: "j1", status: "OPEN", title: "Analista de dados", modality: "REMOTO", deadline: "2999-12-31", locationCity: "", locationState: "" };

describe("jobs panel", () => {
  beforeEach(() => { fetchMock.mockReset(); push.mockReset(); vi.stubGlobal("fetch", fetchMock); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("lists jobs of the selected tab with counts and links", async () => {
    fetchMock.mockResolvedValue(json({ jobs: [job], counts: { DRAFT: 2, OPEN: 1, PAUSED: 0, CLOSED: 0 } }));
    render(<JobsPanel basePath="/empresa/vagas" />);
    expect(await screen.findByText("Analista de dados")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Rascunhos/ }).textContent).toContain("2");
    expect(screen.getByText("31/12/2999")).toBeTruthy();
    expect(screen.getByRole("link", { name: "+ Nova vaga" }).getAttribute("href")).toBe("/empresa/vagas/nova");
    fireEvent.click(screen.getByRole("button", { name: /Rascunhos/ }));
    await waitFor(() => expect(fetchMock).toHaveBeenLastCalledWith("/api/vagas?status=DRAFT"));
  });

  it("pauses a job and reloads", async () => {
    fetchMock.mockResolvedValueOnce(json({ jobs: [job], counts: { DRAFT: 0, OPEN: 1, PAUSED: 0, CLOSED: 0 } }))
      .mockResolvedValueOnce(json({ ok: true }))
      .mockResolvedValueOnce(json({ jobs: [], counts: { DRAFT: 0, OPEN: 0, PAUSED: 1, CLOSED: 0 } }));
    render(<JobsPanel basePath="/empresa/vagas" />);
    fireEvent.click(await screen.findByRole("button", { name: "Pausar" }));
    expect(await screen.findByText("Vaga pausada.")).toBeTruthy();
    expect(fetchMock.mock.calls[1][0]).toBe("/api/vagas/j1/acao");
  });

  it("asks for confirmation before closing", async () => {
    fetchMock.mockResolvedValue(json({ jobs: [job], counts: { DRAFT: 0, OPEN: 1, PAUSED: 0, CLOSED: 0 } }));
    vi.stubGlobal("confirm", vi.fn(() => false));
    render(<JobsPanel basePath="/empresa/vagas" />);
    fireEvent.click(await screen.findByRole("button", { name: "Encerrar" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("job editor", () => {
  beforeEach(() => { fetchMock.mockReset(); push.mockReset(); vi.stubGlobal("fetch", fetchMock); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("shows server issues next to their fields when publishing is blocked", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true, job: { id: "j9", status: "DRAFT" } }, 201))
      .mockResolvedValueOnce(json({ message: "x", issues: { description: "Descreva o trabalho e suas condições.", "accessibility.RAMPS": "Declare o estado da informação: rampas." } }, 400));
    render(<JobEditor basePath="/empresa/vagas" />);
    fireEvent.click(screen.getByRole("button", { name: "Publicar vaga" }));
    expect(await screen.findByText("Descreva o trabalho e suas condições.")).toBeTruthy();
    expect(screen.getByText(/Declare o estado da informação: rampas/)).toBeTruthy();
    expect(push).toHaveBeenCalledWith("/empresa/vagas/j9");
  });

  it("creates a draft and moves to the edit page", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true, job: { id: "j7", status: "DRAFT" } }, 201));
    render(<JobEditor basePath="/recrutador/vagas" />);
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/recrutador/vagas/j7"));
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).accessibility).toEqual({});
  });

  it("has no preselected accessibility answer and sends the chosen one", async () => {
    fetchMock.mockResolvedValueOnce(json({ ok: true, job: { id: "j7", status: "DRAFT" } }, 201));
    render(<JobEditor basePath="/empresa/vagas" />);
    const group = screen.getByRole("radiogroup", { name: "Rampas de acesso" });
    expect(group.querySelectorAll("[aria-checked=true]").length).toBe(0);
    fireEvent.click(group.querySelectorAll("[role=radio]")[0]);
    fireEvent.click(screen.getByRole("button", { name: "Salvar rascunho" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).accessibility).toEqual({ RAMPS: "PRESENT" });
  });

  it("loads a closed job as read-only", async () => {
    fetchMock.mockResolvedValueOnce(json({ job: { ...job, status: "CLOSED", description: "d", requirements: "r", locationAddress: "", salaryMin: null, salaryMax: null, accessibility: {} } }));
    render(<JobEditor basePath="/empresa/vagas" jobId="j1" />);
    expect(await screen.findByText(/Esta vaga está encerrada/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Salvar alterações" })).toBeNull();
  });
});
