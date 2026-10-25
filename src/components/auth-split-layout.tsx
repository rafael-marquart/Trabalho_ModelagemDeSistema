"use client";

import React, { type ReactNode } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";

type AuthProfile = "candidate" | "company";
type AuthSplitLayoutProps = {
  profile: AuthProfile;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export default function AuthSplitLayout({
  profile,
  eyebrow,
  title,
  description,
  children,
  footer
}: AuthSplitLayoutProps) {
  return (
    <main className="auth-split-page">
      <section className="auth-split-visual" aria-label="Identidade Acessa Vagas">
        <div className="auth-split-decoration" aria-hidden="true">
          <span className="auth-split-decoration-small" />
        </div>
        <Link className="auth-split-brand" href="/" aria-label="Acessa Vagas — início">
          <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
        </Link>
        <p className="auth-split-slogan">Acesso que transforma.</p>
        <div className="auth-split-visual-copy">
          <h2>Mais inclusão,<br />mais oportunidades.</h2>
          <p>Encontre oportunidades alinhadas ao seu perfil e empresas que levam acessibilidade a sério.</p>
          <div className="auth-split-badges">
            <span>Acessibilidade real</span>
            <span>Mais transparência</span>
          </div>
        </div>
      </section>

      <section className="auth-split-content" aria-labelledby="auth-split-title">
        <div className="theme-control-host"><ThemeToggle /></div>
        <div className="auth-split-card">
          <nav className="auth-role-switch" aria-label="Tipo de conta">
            <Link
              className="auth-role-link"
              href="/candidato/login"
              aria-current={profile === "candidate" ? "page" : undefined}
            >
              Candidato
            </Link>
            <Link
              className="auth-role-link"
              href="/empresa/login"
              aria-current={profile === "company" ? "page" : undefined}
            >
              Empresa
            </Link>
          </nav>
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="auth-split-title">{title}</h1>
          <p className="muted">{description}</p>
          {children}
          {footer}
        </div>
      </section>
    </main>
  );
}
