import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

const router = vi.hoisted(() => ({ replace: vi.fn(), refresh: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
import MyApplications, { type MyApplication } from "./my-applications";
import CancelApplication from "./cancel-application";

const items: MyApplication[] = [
  { id: "a1", appliedAt: "2026-10-30T15:00:00Z", stage: "INSCRITO", stageLabel: "Inscrita", job: { id: "j1", title: "Analista administrativo", companyName: "Empresa Ágil", closed: false } },
  { id: "a2", appliedAt: "2026-10-20T15:00:00Z", stage: "RECUSADA", stageLabel: "Recusada", job: { id: "j2", title: "Assistente de atendimento", companyName: "Loja Centro", closed: true } },
  { id: "a3", appliedAt: "2026-10-10T15:00:00Z", stage: "CANCELADA", stageLabel: "Cancelada", job: { id: "j3", title: "Auxiliar de suporte", companyName: "Empresa Ágil", closed: false }, canHide: true }
];
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });

describe("Minhas candidaturas (SPEC-012/016)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks(); });

  it("lists own applications with their current stage, including cancelled ones, and filters on screen", async () => {
    const { container } = render(<MyApplications applications={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Cancelada", { selector: ".status-pill" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ver candidatura para Auxiliar de suporte, em Empresa Ágil" }).getAttribute("href")).toBe("/candidato/candidaturas/a3");
    fireEvent.change(screen.getByLabelText("Buscar por cargo ou empresa"), { target: { value: "empresa agil" } });
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    fireEvent.change(screen.getByLabelText("Status"), { target: { value: "CANCELADA" } });
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toContain("1 de 3");
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it("says when there is nothing to follow yet", () => {
    render(<MyApplications applications={[]} />);
    expect(screen.getByText("Você ainda não tem candidaturas para acompanhar.")).toBeTruthy();
  });

  it("asks for confirmation; going back changes nothing", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<CancelApplication applicationId="a1" jobTitle="Analista" />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar candidatura" }));
    expect(await screen.findByRole("heading", { name: "Cancelar candidatura?" })).toBeTruthy();
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Cancelar candidatura?" })).toBeNull());
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("cancels after confirming and opens the result view; a refusal is explained", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true, stage: "CANCELADA" }));
    vi.stubGlobal("fetch", fetchMock);
    render(<CancelApplication applicationId="a1" jobTitle="Analista" />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar candidatura" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar cancelamento" }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/candidato/candidaturas/a1?cancelada=1"));
    expect(fetchMock).toHaveBeenCalledWith("/api/candidato/candidaturas/a1/cancelar", { method: "POST" });

    fetchMock.mockResolvedValueOnce(json({ message: "A vaga foi encerrada; a candidatura não pode mais ser cancelada." }, 409));
    cleanup();
    render(<CancelApplication applicationId="a1" jobTitle="Analista" />);
    fireEvent.click(screen.getByRole("button", { name: "Cancelar candidatura" }));
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar cancelamento" }));
    expect((await screen.findByRole("alert")).textContent).toContain("vaga foi encerrada");
  });

  it("removes a finished application from the list after confirming", async () => {
    const fetchMock = vi.fn(async () => json({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);
    render(<MyApplications applications={items} />);
    expect(screen.getAllByRole("button", { name: /Remover da lista a candidatura/ })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Remover da lista a candidatura para Auxiliar de suporte" }));
    expect(await screen.findByRole("heading", { name: "Remover da lista?" })).toBeTruthy();
    fireEvent.click(screen.getAllByRole("button", { name: "Remover da lista" }).at(-1)!);
    await waitFor(() => expect(router.refresh).toHaveBeenCalled());
    expect(fetchMock).toHaveBeenCalledWith("/api/candidato/candidaturas/a3/ocultar", { method: "POST" });
  });
});
