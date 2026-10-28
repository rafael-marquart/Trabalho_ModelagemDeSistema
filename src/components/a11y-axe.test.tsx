import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import axe from "axe-core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ChoiceGroup from "@/components/choice-group";
import CompanyShell from "@/components/company-shell";
import JobEditor from "@/components/jobs/job-editor";
import JobsPanel from "@/components/jobs/jobs-panel";
import RecruiterLoginPage from "@/app/recrutador/login/page";
import CompanyLoginPage from "@/app/empresa/login/page";
import SkipLink from "@/components/skip-link";
import ThemeProvider from "@/components/theme-provider";
import ContrastProvider from "@/components/contrast-provider";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));
vi.mock("next/link", () => ({ default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) => <a href={href} {...rest}>{children}</a> }));

// jsdom has no layout engine, so colour contrast is covered by the token tests instead.
async function violations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  return result.violations.map(v => `${v.id}: ${v.nodes.map(n => n.html).join(" | ")}`);
}

describe("automated accessibility checks (axe-core)", () => {
  beforeEach(() => { vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ jobs: [], counts: { DRAFT: 0, OPEN: 0, PAUSED: 0, CLOSED: 0 } }), { status: 200 }))); });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it("choice group and skip link have no violations", async () => {
    const { container } = render(<><SkipLink /><main><ChoiceGroup legend="Modalidade" choices={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} value="" onChange={() => {}} /></main></>);
    expect(await violations(container)).toEqual([]);
  });

  it("company shell with the jobs panel has no violations", async () => {
    const { container } = render(<ThemeProvider><ContrastProvider><CompanyShell role="COMPANY" active="jobs" userName="Empresa Teste"><JobsPanel basePath="/empresa/vagas" /></CompanyShell></ContrastProvider></ThemeProvider>);
    await waitFor(() => expect(screen.getByText("Nenhuma vaga nesta situação.")).toBeTruthy());
    expect(await violations(container)).toEqual([]);
  });

  it("job editor form has no violations", async () => {
    const { container } = render(<JobEditor basePath="/empresa/vagas" />);
    expect(await violations(container)).toEqual([]);
  });

  it("login pages have no violations", async () => {
    for (const Page of [RecruiterLoginPage, CompanyLoginPage]) {
      const { container, unmount } = render(<ThemeProvider><ContrastProvider><Page /></ContrastProvider></ThemeProvider>);
      expect(await violations(container)).toEqual([]);
      unmount();
    }
  });
});
