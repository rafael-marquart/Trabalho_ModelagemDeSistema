import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";
import ExternalImports from "./external-imports";

const run = {
  id: "run-1", trigger: "ADMIN", status: "PARTIAL", startedAt: "2026-11-18T15:00:00.000Z", finishedAt: "2026-11-18T15:00:10.000Z",
  callsMade: 3, callLimit: 3, received: 4, processed: 2, rejected: 1, duplicates: 1, failed: 0, error: null,
  queries: [{ phrase: "vaga pcd", attempts: 2, status: "OK", httpStatus: 200, results: 4, error: null }, { phrase: "pcd", attempts: 1, status: "ERROR", httpStatus: 401, results: 0, error: "A fonte recusou as credenciais." }]
};
const overview = (over: Record<string, unknown> = {}) => ({
  configured: true, scheduleEnabled: false, llm: false, phrases: ["vaga pcd", "pcd"], callBudget: 25, usedCalls: 3, remainingCalls: 22, maxCallsPerRun: 5, runs: [run], ...over
});

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("external imports screen (SPEC-006)", () => {
  it("shows the call budget, each run with its queries, and the result of every record", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
      ok: true,
      json: async () => url.endsWith("/run-1")
        ? { records: [{ id: "r1", phrase: "vaga pcd", externalId: "9", title: "Analista PCD", result: "REJECTED", reason: "Dados mínimos ausentes: empresa contratante não identificável.", usedLlm: false, jobId: null }] }
        : overview()
    })));
    const { container } = render(<ExternalImports />);
    expect(await screen.findByText("3 de 25 usadas · restam 22")).toBeTruthy();
    expect(screen.getByText("Concluída com falhas")).toBeTruthy();
    expect(screen.getByText(/“pcd”: A fonte recusou as credenciais/)).toBeTruthy();
    expect(screen.getByText(/2 tentativas/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Ver registros" }));
    expect(await screen.findByText("Dados mínimos ausentes: empresa contratante não identificável.")).toBeTruthy();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it("cannot start a batch without credentials or when the budget is used up", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => overview({ configured: false, remainingCalls: 0, runs: [] }) })));
    render(<ExternalImports />);
    expect((await screen.findByRole("button", { name: "Executar lote de teste" }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText(/Não configuradas/)).toBeTruthy();
  });

  it("starts the batch and reports its summary", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => ({
      ok: true, json: async () => (init?.method === "POST" ? { run: { ...run, id: "run-2", status: "SUCCEEDED" } } : overview())
    }));
    vi.stubGlobal("fetch", fetchMock);
    render(<ExternalImports />);
    fireEvent.click(await screen.findByRole("button", { name: "Executar lote de teste" }));
    expect(await screen.findByText(/Concluída: 2 vagas publicadas, 1 rejeitadas, 1 duplicadas e 0 falhas, em 3 chamadas/)).toBeTruthy();
    expect(fetchMock.mock.calls.some((call) => (call as unknown as [string, RequestInit])[1]?.method === "POST")).toBe(true);
  });
});
