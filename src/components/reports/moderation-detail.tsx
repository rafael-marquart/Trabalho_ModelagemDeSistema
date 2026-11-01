"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { infrastructureItems, statusLabels as accessStatusLabels } from "@/lib/company-infrastructure/items";

type Detail = {
  id: string; createdAt: string; dueAt: string; overdue: boolean; categoryLabel: string; status: string; statusLabel: string;
  highPriority: boolean; reporterFlaggedRisk: boolean; description: string; evidence: string | null; extensionReason: string | null;
  companyRequest: string | null; companyResponse: string | null; companyRespondedAt: string | null;
  decision: string | null; decisionLabel: string | null; reporterSummary: string | null; justification: string | null; measures: string | null; concludedAt: string | null;
  job: { id: string; title: string; status: string; companyName: string; accessibility: Record<string, string> | null } | null;
  evaluation: { accessibilityRating: number; inclusionRating: number; submittedAt: string } | null;
  history: { at: string; kind: string; from: string | null; to: string | null; actor: string; note: string | null }[];
};
const when = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(", ", " às ");
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const kindLabels: Record<string, string> = {
  SUBMITTED: "Denúncia registrada", ANALYSIS_STARTED: "Análise iniciada", INFO_REQUESTED: "Informações pedidas à empresa (prazo ampliado)",
  COMPANY_RESPONDED: "Empresa respondeu", CONCLUDED: "Denúncia concluída", PRIORITY_RAISED: "Prioridade alta definida", PRIORITY_LOWERED: "Prioridade alta removida"
};
const decisions = [
  { value: "PROCEDENTE", label: "Procedente" }, { value: "PARCIALMENTE_PROCEDENTE", label: "Parcialmente procedente" },
  { value: "IMPROCEDENTE", label: "Improcedente" }, { value: "INCONCLUSIVA", label: "Inconclusiva" }
];

function Field({ id, label, hint, value, onChange, error, rows = 3, max }: { id: string; label: string; hint?: string; value: string; onChange: (value: string) => void; error?: string; rows?: number; max: number }) {
  return <div>
    <label htmlFor={id}><span className="profile-section-title">{label}</span></label>
    <textarea id={id} rows={rows} maxLength={max} value={value} onChange={(event) => onChange(event.target.value)} aria-invalid={Boolean(error)} aria-describedby={hint ? `${id}-hint` : undefined} />
    {hint ? <span className="muted" id={`${id}-hint`}>{hint}</span> : null}
    {error ? <span className="field-error">{error}</span> : null}
  </div>;
}

/**
 * SPEC-020: one report for the platform administrator — context for the analysis (OPEN-078), the steps (start, priority,
 * ask the company, conclude) and the moderation history. Nothing here changes the job or any rating (OPEN-079).
 */
export default function ModerationDetail({ reportId }: { reportId: string }) {
  const [data, setData] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"none" | "request" | "conclude">("none");
  const [request, setRequest] = useState({ pointsForCompany: "", extensionReason: "" });
  const [decision, setDecision] = useState({ decision: "", reporterSummary: "", justification: "", measures: "" });
  const noticeRef = useRef<HTMLParagraphElement>(null);
  const ids = { points: useId(), reason: useId(), decision: useId(), summary: useId(), justification: useId(), measures: useId() };

  const load = useCallback(async () => {
    const response = await fetch(`/api/admin/denuncias/${reportId}`, { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.message || "Não foi possível carregar a denúncia."); return; }
    setData(body.report);
  }, [reportId]);
  useEffect(() => { load().catch(() => setError("Não foi possível conectar ao serviço.")); }, [load]);

  async function act(body: Record<string, unknown>, success: string) {
    setBusy(true); setError(""); setIssues({});
    try {
      const response = await fetch(`/api/admin/denuncias/${reportId}/acao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setError(payload.message || "Não foi possível salvar."); setIssues(payload.issues ?? {}); return; }
      setMode("none"); setNotice(success); await load();
      setTimeout(() => noticeRef.current?.focus(), 0);
    } catch { setError("Não foi possível conectar ao serviço."); }
    finally { setBusy(false); }
  }

  const upheld = decision.decision === "PROCEDENTE" || decision.decision === "PARCIALMENTE_PROCEDENTE";
  return <main id="conteudo" className="company-content application-detail" aria-labelledby="moderation-title">
    <Link className="back-link" href="/admin/denuncias">← Voltar à fila</Link>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {notice ? <p ref={noticeRef} tabIndex={-1} className="form-success" role="status">{notice}</p> : null}
    {!data && !error ? <p className="muted" role="status">Carregando denúncia…</p> : null}
    {data ? <>
      <header className="company-page-heading"><div>
        <p className="job-card-company">{data.job ? `${data.job.companyName} · ${data.job.title}` : "Vaga"}</p>
        <h1 id="moderation-title">{data.categoryLabel}</h1>
        <p className="job-detail-status">
          <span className="status-pill status-pending">{data.decisionLabel ? `${data.statusLabel}: ${data.decisionLabel}` : data.statusLabel}</span>
          {data.highPriority ? <span className="moderation-flag"> Prioridade alta</span> : null}
          <span>{` Recebida em ${when(data.createdAt)} · meta ${day(data.dueAt)}`}</span>
          {data.overdue ? <span className="moderation-flag"> · meta vencida</span> : null}
        </p>
      </div></header>

      <div className="moderation-columns">
        <div>
          <section className="job-detail-section" aria-labelledby="report-content-title">
            <h2 id="report-content-title">Denúncia</h2>
            {data.reporterFlaggedRisk ? <p className="compat-alert">O denunciante indicou risco atual à segurança ou à acessibilidade.</p> : null}
            <h3>Descrição</h3><p className="report-text">{data.description}</p>
            <h3>Evidências</h3><p className="report-text">{data.evidence || "Nenhuma informada."}</p>
            {data.evaluation ? <><h3>Avaliação vinculada</h3><p>{`Acessibilidade ${data.evaluation.accessibilityRating}/5 · Postura inclusiva ${data.evaluation.inclusionRating}/5 · enviada em ${day(data.evaluation.submittedAt)}`}</p></> : null}
            <p className="muted">A identidade do denunciante não é necessária para a análise e não é mostrada à empresa.</p>
          </section>
          {data.companyRequest ? <section className="job-detail-section" aria-labelledby="company-title">
            <h2 id="company-title">Esclarecimentos da empresa</h2>
            <h3>Pontos enviados à empresa</h3><p className="report-text">{data.companyRequest}</p>
            {data.extensionReason ? <p className="muted">{`Motivo da ampliação do prazo: ${data.extensionReason}`}</p> : null}
            <h3>Resposta</h3><p className="report-text">{data.companyResponse ? `${data.companyResponse}` : "A empresa ainda não respondeu."}</p>
            {data.companyRespondedAt ? <p className="muted">{`Respondida em ${when(data.companyRespondedAt)}`}</p> : null}
          </section> : null}
          {data.status === "CONCLUIDA" ? <section className="job-detail-section" aria-labelledby="decision-title">
            <h2 id="decision-title">Decisão</h2>
            <p><strong>{data.decisionLabel}</strong>{data.concludedAt ? ` · ${when(data.concludedAt)}` : ""}</p>
            <h3>Para o denunciante</h3><p className="report-text">{data.reporterSummary}</p>
            <h3>Justificativa (para a empresa)</h3><p className="report-text">{data.justification}</p>
            <h3>Medidas</h3><p className="report-text">{data.measures || "Nenhuma: encerrada sem penalidade."}</p>
          </section> : null}
        </div>
        <aside>
          <section className="job-detail-section" aria-labelledby="job-title">
            <h2 id="job-title">Vaga</h2>
            {data.job ? <>
              <p><strong>{data.job.title}</strong>{` · ${data.job.status === "OPEN" ? "aberta" : data.job.status === "PAUSED" ? "pausada" : "encerrada"}`}</p>
              <h3>Acessibilidade declarada</h3>
              <ul className="access-list">{infrastructureItems.map((item) => <li key={item.code}><span>{item.label}</span><strong>{accessStatusLabels[(data.job?.accessibility?.[item.code] ?? "NOT_INFORMED") as keyof typeof accessStatusLabels] ?? "Não informado"}</strong></li>)}</ul>
            </> : <p className="muted">Vaga não encontrada.</p>}
          </section>
          <section className="job-detail-section" aria-labelledby="history-title">
            <h2 id="history-title">Histórico de moderação</h2>
            <ol className="stage-history">{data.history.map((event, index) => <li key={index}>
              <strong>{kindLabels[event.kind] ?? event.kind}</strong>
              <span>{`${when(event.at)} · ${event.actor}`}</span>
              {event.note ? <span className="stage-note">{event.note}</span> : null}
            </li>)}</ol>
          </section>
        </aside>
      </div>

      {data.status !== "CONCLUIDA" ? <section className="job-detail-section" aria-labelledby="actions-title">
        <h2 id="actions-title">Moderação</h2>
        <p className="muted">A denúncia não altera a vaga nem avaliações. Medidas só valem para irregularidades confirmadas e são comunicadas à empresa.</p>
        <div className="apply-actions">
          {data.status === "RECEBIDA" ? <button type="button" className="primary-button" disabled={busy} onClick={() => act({ action: "start" }, "Análise iniciada. O denunciante foi avisado.")}>Assumir análise</button> : null}
          <button type="button" className="secondary-button" disabled={busy} onClick={() => act({ action: "priority", highPriority: !data.highPriority }, data.highPriority ? "Prioridade alta removida." : "Prioridade alta definida.")}>
            {data.highPriority ? "Remover prioridade alta" : "Marcar prioridade alta"}</button>
          {data.status === "EM_ANALISE" ? <>
            <button type="button" className="secondary-button" disabled={busy} onClick={() => setMode("request")}>Pedir informações à empresa</button>
            <button type="button" className="primary-button" disabled={busy} onClick={() => setMode("conclude")}>Registrar decisão</button>
          </> : null}
        </div>
        {data.status === "AGUARDANDO_INFORMACOES" ? <p className="muted">Aguardando a resposta da empresa. A decisão pode ser registrada depois que ela responder.</p> : null}

        {mode === "request" ? <form className="moderation-form" onSubmit={(event) => { event.preventDefault(); void act({ action: "request", ...request }, "Pedido enviado à empresa. O denunciante foi avisado da demora."); }}>
          <h3>Pedir informações à empresa</h3>
          <Field id={ids.points} label="Pontos que a empresa deve responder" hint="A empresa vê só este texto: não inclua o nome nem dados do denunciante." rows={4} max={2000}
            value={request.pointsForCompany} onChange={(value) => setRequest({ ...request, pointsForCompany: value })} error={issues.pointsForCompany} />
          <Field id={ids.reason} label="Motivo da ampliação do prazo" hint="Fica no histórico; o denunciante é avisado de que a análise pode demorar mais." max={500}
            value={request.extensionReason} onChange={(value) => setRequest({ ...request, extensionReason: value })} error={issues.extensionReason} />
          <div className="apply-actions">
            <button type="submit" className="primary-button" disabled={busy}>{busy ? "Enviando…" : "Enviar pedido"}</button>
            <button type="button" className="secondary-button" disabled={busy} onClick={() => setMode("none")}>Voltar</button>
          </div>
        </form> : null}

        {mode === "conclude" ? <form className="moderation-form" onSubmit={(event) => { event.preventDefault(); void act({ action: "conclude", ...decision, ...(decision.measures.trim() ? {} : { measures: undefined }) }, "Decisão registrada. O denunciante e a empresa foram avisados."); }}>
          <h3>Registrar decisão</h3>
          <div>
            <label htmlFor={ids.decision}><span className="profile-section-title">Conclusão</span></label>
            <select id={ids.decision} value={decision.decision} onChange={(event) => setDecision({ ...decision, decision: event.target.value, ...(event.target.value === "IMPROCEDENTE" || event.target.value === "INCONCLUSIVA" ? { measures: "" } : {}) })} aria-invalid={Boolean(issues.decision)}>
              <option value="">Escolha</option>{decisions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
            {issues.decision ? <span className="field-error">{issues.decision}</span> : null}
          </div>
          <Field id={ids.summary} label="Justificativa resumida para o denunciante" hint="Sem detalhes internos da investigação." max={1000}
            value={decision.reporterSummary} onChange={(value) => setDecision({ ...decision, reporterSummary: value })} error={issues.reporterSummary} />
          <Field id={ids.justification} label="Justificativa da decisão (vai para a empresa)" hint="Sem o nome ou dados do denunciante." rows={4} max={3000}
            value={decision.justification} onChange={(value) => setDecision({ ...decision, justification: value })} error={issues.justification} />
          {upheld ? <Field id={ids.measures} label="Medidas administrativas" hint="Somente sobre as irregularidades confirmadas. São registradas e comunicadas à empresa; nada é alterado automaticamente na vaga ou nas avaliações." rows={3} max={2000}
            value={decision.measures} onChange={(value) => setDecision({ ...decision, measures: value })} error={issues.measures} />
            : decision.decision ? <p className="muted">Improcedente ou inconclusiva: encerra sem penalidade. Se faltar informação, use “Pedir informações à empresa” antes de decidir.</p> : null}
          <div className="apply-actions">
            <button type="submit" className="primary-button" disabled={busy}>{busy ? "Salvando…" : "Registrar decisão e avisar as partes"}</button>
            <button type="button" className="secondary-button" disabled={busy} onClick={() => setMode("none")}>Voltar</button>
          </div>
        </form> : null}
      </section> : null}
    </> : null}
  </main>;
}
