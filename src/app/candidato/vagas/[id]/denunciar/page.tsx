import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import ReportForm from "@/components/reports/report-form";
import { getCurrentUser } from "@/lib/auth/session";
import { reportFormContext } from "@/lib/reports/reporter-service";

/** SPEC-019: report a job the candidate can see. */
export default async function ReportJobPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const { id } = await params;
  const context = await reportFormContext(user.id, id);
  if (!context) notFound();
  return <CompanyShell role="CANDIDATE" active="jobs" userName={user.fullName}>
    <main className="company-content application-detail" aria-labelledby="report-title">
      <Link className="back-link" href={`/candidato/vagas/${id}`}>← Voltar à vaga</Link>
      <header className="company-page-heading"><div>
        <p className="job-card-company">{context.job.companyName}</p>
        <h1 id="report-title">{`Denunciar: ${context.job.title}`}</h1>
        <p className="muted">Use este formulário para relatar possível incompatibilidade de acessibilidade ou possível falsa inclusão nesta vaga. A moderação da plataforma analisa cada denúncia antes de qualquer consequência.</p>
      </div></header>
      {!context.eligible ? <div className="application-result" role="status">
        <h2>Denúncia disponível depois da entrevista</h2>
        <p>Você pode denunciar esta vaga depois de participar de uma entrevista concluída no processo seletivo dela. Assim a denúncia se baseia no que você viveu no processo.</p>
      </div> : context.openReportId ? <div className="application-result" role="status">
        <h2>Você já tem uma denúncia em andamento sobre esta vaga</h2>
        <p>Enquanto ela estiver em análise, não é possível registrar outra para a mesma vaga.</p>
        <p><Link className="text-link" href={`/candidato/denuncias/${context.openReportId}`}>Acompanhar a denúncia →</Link></p>
      </div> : <section className="job-detail-section"><ReportForm jobId={context.job.id} jobTitle={context.job.title} companyName={context.job.companyName} evaluations={context.evaluations} /></section>}
    </main>
  </CompanyShell>;
}
