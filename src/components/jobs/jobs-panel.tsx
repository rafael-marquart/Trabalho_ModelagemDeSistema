"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { jobModalityLabels, jobStatusLabels, type JobAction, type JobModalityValue, type JobStatusValue } from "@/lib/jobs/constants";

type JobRow = { id: string; status: JobStatusValue; title: string; modality: JobModalityValue | ""; deadline: string; locationCity: string; locationState: string };
type Counts = Record<JobStatusValue, number>;

const tabs: { status: JobStatusValue; label: string }[] = [
  { status: "OPEN", label: "Publicadas" }, { status: "DRAFT", label: "Rascunhos" },
  { status: "PAUSED", label: "Pausadas" }, { status: "CLOSED", label: "Encerradas" }
];
const pillClass: Record<JobStatusValue, string> = { OPEN: "status-active", DRAFT: "status-neutral", PAUSED: "status-pending", CLOSED: "status-neutral" };

function formatDate(value: string) {
  const [y, m, d] = value.split("-");
  return y && m && d ? `${d}/${m}/${y}` : "—";
}

export default function JobsPanel({ basePath }: { basePath: string }) {
  const [status, setStatus] = useState<JobStatusValue>("OPEN");
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [counts, setCounts] = useState<Counts>({ DRAFT: 0, OPEN: 0, PAUSED: 0, CLOSED: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async (current: JobStatusValue) => {
    setLoading(true); setError("");
    try {
      const response = await fetch(`/api/vagas?status=${current}`);
      const data = await response.json();
      if (!response.ok) throw new Error();
      setJobs(data.jobs); setCounts(data.counts);
    } catch { setError("Não foi possível carregar as vagas. Atualize a página para tentar novamente."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(status); }, [load, status]);

  async function act(job: JobRow, action: JobAction) {
    if (action === "close" && !window.confirm(`Encerrar a vaga "${job.title || "sem título"}"? Esta ação não pode ser desfeita.`)) return;
    setBusyId(job.id); setError(""); setNotice("");
    try {
      const response = await fetch(`/api/vagas/${job.id}/acao`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const data = await response.json();
      if (!response.ok) {
        const first = data.issues ? Object.values(data.issues)[0] : null;
        setError(typeof first === "string" ? `Não foi possível concluir: ${first} Abra a vaga para corrigir.` : data.message || "Não foi possível concluir a ação.");
      } else {
        setNotice(action === "pause" ? "Vaga pausada." : action === "reopen" ? "Vaga reaberta." : action === "close" ? "Vaga encerrada." : "Vaga publicada.");
        await load(status);
      }
    } catch { setError("Não foi possível concluir a ação. Tente novamente."); }
    finally { setBusyId(""); }
  }

  return <main className="company-content" aria-labelledby="jobs-title">
    <header className="company-page-heading jobs-heading">
      <div><h1 id="jobs-title">Vagas da empresa</h1>
        <p className="muted">Cadastre, publique e acompanhe as oportunidades da sua organização.</p></div>
      <Link className="primary-button job-new-link" href={`${basePath}/nova`}>+ Nova vaga</Link>
    </header>
    <div className="job-tabs" role="group" aria-label="Filtrar vagas por situação">
      {tabs.map(tab => <button key={tab.status} type="button" className="job-tab" aria-pressed={status === tab.status}
        onClick={() => setStatus(tab.status)}>{tab.label} <span className="job-tab-count">{counts[tab.status]}</span></button>)}
    </div>
    {notice ? <p className="form-success" role="status">{notice}</p> : null}
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {loading ? <p className="muted" role="status">Carregando vagas…</p> : jobs.length === 0 ? <p className="muted job-empty">Nenhuma vaga nesta situação.</p> :
      <div className="table-scroll"><table className="recruiter-table">
        <caption className="sr-only">Vagas — {tabs.find(t => t.status === status)?.label}</caption>
        <thead><tr><th scope="col">Título</th><th scope="col">Modalidade</th><th scope="col">Prazo</th><th scope="col">Situação</th><th scope="col">Ações</th></tr></thead>
        <tbody>{jobs.map(job => <tr key={job.id}>
          <td>{job.title || "Sem título"}</td>
          <td>{job.modality ? jobModalityLabels[job.modality] : "—"}</td>
          <td>{formatDate(job.deadline)}</td>
          <td><span className={`status-pill ${pillClass[job.status]}`}>{jobStatusLabels[job.status]}</span></td>
          <td className="job-actions">
            <Link className="secondary-button" href={`${basePath}/${job.id}`}>{job.status === "CLOSED" ? "Ver" : "Editar"}</Link>
            {job.status === "OPEN" ? <button type="button" className="secondary-button" disabled={busyId === job.id} onClick={() => act(job, "pause")}>Pausar</button> : null}
            {job.status === "PAUSED" ? <button type="button" className="secondary-button" disabled={busyId === job.id} onClick={() => act(job, "reopen")}>Reabrir</button> : null}
            {job.status === "OPEN" || job.status === "PAUSED" ? <button type="button" className="secondary-button" disabled={busyId === job.id} onClick={() => act(job, "close")}>Encerrar</button> : null}
          </td></tr>)}</tbody>
      </table></div>}
  </main>;
}
