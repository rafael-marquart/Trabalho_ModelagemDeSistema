import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import CancelApplication from "@/components/candidate/cancel-application";
import CancelResult from "@/components/candidate/cancel-result";
import HideApplication from "@/components/candidate/hide-application";
import InterviewEvaluation from "@/components/candidate/interview-evaluation";
import { interviewDateTime } from "@/lib/interviews/format";
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

      {application.interviews.length ? <section className="job-detail-section interview-panel" aria-labelledby="interview-title">
        <h2 id="interview-title">Entrevista</h2>
        {application.interviews.map((interview) => <div key={interview.id} className="interview-current">
          <p><span className={`status-pill ${interview.status === "SCHEDULED" ? "status-pending" : interview.status === "COMPLETED" ? "status-active" : "status-muted"}`}>{`Entrevista ${interview.statusLabel.toLocaleLowerCase("pt-BR")}`}</span></p>
          <dl className="interview-facts">
            <div><dt>Quando</dt><dd>{`${interviewDateTime(interview.scheduledAt)} (horário de Brasília)`}</dd></div>
            <div><dt>Modalidade</dt><dd>{interview.modalityLabel}</dd></div>
            {interview.status === "SCHEDULED" ? <>
              <div><dt>{interview.modality === "ONLINE" ? "Link" : "Local"}</dt><dd className="interview-place">{interview.modality === "ONLINE" && /^https?:\/\//i.test(interview.locationOrLink)
                ? <a href={interview.locationOrLink} target="_blank" rel="noopener noreferrer">{interview.locationOrLink}</a> : interview.locationOrLink}</dd></div>
              <div><dt>Recursos de acessibilidade previstos</dt><dd>{interview.accessibilityResources || "A empresa não informou"}</dd></div>
            </> : null}
          </dl>
          {interview.evaluation?.kind === "OPEN" ? <InterviewEvaluation interviewId={interview.id} deadline={interview.evaluation.deadline} />
            : interview.evaluation?.kind === "DONE" ? <div className="evaluation-done">
              <h3>Sua avaliação</h3>
              <dl className="evaluation-summary">
                <dt>Acessibilidade</dt><dd>{`${interview.evaluation.accessibilityRating} de 5 estrelas`}</dd>
                <dt>Postura inclusiva</dt><dd>{`${interview.evaluation.inclusionRating} de 5 estrelas`}</dd>
                <dt>Comentário</dt><dd>{interview.evaluation.comment || "Sem comentário"}</dd>
              </dl>
              <p className="muted">{`Enviada em ${dateOnly(interview.evaluation.submittedAt)}. A avaliação não pode ser alterada.`}</p>
            </div>
            : interview.evaluation?.kind === "EXPIRED" ? <p className="muted">{`O prazo para avaliar esta entrevista terminou em ${dateOnly(interview.evaluation.deadline)}.`}</p> : null}
        </div>)}
      </section> : null}

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

      {application.canHide ? <section className="job-detail-section hide-application" aria-labelledby="hide-title">
        <h2 id="hide-title">Remover da lista</h2>
        <p className="muted">Esta candidatura está encerrada. Você pode tirá-la de Minhas candidaturas sem esperar os 60 dias; nada é apagado.</p>
        <HideApplication applicationId={application.id} jobTitle={job.title} afterHref="/candidato/candidaturas?removida=1" />
      </section> : null}

      {application.canCancel ? <CancelApplication applicationId={application.id} jobTitle={job.title} jobClosed={job.status === "CLOSED"} /> : null}
    </main>
  </CompanyShell>;
}
