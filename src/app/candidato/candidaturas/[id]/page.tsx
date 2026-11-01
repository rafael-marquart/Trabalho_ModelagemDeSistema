import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import CancelApplication from "@/components/candidate/cancel-application";
import CancelResult from "@/components/candidate/cancel-result";
import { candidatePill, dateOnly, initialsOf } from "@/components/candidate/application-format";
import { getCurrentUser } from "@/lib/auth/session";
import { getCandidateApplication } from "@/lib/applications/candidate-service";

/**
 * SPEC-012/016: one of the candidate's own applications — current state (with the job status) kept apart from the
 * history, the timeline most recent first and, when allowed, the cancellation. Someone else's application is a 404.
 */
export default async function MyApplicationDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cancelada?: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const { id } = await params;
  const { cancelada } = await searchParams;
  const application = await getCandidateApplication(user.id, id);
  if (!application) notFound();
  const { job } = application;
  const justCancelled = cancelada === "1" && application.stage === "CANCELADA";

  return <CompanyShell role="CANDIDATE" active="applications" userName={user.fullName}>
    <main className="company-content application-detail" aria-labelledby="application-title">
      <Link className="back-link" href="/candidato/candidaturas">← Voltar para minhas candidaturas</Link>
      <h1 id="application-title">Detalhe da candidatura</h1>

      {justCancelled ? <CancelResult /> : null}

      <section className="application-summary" aria-labelledby="current-state-title">
        <span className="my-application-avatar" aria-hidden="true">{initialsOf(job.companyName)}</span>
        <div className="my-application-main">
          <p className="job-card-company">{job.companyName}</p>
          <h2 className="my-application-title">{job.title}</h2>
          <p className="muted">{`Inscrição em ${dateOnly(application.appliedAt)}`}</p>
          <h3 id="current-state-title" className="visually-hidden">Situação atual</h3>
          {job.status === "CLOSED" ? <p className="application-state-note">{`A vaga foi encerrada pela empresa em ${dateOnly(job.closedAt ?? application.appliedAt)}.`}</p>
            : job.status === "PAUSED" ? <p className="application-state-note">A empresa pausou a vaga para novas inscrições; sua candidatura continua registrada.</p> : null}
          {application.historyVisibleUntil ? <p className="muted">{`O histórico desta candidatura fica disponível até ${dateOnly(application.historyVisibleUntil)}.`}</p> : null}
          <Link className="text-link" href={`/candidato/vagas/${job.id}`}>Ver a vaga</Link>
        </div>
        <span className={`status-pill ${candidatePill[application.stage] ?? "status-neutral"}`}><span className="visually-hidden">Situação atual: </span>{application.stageLabel}</span>
      </section>

      <section aria-labelledby="history-title">
        <h2 id="history-title">Histórico da candidatura</h2>
        <p className="muted">Eventos registrados, do mais recente para o mais antigo. A situação atual é a indicada acima.</p>
        {application.timeline.length ? <ol className="application-timeline">
          {application.timeline.map((event, index) => <li key={`${event.date}-${index}`}>
            <time dateTime={event.date}>{dateOnly(event.date)}</time>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <p className="timeline-stage">{`Etapa resultante: ${event.resultingStage}`}</p>
          </li>)}
        </ol> : <p className="job-empty">Ainda não há eventos registrados no histórico desta candidatura.</p>}
      </section>

      {application.canCancel ? <CancelApplication applicationId={application.id} jobTitle={job.title} /> : null}
    </main>
  </CompanyShell>;
}
