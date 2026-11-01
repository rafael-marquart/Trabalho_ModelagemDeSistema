import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import CompatibilityDetails, { scoreText } from "@/components/candidate/compatibility-details";
import JobStatusLive from "@/components/candidate/job-status-live";
import ApplyPanel from "@/components/candidate/apply-panel";
import type { Compatibility } from "@/components/candidate/types";
import { getCurrentUser } from "@/lib/auth/session";
import { getJobDetailForCandidate } from "@/lib/jobs/detail-service";

const accessClass: Record<string, string> = { PRESENT: "access-present", ABSENT: "access-absent", NOT_INFORMED: "access-unknown" };

/** SPEC-010: job detail with declared accessibility, current status and the SPEC-007 result for the signed-in candidate. */
export default async function CandidateJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  const { id } = await params;
  const job = await getJobDetailForCandidate(user.id, id);
  if (!job) notFound();
  const result = job.compatibility as Compatibility | null;
  const complete = result?.status === "COMPLETE" && result.score !== null;
  const criteria = job.criteria;
  const hasCriteria = criteria.skills.length || criteria.experience.length || criteria.educationMinLevel || criteria.languages.length;
  const companyGroups = [...new Set(job.companyInfrastructure.items.map(item => item.category))];

  return <CompanyShell role="CANDIDATE" active="jobs" userName={user.fullName}>
    <main className="company-content job-detail" aria-labelledby="job-detail-title">
      <Link className="back-link" href="/candidato/vagas">← Voltar às vagas</Link>
      <header className="job-detail-header">
        <p className="job-card-company">{job.companyName}</p>
        <h1 id="job-detail-title">{job.title}</h1>
        <JobStatusLive key={`${job.availability.code}-${job.availability.message}`} jobId={id} initial={job.availability} />
        <dl className="job-facts">
          <div><dt>Modalidade</dt><dd>{job.modality}</dd></div>
          <div><dt>Local de trabalho</dt><dd>{job.location}</dd></div>
          <div><dt>Faixa salarial</dt><dd>{job.salary}</dd></div>
          <div><dt>Prazo de inscrição</dt><dd>{job.deadline}</dd></div>
          <div><dt>Área profissional</dt><dd>{job.professionalArea}</dd></div>
          <div><dt>Origem</dt><dd>{job.origin}</dd></div>
        </dl>
      </header>

      <div className="job-detail-layout">
        <div className="job-detail-main">
          <section className="job-detail-section" aria-labelledby="about-title">
            <h2 id="about-title">Sobre a vaga</h2>
            <h3>Descrição</h3>
            <p className="job-detail-text">{job.description}</p>
            <h3>Requisitos</h3>
            <p className="job-detail-text">{job.requirements}</p>
            <h3>Critérios técnicos usados na compatibilidade</h3>
            {hasCriteria ? <ul className="job-criteria">
              {criteria.skills.length ? <li><strong>Competências e conhecimentos:</strong> {criteria.skills.join(", ")}</li> : null}
              {criteria.experience.length ? <li><strong>Experiência:</strong> {criteria.experience.join(", ")}</li> : null}
              {criteria.educationMinLevel ? <li><strong>Escolaridade mínima:</strong> {criteria.educationMinLevel}</li> : null}
              {criteria.languages.length ? <li><strong>Idiomas:</strong> {criteria.languages.map(item => `${item.language} (${item.level} ou mais)`).join(", ")}</li> : null}
            </ul> : <p className="muted">A empresa não definiu critérios técnicos para esta vaga.</p>}
          </section>

          <section className="job-detail-section" aria-labelledby="access-title">
            <h2 id="access-title">Acessibilidade</h2>
            <h3>Declarado para esta vaga</h3>
            <ul className="access-list">
              {job.jobAccessibility.map(item => <li key={item.label} className={accessClass[item.status]}><span>{item.label}</span><strong>{item.statusLabel}</strong></li>)}
            </ul>
            <h3>Informações gerais da empresa</h3>
            <p className="muted">Descrevem a organização como um todo e não garantem que cada recurso esteja disponível no local desta vaga.</p>
            {job.companyInfrastructure.updatedAt ? companyGroups.map(group => <div key={group} className="access-group">
              <h4>{group}</h4>
              <ul className="access-list">
                {job.companyInfrastructure.items.filter(item => item.category === group).map(item => <li key={item.label} className={accessClass[item.status]}>
                  <span>{item.label}{item.note ? <span className="access-note">{item.note}</span> : null}</span><strong>{item.statusLabel}</strong>
                </li>)}
              </ul>
            </div>) : <p className="muted">A empresa ainda não informou a infraestrutura de acessibilidade.</p>}
          </section>
        </div>

        <aside className="job-detail-aside" aria-labelledby="compat-title">
          <section className={`job-action ${job.action.applied ? "job-action-applied" : job.action.allowed ? "job-action-allowed" : "job-action-blocked"}`} aria-labelledby="action-title">
            <h2 id="action-title">{job.action.applied ? "Você já se candidatou" : job.action.allowed ? "Você pode se candidatar" : "Candidatura não disponível"}</h2>
            <p>{job.action.message}</p>
            {job.action.allowed ? <ApplyPanel jobId={id} jobTitle={job.title} companyName={job.companyName} score={result?.score ?? null} /> : null}
          </section>
          <section className="job-detail-section">
            <h2 id="compat-title">Compatibilidade com você</h2>
            {result ? <>
              <div className={`score-ring score-ring-static ${complete ? "score-ring-complete" : "score-ring-pending"}`} style={complete ? { ["--score" as string]: `${result.score}` } as React.CSSProperties : undefined} aria-hidden="true">
                <span className={`score-ring-value${complete && (result.score ?? 0) >= 100 ? " score-ring-value-long" : ""}`}>{complete ? `${result.score}%` : result.status === "INCOMPATIBLE" ? "✕" : "?"}</span>
              </div>
              <p className="visually-hidden">Compatibilidade: {scoreText(result)}</p>
              {job.compatibilityFromApplication ? <p className="muted compat-source">{`Resultado registrado na sua candidatura, em ${new Date(job.compatibilityFromApplication).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}. Como a vaga não está aberta, ele não é recalculado.`}</p> : null}
              <CompatibilityDetails result={result} />
            </> : <p className="muted">A compatibilidade é calculada para vagas abertas e fica disponível depois do encerramento para quem se candidatou.</p>}
          </section>
        </aside>
      </div>
    </main>
  </CompanyShell>;
}
