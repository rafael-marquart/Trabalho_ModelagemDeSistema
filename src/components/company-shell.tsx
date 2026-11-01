import React, { ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import BrandLogo from "@/components/brand-logo";
import NotificationsNavLink from "@/components/notifications/notifications-nav-link";

export type ShellRole = "COMPANY" | "RECRUITER" | "CANDIDATE" | "ADMIN";
export type ShellSection = "home" | "jobs" | "recruiters" | "settings" | "profile" | "catalog" | "applications" | "notifications" | "reports";

const menus: Record<ShellRole, { key: ShellSection; label: string; href: string }[]> = {
  COMPANY: [
    { key: "home", label: "Início", href: "/empresa" },
    { key: "jobs", label: "Vagas", href: "/empresa/vagas" },
    { key: "recruiters", label: "Recrutadores", href: "/empresa/recrutadores" },
    { key: "notifications", label: "Notificações", href: "/empresa/notificacoes" },
    { key: "reports", label: "Denúncias", href: "/empresa/denuncias" },
    { key: "settings", label: "Configurações", href: "/empresa/configuracoes" }
  ],
  RECRUITER: [
    { key: "home", label: "Visão geral", href: "/recrutador" },
    { key: "jobs", label: "Vagas", href: "/recrutador/vagas" },
    { key: "notifications", label: "Notificações", href: "/recrutador/notificacoes" },
    { key: "reports", label: "Denúncias", href: "/recrutador/denuncias" }
  ],
  // D-02 (29/10/2026): applications (SPEC-012/016) and notifications (SPEC-017) joined the menu when implemented.
  CANDIDATE: [
    { key: "home", label: "Início", href: "/candidato" },
    { key: "jobs", label: "Vagas", href: "/candidato/vagas" },
    { key: "applications", label: "Minhas candidaturas", href: "/candidato/candidaturas" },
    { key: "notifications", label: "Notificações", href: "/candidato/notificacoes" },
    { key: "reports", label: "Minhas denúncias", href: "/candidato/denuncias" },
    { key: "profile", label: "Meu perfil", href: "/candidato/perfil" }
  ],
  ADMIN: [
    { key: "catalog", label: "Catálogo de acessibilidade", href: "/admin/catalogo-acessibilidade" },
    { key: "reports", label: "Denúncias", href: "/admin/denuncias" }
  ]
};
const areaText: Record<ShellRole, { home: string; label: string; menu: string; nav: string }> = {
  COMPANY: { home: "/empresa", label: "Área da empresa", menu: "Menu da empresa", nav: "Menu da empresa" },
  RECRUITER: { home: "/recrutador", label: "Área do recrutador", menu: "Menu do recrutador", nav: "Menu do recrutador" },
  CANDIDATE: { home: "/candidato", label: "Área do candidato", menu: "Menu do candidato", nav: "Menu do candidato" },
  ADMIN: { home: "/admin/catalogo-acessibilidade", label: "Administração da plataforma", menu: "Menu da administração", nav: "Menu da administração" }
};

function initials(name: string) {
  const letters = name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return letters.join("") || "AV";
}

/** Shared frame of the company, recruiter and candidate areas: top bar, side menu and content region. */
export default function CompanyShell({ role, active, userName, children }: {
  role: ShellRole; active: ShellSection | null; userName: string; children: ReactNode;
}) {
  const text = areaText[role];
  const home = text.home;
  return <div className="company-dashboard">
    <header className="company-topbar">
      <Link className="company-brand" href={home} aria-label="Acessa Vagas — página inicial da área">
        <BrandLogo />
      </Link>
      <span className="company-topbar-label">{text.label}</span>
      <div className="company-topbar-actions">
        <ThemeToggle />
        <span className="company-avatar" aria-hidden="true">{initials(userName)}</span>
        <form action="/api/auth/logout" method="post"><button className="secondary-button" type="submit">Sair da conta</button></form>
      </div>
    </header>
    <div className="company-dashboard-body">
      <aside className="company-sidebar" aria-label={text.menu}>
        <p className="company-sidebar-title">{text.menu}</p>
        <nav className="company-nav" aria-label={text.nav}>
          {menus[role].map((item) => item.key === "notifications"
            ? <NotificationsNavLink key={item.key} href={item.href} current={item.key === active} />
            : <Link key={item.key} className="company-nav-item" href={item.href}
              aria-current={item.key === active ? "page" : undefined}>{item.label}</Link>)}
        </nav>
      </aside>
      {children}
    </div>
  </div>;
}
