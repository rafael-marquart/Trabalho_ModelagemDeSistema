import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import CompanyReports from "@/components/reports/company-reports";
import { getCurrentUser } from "@/lib/auth/session";

/** SPEC-019/020: reports about the company that need an answer or were concluded. */
export default async function CompanyReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return <CompanyShell role="COMPANY" active="reports" userName={user.fullName}>
    <main className="company-content" aria-labelledby="company-reports-title">
      <header className="company-page-heading"><div>
        <h1 id="company-reports-title">Denúncias</h1>
        <p className="muted">Pedidos de esclarecimento e resultados da moderação da plataforma sobre as vagas da empresa. A identidade de quem denunciou não é informada.</p>
      </div></header>
      <CompanyReports />
    </main>
  </CompanyShell>;
}
