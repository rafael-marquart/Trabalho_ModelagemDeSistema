import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import axe from "axe-core";

vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));
vi.mock("@/components/brand-logo", () => ({ default: () => <span>AcessaVagas</span> }));
const routerPush = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: routerPush }) }));
vi.mock("@/components/theme-toggle", () => ({ default: () => <button type="button">Tema escuro</button> }));

import TermsOfUsePage from "./termos-de-uso/page";
import PrivacyPolicyPage from "./privacidade/page";
import TermsAcceptance from "@/components/terms-acceptance";
import CandidateSignupPage from "./candidato/cadastro/page";

afterEach(() => { cleanup(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("Terms of Use and Privacy Policy (OPEN-100)", () => {
  it.each([["Termos de Uso", TermsOfUsePage], ["Política de Privacidade", PrivacyPolicyPage]])("%s is a versioned, accessible page", async (title, Page) => {
    const { container } = render(<Page />);
    expect(screen.getByRole("heading", { level: 1, name: title })).toBeTruthy();
    expect(screen.getByText(/Versão 2026-11-05/)).toBeTruthy();
    expect(screen.getByRole("main")).toBeTruthy();
    expect((await axe.run(container)).violations).toEqual([]);
  });

  it("the policy explains the accessibility data, who receives what and the rights, with the contact when set", () => {
    vi.stubEnv("LEGAL_CONTACT_EMAIL", "equipe@acessavagas.test");
    render(<PrivacyPolicyPage />);
    expect(screen.getByRole("heading", { name: /dados pessoais sensíveis/ })).toBeTruthy();
    expect(screen.getAllByText(/retirar a autorização/).length).toBeGreaterThan(0);
    expect(screen.getByText(/HERE \(mapas/)).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "equipe@acessavagas.test" })[0].getAttribute("href")).toBe("mailto:equipe@acessavagas.test");
  });

  it("without a configured contact, points to the school channels instead of inventing an address", () => {
    vi.stubEnv("LEGAL_CONTACT_EMAIL", "");
    render(<TermsOfUsePage />);
    expect(screen.getByText(/canais da equipe do projeto na instituição de ensino/)).toBeTruthy();
  });

  it("the acceptance is never pre-checked and its links say they open in a new tab", () => {
    const onChange = vi.fn();
    render(<TermsAcceptance checked={false} onChange={onChange} />);
    const box = screen.getByRole("checkbox", { name: /Li e concordo com os Termos de Uso/ }) as HTMLInputElement;
    expect(box.checked).toBe(false);
    expect(box.required).toBe(true);
    expect(screen.getByRole("link", { name: "Termos de Uso (abre em nova aba)" }).getAttribute("target")).toBe("_blank");
    fireEvent.click(box);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("candidate signup sends nothing until the terms are accepted, then sends the acceptance", async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) }));
    vi.stubGlobal("fetch", fetchMock);
    render(<CandidateSignupPage />);
    for (const [label, value] of [["Nome completo", "Ana Souza"], ["E-mail", "ana@example.com"], ["CPF", "529.982.247-25"], ["Senha", "SenhaForte123"], ["Confirmar senha", "SenhaForte123"]]) {
      fireEvent.change(screen.getByLabelText(label), { target: { value } });
    }
    fireEvent.submit(screen.getByRole("button", { name: "Criar conta" }).closest("form")!);
    expect(await screen.findByText("Para criar a conta, leia e aceite os Termos de Uso e a Política de Privacidade.")).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("checkbox", { name: /Li e concordo/ }));
    fireEvent.submit(screen.getByRole("button", { name: "Criar conta" }).closest("form")!);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(JSON.parse(String((fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1].body))).toMatchObject({ acceptTerms: true, email: "ana@example.com" });
  });
});
