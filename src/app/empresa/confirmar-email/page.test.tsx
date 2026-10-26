import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ConfirmCompanyEmailPage from "./page";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>
}));

vi.mock("@/components/theme-toggle", () => ({
  default: () => <button type="button" aria-label="Alternar tema claro e escuro">Tema</button>
}));

const fetchMock = vi.fn();

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" }
  });
}

describe("company email confirmation page", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState({}, "", "/empresa/confirmar-email?token=valid-one-time-token-value");
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    window.history.replaceState({}, "", "/");
  });

  it("does not consume the confirmation token automatically on page load", async () => {
    render(<ConfirmCompanyEmailPage />);

    expect(await screen.findByRole("button", { name: "Confirmar e-mail" })).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("confirms only after an explicit click and announces success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({
      ok: true,
      message: "E-mail corporativo confirmado. Sua conta empresarial está ativada."
    }));

    render(<ConfirmCompanyEmailPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar e-mail" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/auth/company/verify-email", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: "valid-one-time-token-value" })
      }));
    });

    expect(await screen.findByRole("status")).toHaveTextContent("Sua conta empresarial está ativada.");
    expect(screen.queryByRole("button", { name: "Confirmar e-mail" })).toBeNull();
  });

  it("allows retry after a temporary network failure", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network unavailable"))
      .mockResolvedValueOnce(jsonResponse({ ok: true, message: "E-mail confirmado." }));

    render(<ConfirmCompanyEmailPage />);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar e-mail" }));

    const retry = await screen.findByRole("button", { name: "Tentar novamente" });
    fireEvent.click(retry);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole("status")).toHaveTextContent("E-mail confirmado.");
  });
});
