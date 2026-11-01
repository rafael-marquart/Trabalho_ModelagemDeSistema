import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import MyApplications from "@/components/candidate/my-applications";
import { getCurrentUser } from "@/lib/auth/session";
import { listCandidateApplications } from "@/lib/applications/candidate-service";

/** SPEC-012/016: "Minhas candidaturas" — only the signed-in candidate's applications, with their current stage. */
export default async function MyApplicationsPage({ searchParams }: { searchParams?: Promise<{ removida?: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const applications = await listCandidateApplications(user.id);
  const removed = (await searchParams)?.removida === "1";
  return <CompanyShell role="CANDIDATE" active="applications" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="my-applications-title">
      <header className="company-page-heading">
        <div>
          <h1 id="my-applications-title">Minhas candidaturas</h1>
          <p className="muted">Acompanhe o status e o histórico das suas candidaturas. Depois do cancelamento ou do encerramento da vaga, o histórico fica disponível por 60 dias.</p>
        </div>
      </header>
      {removed ? <p className="application-result" role="status">A candidatura foi removida da sua lista. O registro e o histórico continuam guardados.</p> : null}
      <MyApplications applications={applications} />
    </main>
  </CompanyShell>;
}
