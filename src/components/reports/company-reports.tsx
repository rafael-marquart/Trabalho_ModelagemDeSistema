"use client";

import React, { useCallback, useEffect, useId, useState } from "react";

type Row = {
  id: string; createdAt: string; categoryLabel: string; status: string; statusLabel: string; jobTitle: string;
  request: string | null; response: string | null; respondedAt: string | null; canRespond: boolean;
  decisionLabel: string | null; justification: string | null; measures: string | null; concludedAt: string | null;
};
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function Respond({ report, onDone }: { report: Row; onDone: () => Promise<void> }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const id = useId();
  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (text.trim().length < 10) { setError("Escreva a resposta com pelo menos 10 caracteres."); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/empresa/denuncias/${report.id}/resposta`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ response: text }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.issues?.response || body.message || "Não foi possível enviar a resposta."); return; }
      await onDone();
    } catch { setError("Não foi possível conectar ao serviço."); }
    finally { setBusy(false); }
  }
  return <form className="moderation-form" onSubmit={send} noValidate>
    <div>
      <label htmlFor={id}><span className="profile-section-title">Sua resposta à moderação</span></label>
      <textarea id={id} rows={4} maxLength={3000} value={text} onChange={(event) => setText(event.target.value)} aria-invalid={Boolean(error)} />
      {error ? <span className="field-error" role="alert">{error}</span> : null}
    </div>
    <div className="apply-actions"><button type="submit" className="primary-button" disabled={busy}>{busy ? "Enviando…" : "Enviar resposta"}</button></div>
  </form>;
}

/**
 * SPEC-019/020 for the reported company: requests from the moderation to answer and concluded reports with the
 * justification and measures (OPEN-077/081). The reporter's identity and the original text are never shown.
 */
export default function CompanyReports() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const response = await fetch("/api/empresa/denuncias", { cache: "no-store" });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) { setError(body.message || "Não foi possível carregar as denúncias."); return; }
    setRows(body.reports);
  }, []);
  useEffect(() => { load().catch(() => setError("Não foi possível conectar ao serviço.")); }, [load]);

  if (error) return <p className="form-error" role="alert">{error}</p>;
  if (!rows) return <p className="muted" role="status">Carregando denúncias…</p>;
  return <>
    {notice ? <p className="form-success" role="status">{notice}</p> : null}
    {rows.length ? <ul className="notices-list">{rows.map((report) => <li key={report.id} className={`notice${report.canRespond ? " notice-unread" : ""}`}>
      <div className="notice-main">
        <p className="notice-meta">{`${report.categoryLabel} · ${report.jobTitle} · registrada em ${day(report.createdAt)}`}</p>
        <h2 className="notice-title">{report.decisionLabel ? `${report.statusLabel}: ${report.decisionLabel}` : report.statusLabel}</h2>
        {report.request ? <><h3>Pontos da moderação</h3><p className="report-text">{report.request}</p></> : null}
        {report.response ? <><h3>Resposta enviada</h3><p className="report-text">{report.response}</p>{report.respondedAt ? <p className="muted">{`Em ${day(report.respondedAt)}`}</p> : null}</> : null}
        {report.canRespond ? <Respond report={report} onDone={async () => { setNotice("Resposta enviada à moderação."); await load(); }} /> : null}
        {report.status === "CONCLUIDA" ? <>
          <h3>Justificativa</h3><p className="report-text">{report.justification}</p>
          <h3>Medidas</h3><p className="report-text">{report.measures || "Nenhuma: encerrada sem penalidade."}</p>
        </> : null}
      </div>
    </li>)}</ul> : <p className="job-empty">Nenhuma denúncia precisa da sua atenção. Quando a moderação pedir esclarecimentos ou concluir uma análise, ela aparece aqui.</p>}
  </>;
}
