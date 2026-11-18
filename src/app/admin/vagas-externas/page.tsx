import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import ExternalImports from "@/components/external-imports";
import { getCurrentUser } from "@/lib/auth/session";

/** SPEC-006: external job imports (Adzuna) — test batch and traceability of each run. */
export default async function ExternalImportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  return <CompanyShell role="ADMIN" active="external" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="external-title">
      <header className="company-page-heading"><div>
        <h1 id="external-title">Vagas externas</h1>
        <p className="muted">Importação de vagas do Adzuna: cada anúncio é validado, normalizado e conferido contra duplicidades antes de aparecer para os candidatos.</p>
      </div></header>
      <ExternalImports />
    </main>
  </CompanyShell>;
}
