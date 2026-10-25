import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AuthSplitLayout from "@/components/auth-split-layout";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    className,
    "aria-current": ariaCurrent,
    "aria-label": ariaLabel
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
    "aria-current"?: "page";
    "aria-label"?: string;
  }) => <a href={href} className={className} aria-current={ariaCurrent} aria-label={ariaLabel}>{children}</a>
}));

vi.mock("@/components/theme-toggle", () => ({
  default: () => <button type="button" aria-label="Alternar tema claro e escuro">Tema</button>
}));

describe("authentication split layout", () => {
  it("shows the approved role switch with the current profile announced", () => {
    render(
      <AuthSplitLayout
        profile="candidate"
        eyebrow="Área do candidato"
        title="Entrar como candidato"
        description="Acesse suas vagas e acompanhe suas candidaturas."
        footer={<p className="auth-footer">Ainda não tem uma conta?</p>}
      >
        <form>
          <label htmlFor="email">E-mail</label>
          <input id="email" />
        </form>
      </AuthSplitLayout>
    );

    expect(screen.getByRole("heading", { name: "Entrar como candidato" })).toBeTruthy();
    expect(screen.getByRole("navigation", { name: "Tipo de conta" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Candidato" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Empresa" }).getAttribute("href")).toBe("/empresa/login");
    expect(screen.getByRole("button", { name: "Alternar tema claro e escuro" })).toBeTruthy();
    expect(screen.getByLabelText("E-mail")).toBeTruthy();
  });

  it("can omit the role switch for shared account-recovery flows", () => {
    render(
      <AuthSplitLayout
        profile="candidate"
        showRoleSwitch={false}
        eyebrow="Segurança da conta"
        title="Recupere seu acesso."
        description="Informe os dados da sua conta."
        footer={<p className="auth-footer">Voltar ao login</p>}
      >
        <form><label htmlFor="identifier">E-mail</label><input id="identifier" /></form>
      </AuthSplitLayout>
    );

    expect(screen.getByRole("heading", { name: "Recupere seu acesso." })).toBeTruthy();
    expect(screen.queryByRole("navigation", { name: "Tipo de conta" })).toBeNull();
  });
});
