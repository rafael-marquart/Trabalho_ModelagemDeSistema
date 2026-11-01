import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refreshMock } = vi.hoisted(() => ({ refreshMock: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));
import ApplyPanel from "./apply-panel";

describe("apply panel (SPEC-011)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("asks for confirmation and shows the registered application", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ application: { appliedAt: "2026-10-31T15:00:00Z", stageLabel: "Inscrito", score: 84 } }), { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ApplyPanel jobId="job-1" jobTitle="Analista" companyName="TechPlus" score={84} />);
    fireEvent.click(screen.getByRole("button", { name: "Candidatar-se" }));
    expect(screen.getByText(/Confirme sua candidatura para Analista, em TechPlus.*\(84%\).*Inscrito/)).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar candidatura" }));
    expect(await screen.findByRole("heading", { name: "Candidatura registrada" })).toBeTruthy();
    expect(screen.getByText(/31\/10\/2026 às 12:00, na etapa Inscrito, com 84%/)).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("/api/candidato/candidaturas", expect.objectContaining({ method: "POST", body: JSON.stringify({ jobId: "job-1" }) }));
  });
  it("shows the refusal reason and lets the candidate go back", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ code: "JOB_UNAVAILABLE", message: "Não é possível se candidatar: esta vaga foi encerrada." }), { status: 409 })));
    render(<ApplyPanel jobId="job-1" jobTitle="Analista" companyName="TechPlus" score={84} />);
    fireEvent.click(screen.getByRole("button", { name: "Candidatar-se" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar candidatura" }));
    expect((await screen.findByRole("alert")).textContent).toContain("esta vaga foi encerrada");
    expect(screen.getByRole("button", { name: "Candidatar-se" })).toBeTruthy();
  });
});
