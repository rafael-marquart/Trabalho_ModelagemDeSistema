import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
import InterviewPanel, { type Interview } from "./interview-panel";
import InterviewEvaluation from "../candidate/interview-evaluation";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const future: Interview = { id: "i1", scheduledAt: "2099-11-10T17:30:00.000Z", modality: "ONLINE", modalityLabel: "On-line", locationOrLink: "https://meet.example/abc", accessibilityResources: "Intérprete de Libras", status: "SCHEDULED", statusLabel: "Agendada", completedAt: null, cancelledAt: null };

describe("interviews in the company funnel (SPEC-018)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it("schedules an interview with the candidate's essential resources in view and shows server validation", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(json({ message: "Confira os campos indicados.", issues: { locationOrLink: "Para entrevista on-line, informe o link começando com https://." } }, 400))
      .mockResolvedValueOnce(json({ ok: true, interviewId: "i1" }, 201));
    vi.stubGlobal("fetch", fetchMock);
    const onChanged = vi.fn();
    const { container } = render(<InterviewPanel applicationId="a1" interviews={[]} canSchedule candidateEssentials={["mesa adaptada"]} onChanged={onChanged} />);
    fireEvent.click(screen.getByRole("button", { name: "Agendar entrevista" }));
    expect(screen.getByText(/mesa adaptada/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Data e hora (horário de Brasília)"), { target: { value: "2099-11-10T14:30" } });
    fireEvent.change(screen.getByLabelText("Modalidade"), { target: { value: "ONLINE" } });
    fireEvent.change(screen.getByLabelText("Link da sala"), { target: { value: "sala" } });
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Agendar e avisar o candidato" }));
    expect(await screen.findByText("Para entrevista on-line, informe o link começando com https://.")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Link da sala"), { target: { value: "https://meet.example/abc" } });
    fireEvent.click(screen.getByRole("button", { name: "Agendar e avisar o candidato" }));
    await waitFor(() => expect(onChanged).toHaveBeenCalledWith("Entrevista agendada. O candidato foi avisado."));
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ scheduledAt: "2099-11-10T14:30", modality: "ONLINE", locationOrLink: "https://meet.example/abc", accessibilityResources: "" });
  });

  it("keeps completion disabled before the interview time and confirms a cancellation", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    render(<InterviewPanel applicationId="a1" interviews={[future]} canSchedule candidateEssentials={[]} onChanged={vi.fn()} />);
    expect((screen.getByRole("button", { name: "Marcar como concluída" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar entrevista" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/candidaturas/a1/entrevistas/i1/acao", expect.objectContaining({ body: JSON.stringify({ action: "cancel" }) })));
  });
});

describe("evaluation by the candidate (SPEC-018)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it("requires both ratings, lets the candidate review and then sends once", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true }, 201));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<InterviewEvaluation interviewId="i1" deadline="2026-12-31T12:00:00.000Z" />);
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Revisar avaliação" }));
    expect(screen.getByRole("alert").textContent).toContain("Confira os campos indicados");
    expect(screen.getByText("Escolha de 1 a 5 estrelas para acessibilidade.")).toBeTruthy();
    fireEvent.click(screen.getAllByRole("radio", { name: /4 estrelas/ })[0]);
    fireEvent.click(screen.getAllByRole("radio", { name: /5 estrelas/ })[1]);
    fireEvent.change(screen.getByLabelText("Comentário (opcional)"), { target: { value: "Bom atendimento" } });
    fireEvent.click(screen.getByRole("button", { name: "Revisar avaliação" }));
    expect(await screen.findByRole("heading", { name: "Revise a sua avaliação" })).toBeTruthy();
    expect(screen.getByText("4 estrelas")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Enviar avaliação" }));
    expect(await screen.findByRole("heading", { name: "Avaliação enviada" })).toBeTruthy();
    expect(JSON.parse((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body as string)).toEqual({ accessibilityRating: 4, inclusionRating: 5, comment: "Bom atendimento" });
    expect(router.refresh).toHaveBeenCalled();
  });
});
