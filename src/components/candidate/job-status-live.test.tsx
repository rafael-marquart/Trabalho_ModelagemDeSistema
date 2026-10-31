import React from "react";
import { act, cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const { refreshMock } = vi.hoisted(() => ({ refreshMock: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));
import JobStatusLive from "./job-status-live";

const open = { code: "OPEN", label: "Aberta", message: "Inscrições abertas até 31/12/2026." } as const;
const closed = { code: "CLOSED", label: "Encerrada", message: "Esta vaga foi encerrada e não recebe candidaturas." } as const;

describe("live job status (SPEC-009)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
  it("shows the current status and warns when it changed since the page was opened", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ availability: closed }), { status: 200 })));
    render(<JobStatusLive jobId="job-1" initial={open} />);
    expect(screen.getByText("Vaga aberta")).toBeTruthy();
    await act(async () => { window.dispatchEvent(new Event("focus")); await Promise.resolve(); await Promise.resolve(); });
    expect(await screen.findByText(/agora ela está encerrada/)).toBeTruthy();
    expect(screen.getByText("Vaga encerrada")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Atualizar a página" }));
    expect(refreshMock).toHaveBeenCalled();
  });
  it("keeps the shown status when the check fails or nothing changed", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("offline"); }));
    render(<JobStatusLive jobId="job-1" initial={open} />);
    await act(async () => { window.dispatchEvent(new Event("focus")); await Promise.resolve(); });
    expect(screen.getByText("Vaga aberta")).toBeTruthy();
    expect(screen.queryByText(/mudou/)).toBeNull();
  });
});
