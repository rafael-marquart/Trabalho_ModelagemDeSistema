"use client";

import React, { useCallback, useEffect, useState } from "react";

type Query = { phrase: string; attempts: number; status: "OK" | "ERROR"; httpStatus: number | null; results: number; error: string | null };
type Run = {
  id: string; trigger: string; status: "RUNNING" | "SUCCEEDED" | "PARTIAL" | "FAILED"; startedAt: string; finishedAt: string | null;
  callsMade: number; callLimit: number; received: number; processed: number; rejected: number; duplicates: number; failed: number;
  error: string | null; queries: Query[];
};
type Overview = {
  configured: boolean; scheduleEnabled: boolean; llm: boolean; phrases: string[];
  callBudget: number; usedCalls: number; remainingCalls: number; maxCallsPerRun: number; runs: Run[];
};
type RecordRow = { id: string; phrase: string; externalId: string | null; title: string; result: "PROCESSED" | "REJECTED" | "DUPLICATE" | "FAILED"; reason: string | null; usedLlm: boolean; jobId: string | null };

const statusLabels: Record<Run["status"], string> = { RUNNING: "Em andamento", SUCCEEDED: "Concluída", PARTIAL: "Concluída com falhas", FAILED: "Malsucedida" };
const statusClass: Record<Run["status"], string> = { RUNNING: "status-pending", SUCCEEDED: "status-active", PARTIAL: "status-pending", FAILED: "status-danger" };
const resultLabels: Record<RecordRow["result"], string> = { PROCESSED: "Publicada", REJECTED: "Rejeitada", DUPLICATE: "Duplicada", FAILED: "Falha" };
const dateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

function RunRecords({ runId }: { runId: string }) {
  const [records, setRecords] = useState<RecordRow[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(`/api/admin/vagas-externas/${runId}`, { cache: "no-store" })
      .then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message); setRecords(body.records); })
      .catch((caught) => setError(caught instanceof Error && caught.message ? caught.message : "Não foi possível carregar os registros."));
  }, [runId]);
  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!records) return <p className="muted" role="status">Carregando registros…</p>;
  if (!records.length) return <p className="muted">Nenhum registro recebido nesta execução.</p>;
  return <ul className="import-records">
    {records.map((record) => <li key={record.id}>
      <span className={`status-pill ${record.result === "PROCESSED" ? "status-active" : record.result === "FAILED" ? "status-danger" : "status-pending"}`}>{resultLabels[record.result]}</span>
      <strong>{record.title || "Sem título"}</strong>
      <span className="muted">Frase “{record.phrase}”{record.externalId ? ` · anúncio ${record.externalId}` : ""}{record.usedLlm ? " · LLM consultado" : ""}</span>
      {record.reason ? <span>{record.reason}</span> : null}
    </li>)}
  </ul>;
}

/** SPEC-006: test batch of the Adzuna import and the traceability of every run (OPEN-027). */
export default function ExternalImports() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/vagas-externas", { cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.message);
      setOverview(body); setError("");
    } catch (caught) { setError(caught instanceof Error && caught.message ? caught.message : "Não foi possível carregar as importações."); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function run() {
    setBusy(true); setMessage(""); setError("");
    try {
      const response = await fetch("/api/admin/vagas-externas", { method: "POST" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.message || "Não foi possível executar a importação."); return; }
      const summary = body.run as Run;
      setMessage(`${statusLabels[summary.status]}: ${summary.processed} vagas publicadas, ${summary.rejected} rejeitadas, ${summary.duplicates} duplicadas e ${summary.failed} falhas, em ${summary.callsMade} chamadas.`);
      setOpen(summary.id);
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setBusy(false); await load(); }
  }

  if (!overview) return error ? <p className="form-error" role="alert">{error}</p> : <p className="muted" role="status">Carregando importações…</p>;
  const canRun = overview.configured && overview.remainingCalls > 0 && !busy;
  return <>
    <section className="profile-section" aria-labelledby="batch-title">
      <h2 id="batch-title">Lote de teste</h2>
      <dl className="account-data import-facts">
        <div><dt>Chamadas ao Adzuna</dt><dd>{overview.usedCalls} de {overview.callBudget} usadas · restam {overview.remainingCalls}</dd></div>
        <div><dt>Por execução</dt><dd>até {Math.min(overview.maxCallsPerRun, overview.remainingCalls)} chamadas, uma por frase</dd></div>
        <div><dt>Frases de busca</dt><dd>{overview.phrases.join(" · ")}</dd></div>
        <div><dt>Credenciais</dt><dd>{overview.configured ? "Configuradas no servidor" : "Não configuradas (ADZUNA_APP_ID e ADZUNA_APP_KEY)"}</dd></div>
        <div><dt>Complemento por LLM</dt><dd>{overview.llm ? "Ligado" : "Desligado: só os dados da fonte são usados"}</dd></div>
        <div><dt>Coleta diária</dt><dd>{overview.scheduleEnabled ? "Ligada" : "Desligada até a autorização de uso contínuo"}</dd></div>
      </dl>
      <p className="muted">Cada vaga só é publicada com título, descrição, empresa contratante, localidade e link do anúncio original. As informações de acessibilidade ficam como “não informado”.</p>
      <div className="apply-actions">
        <button type="button" className="primary-button" onClick={() => void run()} disabled={!canRun}>{busy ? "Importando…" : "Executar lote de teste"}</button>
      </div>
      {message ? <p className="form-success" role="status">{message}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>

    <section className="profile-section" aria-labelledby="runs-title">
      <h2 id="runs-title">Execuções</h2>
      {overview.runs.length ? <ul className="import-runs">
        {overview.runs.map((item) => <li key={item.id} className="import-run">
          <div className="import-run-head">
            <span className={`status-pill ${statusClass[item.status]}`}>{statusLabels[item.status]}</span>
            <strong>{dateTime(item.startedAt)}</strong>
            <span className="muted">{item.trigger === "SCHEDULE" ? "Agendada" : "Iniciada pelo administrador"} · {item.callsMade} de {item.callLimit} chamadas</span>
          </div>
          <p>{item.received} recebidos: {item.processed} publicadas, {item.rejected} rejeitadas, {item.duplicates} duplicadas, {item.failed} falhas.</p>
          {item.error ? <p className="form-error">{item.error}</p> : null}
          {item.queries.length ? <ul className="import-queries">{item.queries.map((query, index) => <li key={`${query.phrase}-${index}`}>
            “{query.phrase}”: {query.status === "OK" ? `${query.results} resultados` : query.error}{query.attempts > 1 ? ` (${query.attempts} tentativas)` : ""}
          </li>)}</ul> : null}
          <button type="button" className="link-button" aria-expanded={open === item.id} onClick={() => setOpen(open === item.id ? null : item.id)}>
            {open === item.id ? "Ocultar registros" : "Ver registros"}
          </button>
          {open === item.id ? <RunRecords runId={item.id} /> : null}
        </li>)}
      </ul> : <p className="job-empty">Nenhuma importação executada.</p>}
    </section>
  </>;
}
