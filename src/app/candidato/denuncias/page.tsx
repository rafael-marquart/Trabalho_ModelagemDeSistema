import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { dateOnly } from "@/components/candidate/application-format";
import { getCurrentUser } from "@/lib/auth/session";
import { listOwnReports } from "@/lib/reports/reporter-service";
import { reportPill } from "@/lib/reports/labels";

/** SPEC-019: the candidate's own reports, with progress and result (OPEN-077). */
export default async function MyReportsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const reports = await listOwnReports(user.id);
  return <CompanyShell role="CANDIDATE" active="reports" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="reports-title">
      <header className="company-page-heading"><div>
        <h1 id="reports-title">Minhas denúncias</h1>
        <p className="muted">Acompanhe o andamento e o resultado das denúncias que você registrou. Para denunciar, abra a vaga e use “Denunciar esta vaga”.</p>
      </div></header>
      {reports.length ? <ul className="my-applications-list">
        {reports.map((report) => <li key={report.id} className="my-application-card report-card">
          <div className="my-application-main">
            <p className="job-card-company">{report.job?.companyName ?? "Empresa"}</p>
            <h2 className="my-application-title">{report.job?.title ?? "Vaga"}</h2>
            <p className="muted">{`${report.categoryLabel} · registrada em ${dateOnly(report.createdAt)}`}</p>
          </div>
          <div className="my-application-side">
            <span className={`status-pill ${reportPill[report.status]}`}>{report.decisionLabel ? `${report.statusLabel}: ${report.decisionLabel}` : report.statusLabel}</span>
            <Link className="text-link" href={`/candidato/denuncias/${report.id}`} aria-label={`Ver denúncia sobre ${report.job?.title ?? "a vaga"}`}>Ver denúncia →</Link>
          </div>
        </li>)}
      </ul> : <p className="job-empty">Você não registrou denúncias.</p>}
    </main>
  </CompanyShell>;
}
