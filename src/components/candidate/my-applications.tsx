"use client";

import React, { useId, useMemo, useState } from "react";
import Link from "next/link";
import { candidatePill, dateOnly, initialsOf } from "./application-format";
import HideApplication from "./hide-application";

export type MyApplication = {
  id: string; appliedAt: string; stage: string; stageLabel: string;
  job: { id: string; title: string; companyName: string; closed: boolean };
  canHide?: boolean;
};

const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("pt-BR");

const statusOptions = [
  { value: "", label: "Todos os status" },
  { value: "ACTIVE", label: "Em andamento" },
  { value: "CONTRATADO", label: "Aprovada" },
  { value: "RECUSADA", label: "Recusada" },
  { value: "CANCELADA", label: "Cancelada" }
];
const ACTIVE = ["INSCRITO", "TRIAGEM", "ENTREVISTA", "FINALISTA"];

/** SPEC-012/016: the candidate's own applications with their current stage; search and status only narrow the list on screen. */
export default function MyApplications({ applications }: { applications: MyApplication[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const searchId = useId();
  const statusId = useId();
  const shown = useMemo(() => applications.filter((item) => {
    if (status === "ACTIVE" ? !ACTIVE.includes(item.stage) : status && item.stage !== status) return false;
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const haystack = normalize(`${item.job.title} ${item.job.companyName}`);
    return terms.every((term) => haystack.includes(term));
  }), [applications, query, status]);

  if (!applications.length) {
    return <div className="job-empty">
      <p>Você ainda não tem candidaturas para acompanhar.</p>
      <Link className="primary-button" href="/candidato/vagas">Buscar vagas</Link>
    </div>;
  }
  return <>
    <div className="my-applications-filters" role="search">
      <div className="field">
        <label htmlFor={searchId}>Buscar por cargo ou empresa</label>
        <input id={searchId} type="search" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <div className="field">
        <label htmlFor={statusId}>Status</label>
        <select id={statusId} value={status} onChange={(event) => setStatus(event.target.value)}>
          {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </div>
    </div>
    <p className="muted" role="status">{shown.length === applications.length ? `${applications.length} ${applications.length === 1 ? "candidatura" : "candidaturas"}.` : `${shown.length} de ${applications.length} candidaturas com os filtros escolhidos.`}</p>
    {shown.length ? <ul className="my-applications-list">
      {shown.map((item) => <li key={item.id} className="my-application-card">
        <span className="my-application-avatar" aria-hidden="true">{initialsOf(item.job.companyName)}</span>
        <div className="my-application-main">
          <p className="job-card-company">{item.job.companyName}</p>
          <h2 className="my-application-title">{item.job.title}</h2>
          <p className="muted">{`Enviada em ${dateOnly(item.appliedAt)}${item.job.closed ? " · Vaga encerrada" : ""}`}</p>
        </div>
        <div className="my-application-side">
          <span className={`status-pill ${candidatePill[item.stage] ?? "status-neutral"}`}>{item.stageLabel}</span>
          <Link className="text-link" href={`/candidato/candidaturas/${item.id}`} aria-label={`Ver candidatura para ${item.job.title}, em ${item.job.companyName}`}>Ver candidatura →</Link>
          {item.canHide ? <HideApplication applicationId={item.id} jobTitle={item.job.title} /> : null}
        </div>
      </li>)}
    </ul> : <p className="job-empty">Nenhuma candidatura corresponde aos filtros escolhidos.</p>}
  </>;
}
