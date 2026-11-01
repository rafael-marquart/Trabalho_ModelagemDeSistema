"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { stagePill } from "./funnel-board";
import InterviewPanel, { type Interview } from "./interview-panel";

type Detail = {
  id: string; job: { id: string; title: string }; candidate: { fullName: string; email: string }; appliedAt: string;
  stage: string; stageLabel: string; score: number | null; dimensions: { code: "A" | "T" | "D"; status: string; score: number | null }[];
  profile: {
    education: { level: string; course: string; institution: string; status: string }[]; experience: { role: string; company: string; period: string }[];
    languages: { language: string; level: string }[]; courses: string[]; certifications: string[]; links: string[];
  };
  accessibility: { declaration: string; needs: string[]; essentialResources: string[] };
  history: { at: string; from: string | null; to: string; kind: string; actor: string; note: string | null }[];
  nextStages: { stage: string; label: string }[]; blockingIssues: string[];
  interviews: Interview[]; canScheduleInterview: boolean;
};

const dimensionNames = { A: "Acessibilidade", T: "Perfil técnico", D: "Modalidade e deslocamento" } as const;
const actionLabels: Record<string, string> = { TRIAGEM: "Mover para Triagem", ENTREVISTA: "Mover para Entrevista", FINALISTA: "Mover para Finalista", CONTRATADO: "Registrar contratação", RECUSADA: "Recusar candidatura" };
const dateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(", ", " às ");
const dimensionValue = (item: Detail["dimensions"][number]) => item.status === "EVALUATED" ? `${Math.round(item.score ?? 0)}/100` : item.status === "NOT_APPLICABLE" ? "Não se aplica" : "Dados insuficientes";

/**
 * SPEC-013: one application for the company — data needed for the process, the compatibility registered at application
 * time, the stage history and the moves allowed from the current stage (RB-39). The server validates every move again.
 */
export default function ApplicationDetail({ basePath, jobId, applicationId }: { basePath: string; jobId: string; applicationId: string }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [target, setTarget] = useState<{ stage: string; label: string } | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const load = useCallback(async () => {
    const response = await fetch(`/api/candidaturas/${applicationId}`, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.message || "Não foi possível carregar a candidatura."); return; }
    setData(body.application as Detail);
  }, [applicationId]);

  useEffect(() => { load().catch(() => setError("Não foi possível conectar ao serviço. Atualize a página.")); }, [load]);

  async function move() {
    if (!target) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/candidaturas/${applicationId}/etapa`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toStage: target.stage, ...(note.trim() ? { note: note.trim() } : {}) })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.message || "Não foi possível alterar a etapa."); }
      else { setNotice(`Etapa alterada para ${target.label}.`); setTarget(null); setNote(""); setTimeout(() => noticeRef.current?.focus(), 0); }
      await load();
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setBusy(false); }
  }

  return <main className="company-content application-detail" aria-labelledby="application-title">
    <Link className="back-link" href={`${basePath}/${jobId}/candidaturas`}>← Voltar às candidaturas</Link>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {notice ? <p ref={noticeRef} tabIndex={-1} className="form-success" role="status">{notice}</p> : null}
    {!data && !error ? <p className="muted" role="status">Carregando candidatura…</p> : null}
    {data ? <>
      <header className="company-page-heading">
        <p className="job-card-company">{data.job.title}</p>
        <h1 id="application-title">{data.candidate.fullName}</h1>
        <p className="job-detail-status"><span className={`status-pill ${stagePill[data.stage]}`}>{`Etapa: ${data.stageLabel}`}</span> <span>{`Inscrição em ${dateTime(data.appliedAt)} · ${data.candidate.email}`}</span></p>
      </header>

      <section className="job-detail-section application-actions" aria-labelledby="move-title">
        <h2 id="move-title">Mover no processo</h2>
        {data.blockingIssues.length ? <p className="compat-alert">{`Não é possível avançar: ${data.blockingIssues.join("; ")}`}</p> : null}
        {data.nextStages.length === 0 ? <p className="muted">{`Esta candidatura está em uma etapa final (${data.stageLabel}) e não pode ser movida.`}</p> : !target ?
          <div className="apply-actions">{data.nextStages.map(next => <button key={next.stage} type="button" className={next.stage === "RECUSADA" ? "secondary-button" : "primary-button"}
            onClick={() => { setTarget(next); setTimeout(() => confirmRef.current?.focus(), 0); }}>{actionLabels[next.stage] ?? `Mover para ${next.label}`}</button>)}</div> :
          <div className="apply-confirm">
            <p>{target.stage === "RECUSADA" ? `Recusar a candidatura de ${data.candidate.fullName}? A decisão é final e fica no histórico.` : target.stage === "CONTRATADO" ? `Registrar a contratação de ${data.candidate.fullName}? A decisão é final e fica no histórico.` : `Mover ${data.candidate.fullName} de ${data.stageLabel} para ${target.label}?`}</p>
            <label className="job-field"><span className="profile-section-title">Observação (opcional)</span>
              <textarea rows={3} maxLength={500} value={note} onChange={event => setNote(event.target.value)} placeholder="Fica registrada no histórico desta candidatura" />
            </label>
            <div className="apply-actions">
              <button ref={confirmRef} type="button" className="primary-button" disabled={busy} onClick={move}>{busy ? "Salvando…" : "Confirmar"}</button>
              <button type="button" className="secondary-button" disabled={busy} onClick={() => { setTarget(null); setNote(""); }}>Voltar</button>
            </div>
          </div>}
      </section>

      {data.canScheduleInterview || data.interviews.length ? <InterviewPanel applicationId={applicationId} interviews={data.interviews} canSchedule={data.canScheduleInterview}
        candidateEssentials={data.accessibility.essentialResources}
        onChanged={async (message) => { setNotice(message); await load(); setTimeout(() => noticeRef.current?.focus(), 0); }} /> : null}

      <div className="job-detail-layout">
        <div className="job-detail-main">
          <section className="job-detail-section" aria-labelledby="profile-title">
            <h2 id="profile-title">Perfil profissional</h2>
            <h3>Formação</h3>
            {data.profile.education.length ? <ul className="job-criteria">{data.profile.education.map((item, index) => <li key={index}>{[item.level, item.course, item.institution, item.status].filter(Boolean).join(" · ")}</li>)}</ul> : <p className="muted">Não informada</p>}
            <h3>Experiência</h3>
            {data.profile.experience.length ? <ul className="job-criteria">{data.profile.experience.map((item, index) => <li key={index}>{[item.role, item.company, item.period].filter(Boolean).join(" · ")}</li>)}</ul> : <p className="muted">Não informada</p>}
            <h3>Idiomas</h3>
            {data.profile.languages.length ? <ul className="job-criteria">{data.profile.languages.map((item, index) => <li key={index}>{item.level ? `${item.language} (${item.level})` : item.language}</li>)}</ul> : <p className="muted">Não informados</p>}
            {data.profile.courses.length ? <><h3>Cursos</h3><ul className="job-criteria">{data.profile.courses.map((item, index) => <li key={index}>{item}</li>)}</ul></> : null}
            {data.profile.certifications.length ? <><h3>Certificações</h3><ul className="job-criteria">{data.profile.certifications.map((item, index) => <li key={index}>{item}</li>)}</ul></> : null}
            {data.profile.links.length ? <><h3>Links profissionais</h3><ul className="job-criteria">{data.profile.links.map((item, index) => <li key={index}><a href={item} target="_blank" rel="noopener noreferrer">{item}</a></li>)}</ul></> : null}
          </section>
          <section className="job-detail-section" aria-labelledby="access-title">
            <h2 id="access-title">Acessibilidade para o processo</h2>
            <p className="muted">Informações declaradas pelo candidato para que a empresa prepare o processo seletivo.</p>
            {data.accessibility.declaration === "NO_NEEDS_DECLARED" ? <p>O candidato declarou não ter necessidades de acessibilidade.</p>
              : data.accessibility.declaration === "NOT_INFORMED" ? <p className="muted">Não informado pelo candidato.</p> : <>
                <h3>Necessidades declaradas</h3>
                {data.accessibility.needs.length ? <ul className="job-criteria">{data.accessibility.needs.map((item, index) => <li key={index}>{item}</li>)}</ul> : <p className="muted">Nenhuma opção do catálogo.</p>}
              </>}
            {data.accessibility.essentialResources.length ? <><h3>Recursos indispensáveis</h3><ul className="job-criteria">{data.accessibility.essentialResources.map((item, index) => <li key={index}>{item}</li>)}</ul></> : null}
          </section>
        </div>
        <aside className="job-detail-aside">
          <section className="job-detail-section" aria-labelledby="score-title">
            <h2 id="score-title">Compatibilidade na inscrição</h2>
            <p className="score-dialog-total"><strong>{data.score !== null ? `${data.score}%` : "Sem score"}</strong>{data.score !== null ? " de compatibilidade" : " — faltavam dados para calcular"}</p>
            <ul className="access-list">{data.dimensions.map(item => <li key={item.code}><span>{dimensionNames[item.code]}</span><strong>{dimensionValue(item)}</strong></li>)}</ul>
          </section>
          <section className="job-detail-section" aria-labelledby="history-title">
            <h2 id="history-title">Histórico</h2>
            <ol className="stage-history">{data.history.map((event, index) => <li key={index}>
              <strong>{event.from ? `${event.from} → ${event.to}` : event.to}</strong>
              <span>{`${event.kind} · ${dateTime(event.at)} · ${event.actor}`}</span>
              {event.note ? <span className="stage-note">{event.note}</span> : null}
            </li>)}</ol>
          </section>
        </aside>
      </div>
    </> : null}
  </main>;
}
