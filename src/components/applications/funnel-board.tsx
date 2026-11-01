"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Item = { id: string; candidateName: string; appliedAt: string; stage: string; stageLabel: string; score: number | null };
type Data = { job: { id: string; title: string; status: string }; counts: Record<string, number>; applications: Item[] };

const stages: { key: string; label: string }[] = [
  { key: "INSCRITO", label: "Inscrito" }, { key: "TRIAGEM", label: "Triagem" }, { key: "ENTREVISTA", label: "Entrevista" },
  { key: "FINALISTA", label: "Finalista" }, { key: "CONTRATADO", label: "Contratado" }, { key: "RECUSADA", label: "Recusada" }, { key: "CANCELADA", label: "Cancelada" }
];
export const stagePill: Record<string, string> = {
  INSCRITO: "status-pending", TRIAGEM: "status-pending", ENTREVISTA: "status-pending", FINALISTA: "status-pending",
  CONTRATADO: "status-active", RECUSADA: "status-neutral", CANCELADA: "status-neutral"
};
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

/** SPEC-013: the funnel of one job — counts per stage, a stage filter and the list of applications. */
export default function FunnelBoard({ basePath, jobId }: { basePath: string; jobId: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    let active = true;
    fetch(`/api/vagas/${jobId}/candidaturas`, { cache: "no-store" }).then(async response => {
      const body = await response.json().catch(() => ({}));
      if (!active) return;
      if (!response.ok) setError(body.message || "Não foi possível carregar as candidaturas.");
      else setData(body as Data);
    }).catch(() => { if (active) setError("Não foi possível conectar ao serviço. Atualize a página."); });
    return () => { active = false; };
  }, [jobId]);

  const list = data ? data.applications.filter(item => filter === "ALL" || item.stage === filter) : [];
  return <main id="conteudo" className="company-content" aria-labelledby="funnel-title">
    <Link className="back-link" href={basePath}>← Voltar às vagas</Link>
    <header className="company-page-heading">
      <h1 id="funnel-title">{data ? `Candidaturas — ${data.job.title}` : "Candidaturas"}</h1>
      <p className="muted">Acompanhe e mova as candidaturas pelas etapas do processo seletivo.</p>
    </header>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {!data && !error ? <p className="muted" role="status">Carregando candidaturas…</p> : null}
    {data ? <>
      <div className="job-tabs" role="group" aria-label="Filtrar por etapa">
        <button type="button" className="job-tab" aria-pressed={filter === "ALL"} onClick={() => setFilter("ALL")}>Todas <span className="job-tab-count">{data.applications.length}</span></button>
        {stages.map(stage => <button key={stage.key} type="button" className="job-tab" aria-pressed={filter === stage.key} onClick={() => setFilter(stage.key)}>
          {stage.label} <span className="job-tab-count">{data.counts[stage.key] ?? 0}</span>
        </button>)}
      </div>
      {list.length === 0 ? <p className="muted job-empty" role="status">{data.applications.length === 0 ? "Esta vaga ainda não recebeu candidaturas." : "Nenhuma candidatura nesta etapa."}</p> :
        <div className="table-scroll"><table className="recruiter-table stack-table">
          <caption className="sr-only">Candidaturas da vaga</caption>
          <thead><tr><th scope="col">Candidato</th><th scope="col">Inscrição</th><th scope="col">Compatibilidade</th><th scope="col">Etapa</th><th scope="col">Ações</th></tr></thead>
          <tbody>{list.map(item => <tr key={item.id}>
            <td data-label="Candidato"><strong>{item.candidateName}</strong></td>
            <td data-label="Inscrição">{date(item.appliedAt)}</td>
            <td data-label="Compatibilidade">{item.score !== null ? `${item.score}%` : "Sem score (dados insuficientes)"}</td>
            <td data-label="Etapa"><span className={`status-pill ${stagePill[item.stage]}`}>{item.stageLabel}</span></td>
            <td data-label="Ações" className="job-actions"><Link className="secondary-button" href={`${basePath}/${jobId}/candidaturas/${item.id}`} aria-label={`Abrir candidatura de ${item.candidateName}`}>Abrir</Link></td>
          </tr>)}</tbody>
        </table></div>}
    </> : null}
  </main>;
}
