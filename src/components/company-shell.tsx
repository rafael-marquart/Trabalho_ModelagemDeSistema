import React, { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

export type ShellRole = "COMPANY" | "RECRUITER";
export type ShellSection = "home" | "jobs" | "recruiters" | "settings";

const menus: Record<ShellRole, { key: ShellSection; label: string; href: string }[]> = {
  COMPANY: [
    { key: "home", label: "Início", href: "/empresa" },
    { key: "jobs", label: "Vagas", href: "/empresa/vagas" },
    { key: "recruiters", label: "Recrutadores", href: "/empresa/recrutadores" },
    { key: "settings", label: "Configurações", href: "/empresa/configuracoes" }
  ],
  RECRUITER: [
    { key: "home", label: "Visão geral", href: "/recrutador" },
    { key: "jobs", label: "Vagas", href: "/recrutador/vagas" }
  ]
};

function initials(name: string) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "AV";
}

/** Shared frame of the company area: top bar, side menu and content region. */
export default function CompanyShell({ role, active, userName, children }: {
  role: ShellRole; active: ShellSection | null; userName: string; children: ReactNode;
}) {
  const home = role === "COMPANY" ? "/empresa" : "/recrutador";
  return <div className="company-dashboard">
    <header className="company-topbar">
      <Link className="company-brand" href={home} aria-label="Acessa Vagas — página inicial da área">
        <img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" />
      </Link>
      <span className="company-topbar-label">{role === "COMPANY" ? "Área da empresa" : "Área do recrutador"}</span>
      <div className="company-topbar-actions">
        <ThemeToggle />
        <span className="company-avatar" aria-hidden="true">{initials(userName)}</span>
        <form action="/api/auth/logout" method="post"><button className="secondary-button" type="submit">Sair da conta</button></form>
      </div>
    </header>
    <div className="company-dashboard-body">
      <aside className="company-sidebar">
        <p className="company-sidebar-title">{role === "COMPANY" ? "MENU DA EMPRESA" : "MENU DO RECRUTADOR"}</p>
        <nav className="company-nav" aria-label={role === "COMPANY" ? "Menu da empresa" : "Menu do recrutador"}>
          {menus[role].map((item) => <Link key={item.key} className="company-nav-item" href={item.href}
            aria-current={item.key === active ? "page" : undefined}>{item.label}</Link>)}
        </nav>
      </aside>
      {children}
    </div>
  </div>;
}
