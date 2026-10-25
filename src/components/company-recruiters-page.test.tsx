import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CompanyRecruitersPage from "@/app/empresa/recrutadores/page";

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

const invitation = {
  id: "invitation-1",
  status: "PENDING",
  expiresAt: "2026-11-01T12:00:00.000Z",
  createdAt: "2026-10-25T12:00:00.000Z",
  respondedAt: null,
  recipient: { fullName: "Pessoa Convidada", email: "convidado@example.com" }
};

const link = {
  id: "link-1",
  createdAt: "2026-10-01T12:00:00.000Z",
  recruiter: { fullName: "Recrutador Ativo", email: "ativo@example.com", isActive: true }
};

describe("company recruiter management page", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      if (url === "/api/company/recruiter-links") return jsonResponse({ links: [link] });
      if (url === "/api/company/recruiter-invitations" && (!init?.method || init.method === "GET")) {
        return jsonResponse({ invitations: [invitation] });
      }
      if (url === "/api/company/recruiter-invitations" && init?.method === "POST") {
        return jsonResponse({ message: "Convite reenviado; o link anterior foi invalidado." });
      }
      return jsonResponse({ message: "Solicitação inesperada no teste." }, 500);
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("shows the invitee and resends a pending invitation using the scoped recipient data", async () => {
    render(<CompanyRecruitersPage />);

    expect(await screen.findByText("Pessoa Convidada")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reenviar convite para Pessoa Convidada" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/company/recruiter-invitations", expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "convidado@example.com", fullName: "Pessoa Convidada" })
      }));
    });

    const status = await screen.findByRole("status");
    expect(status.textContent).toContain("Convite reenviado");
  });
});
