import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import CompatibilityPanel from "./compatibility-panel";

export default async function CandidateCompatibilityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  return <CompanyShell role="CANDIDATE" active="jobs" userName={user.fullName}>
    <main id="conteudo" className="company-content candidate-profile-content" aria-labelledby="compat-title">
      <Link className="back-link" href="/candidato/vagas">← Voltar às vagas</Link>
      <header className="company-page-heading candidate-profile-header">
        <p className="eyebrow">Área do candidato</p><h1 id="compat-title">Simular compatibilidade</h1>
        <p className="muted">Tela de validação da SPEC-007: permite testar outro meio de transporte em uma vaga sem mudar o seu perfil. A página completa da vaga virá na SPEC-010.</p>
      </header>
      <CompatibilityPanel />
    </main>
  </CompanyShell>;
}
