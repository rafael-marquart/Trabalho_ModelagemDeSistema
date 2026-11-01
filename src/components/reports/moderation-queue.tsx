"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string; createdAt: string; dueAt: string; overdue: boolean; categoryLabel: string; status: string; statusLabel: string; highPriority: boolean;
  decisionLabel: string | null; concludedAt: string | null; companyAnswered: boolean; job: { id: string; title: string; companyName: string } | null;
};
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** SPEC-020: moderation queue — high priority first, then the oldest (OPEN-080) — and the history of concluded reports. */
export default function ModerationQueue() {
  const [filter, setFilter] = useState<"abertas" | "concluidas">("abertas");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    setRows(null); setError("");
    fetch(`/api/admin/denuncias?filtro=${filter}`, { cache: "no-store" })
      .then(async (response) => { const body = await response.json().catch(() => ({})); if (!response.ok) throw new Error(body.message); setRows(body.reports); })
      .catch((caught) => setError(caught instanceof Error && caught.message ? caught.message : "Não foi possível carregar as denúncias."));
  }, [filter]);

  return <>
    <div className="job-tabs" role="group" aria-label="Filtrar denúncias">
      <button type="button" className="job-tab" aria-pressed={filter === "abertas"} onClick={() => setFilter("abertas")}>Em aberto</button>
      <button type="button" className="job-tab" aria-pressed={filter === "concluidas"} onClick={() => setFilter("concluidas")}>Histórico (concluídas)</button>
    </div>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {!rows && !error ? <p className="muted" role="status">Carregando denúncias…</p> : null}
    {rows ? rows.length ? <div className="table-scroll"><table className="recruiter-table stack-table moderation-table">
      <caption className="visually-hidden">{filter === "abertas" ? "Denúncias em aberto, por prioridade e antiguidade" : "Denúncias concluídas"}</caption>
      <thead><tr><th scope="col">Vaga</th><th scope="col">Tipo</th><th scope="col">Recebida</th><th scope="col">{filter === "abertas" ? "Meta" : "Concluída"}</th><th scope="col">Situação</th><th scope="col"><span className="visually-hidden">Ações</span></th></tr></thead>
      <tbody>{rows.map((row) => <tr key={row.id}>
        <td data-label="Vaga"><strong>{row.job?.title ?? "Vaga"}</strong><br /><span className="muted">{row.job?.companyName}</span></td>
        <td data-label="Tipo">{row.categoryLabel}{row.highPriority ? <><br /><span className="moderation-flag">Prioridade alta</span></> : null}</td>
        <td data-label="Recebida">{date(row.createdAt)}</td>
        <td data-label={filter === "abertas" ? "Meta" : "Concluída"}>{filter === "abertas" ? <>{date(row.dueAt)}{row.overdue ? <><br /><span className="moderation-flag">Meta vencida</span></> : null}</> : row.concludedAt ? date(row.concludedAt) : "—"}</td>
        <td data-label="Situação"><span className="status-pill status-pending">{row.decisionLabel ? `${row.statusLabel}: ${row.decisionLabel}` : row.statusLabel}</span>{row.companyAnswered ? <><br /><span className="muted">Empresa respondeu</span></> : null}</td>
        <td data-label="Ações"><Link className="secondary-button" href={`/admin/denuncias/${row.id}`} aria-label={`Abrir denúncia sobre ${row.job?.title ?? "a vaga"}`}>Abrir</Link></td>
      </tr>)}</tbody>
    </table></div> : <p className="job-empty">{filter === "abertas" ? "Nenhuma denúncia aguardando moderação." : "Nenhuma denúncia concluída."}</p> : null}
  </>;
}
