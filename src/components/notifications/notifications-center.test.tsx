import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
import NotificationsCenter from "./notifications-center";
import NotificationsNavLink from "./notifications-nav-link";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const data = { unread: 1, emailNotifications: "ON", notices: [
  { id: "n1", createdAt: "2026-11-01T12:00:00Z", read: false, title: "Nova etapa: Em triagem", body: "Sua candidatura para Analista, em Loja, avançou para a etapa Em triagem.", href: "/candidato/candidaturas/a1" },
  { id: "n2", createdAt: "2026-10-31T12:00:00Z", read: true, title: "Candidatura registrada", body: "Sua candidatura para Analista foi registrada.", href: "/candidato/candidaturas/a1" }
] };

describe("Notificações no site (SPEC-017)", () => {
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("lists the notices, marks them as read and switches the e-mail copy", async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === "/api/notificacoes") return json(data);
      if (url === "/api/notificacoes/lidas") return json({ ok: true, changed: 1, unread: 0 });
      if (url === "/api/conta/preferencias") return json({ ok: true, preferences: JSON.parse(String(init?.body)).preferences });
      return json({});
    });
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<NotificationsCenter />);
    expect(await screen.findByRole("heading", { name: "Nova etapa: Em triagem" })).toBeTruthy();
    expect(screen.getByText("1 notificação não lida.")).toBeTruthy();
    expect((await axe.run(container)).violations).toEqual([]);
    fireEvent.click(screen.getByRole("button", { name: "Marcar como lida: Nova etapa: Em triagem" }));
    await waitFor(() => expect(screen.getByText("Nenhuma notificação não lida.")).toBeTruthy());
    expect(fetchMock).toHaveBeenCalledWith("/api/notificacoes/lidas", expect.objectContaining({ body: JSON.stringify({ id: "n1" }) }));
    fireEvent.click(screen.getByLabelText("Receber também por e-mail"));
    expect(await screen.findByText("Os avisos ficarão só aqui, sem e-mail.")).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith("/api/conta/preferencias", expect.objectContaining({ body: JSON.stringify({ preferences: { EMAIL_NOTIFICATIONS: "OFF" } }) }));
  });

  it("says when there are no notices", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ unread: 0, emailNotifications: "ON", notices: [] })));
    render(<NotificationsCenter />);
    expect(await screen.findByText(/Você ainda não tem notificações/)).toBeTruthy();
  });

  it("shows the unread count in the side menu", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ unread: 3 })));
    render(<nav aria-label="Menu"><NotificationsNavLink href="/candidato/notificacoes" current={false} /></nav>);
    expect(await screen.findByText(", 3 não lidas")).toBeTruthy();
    expect(screen.getByRole("link").getAttribute("href")).toBe("/candidato/notificacoes");
  });
});
