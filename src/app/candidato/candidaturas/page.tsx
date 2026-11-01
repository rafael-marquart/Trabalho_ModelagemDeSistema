import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import MyApplications from "@/components/candidate/my-applications";
import { getCurrentUser } from "@/lib/auth/session";
import { listCandidateApplications } from "@/lib/applications/candidate-service";

/** SPEC-012/016: "Minhas candidaturas" — only the signed-in candidate's applications, with their current stage. */
export default async function MyApplicationsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const applications = await listCandidateApplications(user.id);
  return <CompanyShell role="CANDIDATE" active="applications" userName={user.fullName}>
    <main className="company-content" aria-labelledby="my-applications-title">
      <header className="company-page-heading">
        <div>
          <h1 id="my-applications-title">Minhas candidaturas</h1>
          <p className="muted">Acompanhe o status e o histórico das suas candidaturas. Depois do cancelamento ou do encerramento da vaga, o histórico fica disponível por 60 dias.</p>
        </div>
      </header>
      <MyApplications applications={applications} />
    </main>
  </CompanyShell>;
}
