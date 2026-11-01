import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { dateOnly } from "@/components/candidate/application-format";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnReport } from "@/lib/reports/reporter-service";

const steps = [["RECEBIDA", "Recebida"], ["EM_ANALISE", "Em análise"], ["CONCLUIDA", "Concluída"]] as const;

/** SPEC-019: progress and result of one of the candidate's reports; never the internal analysis (OPEN-077/081). */
export default async function MyReportPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const { id } = await params;
  const report = await getOwnReport(user.id, id);
  if (!report) notFound();
  const reached = report.status === "CONCLUIDA" ? 2 : report.status === "RECEBIDA" ? 0 : 1;
  return <CompanyShell role="CANDIDATE" active="reports" userName={user.fullName}>
    <main className="company-content application-detail" aria-labelledby="report-title">
      <Link className="back-link" href="/candidato/denuncias">← Voltar para minhas denúncias</Link>
      <header className="company-page-heading"><div>
        <p className="job-card-company">{report.job?.companyName ?? "Empresa"}</p>
        <h1 id="report-title">{`Denúncia: ${report.job?.title ?? "vaga"}`}</h1>
        <p className="muted">{`${report.categoryLabel} · registrada em ${dateOnly(report.createdAt)}`}</p>
      </div></header>

      <section className="job-detail-section" aria-labelledby="progress-title">
        <h2 id="progress-title">Andamento</h2>
        <ol className="report-steps">
          {steps.map(([code, label], index) => <li key={code} className={index <= reached ? "report-step-done" : ""} aria-current={index === reached ? "step" : undefined}>
            <span>{label}</span>{index === 1 && report.status === "AGUARDANDO_INFORMACOES" ? <span className="muted"> — aguardando informações</span> : null}
          </li>)}
        </ol>
        <p><strong>{`Situação atual: ${report.statusLabel}.`}</strong></p>
        {report.status !== "CONCLUIDA" ? <p className="muted">{report.delayed
          ? "A moderação pediu informações adicionais. Por isso a análise pode levar mais tempo que o previsto."
          : `Meta de análise: até ${dateOnly(report.dueAt)} (5 dias úteis). É uma meta, não uma garantia.`}</p> : null}
        <p className="muted">A denúncia não muda nada na vaga até a decisão da moderação. A empresa não recebe o seu nome nem os seus dados.</p>
      </section>

      {report.status === "CONCLUIDA" ? <section className="job-detail-section" aria-labelledby="result-title">
        <h2 id="result-title">Resultado</h2>
        <p><strong>{report.decisionLabel}</strong>{report.concludedAt ? ` · concluída em ${dateOnly(report.concludedAt)}` : ""}</p>
        {report.summary ? <p>{report.summary}</p> : null}
      </section> : null}

      <section className="job-detail-section" aria-labelledby="sent-title">
        <h2 id="sent-title">O que você enviou</h2>
        <p className="report-text">{report.description}</p>
        {report.evidence ? <><h3>Evidências</h3><p className="report-text">{report.evidence}</p></> : null}
      </section>
    </main>
  </CompanyShell>;
}
