import React from "react";
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
vi.mock("@/components/theme-toggle", () => ({ default: () => <button type="button">Tema escuro</button> }));
vi.mock("@/components/brand-logo", () => ({ default: () => <span>AcessaVagas</span> }));

import PasswordRecoveryPage from "./page";

describe("password recovery page", () => {
  afterEach(() => { cleanup(); window.history.replaceState(null, "", "/"); });

  it("offers the three account types and comes from the recruiter login already set to Recrutador", async () => {
    window.history.replaceState(null, "", "/recuperar-senha?perfil=recrutador");
    render(<PasswordRecoveryPage />);
    await act(async () => {});
    const select = screen.getByLabelText("Tipo de conta") as HTMLSelectElement;
    expect([...select.options].map((option) => option.textContent)).toEqual(["Candidato", "Empresa", "Recrutador"]);
    expect(select.value).toBe("recruiter");
    expect((screen.getByLabelText("E-mail") as HTMLInputElement).type).toBe("email");
    expect(screen.getByRole("link", { name: "Recrutador" }).getAttribute("href")).toBe("/recrutador/login");
  });

  it("keeps the candidate as default, accepting e-mail or CPF", async () => {
    window.history.replaceState(null, "", "/recuperar-senha?perfil=desconhecido");
    render(<PasswordRecoveryPage />);
    await act(async () => {});
    expect((screen.getByLabelText("Tipo de conta") as HTMLSelectElement).value).toBe("candidate");
    expect(screen.getByLabelText("E-mail ou CPF")).toBeTruthy();
  });
});
