import React from "react";
import { jobModalityLabels, type JobModalityValue } from "@/lib/jobs/constants";
import ScoreDialog from "./score-dialog";
import type { SearchJob } from "./types";

/** One search result: company, title, modality and location, the declared accessibility (RB-13) and the score circle. */
export default function JobCard({ job }: { job: SearchJob }) {
  const present = job.accessibility.filter(item => item.status === "PRESENT").map(item => item.label);
  const titleId = `job-title-${job.id}`;
  return <article className="job-card" aria-labelledby={titleId}>
    <div className="job-card-top">
      <div className="job-card-heading">
        <p className="job-card-company">{job.companyName}</p>
        <h3 id={titleId}>{job.title || "Vaga sem título"}</h3>
      </div>
      <ScoreDialog jobTitle={job.title || "Vaga sem título"} result={job.compatibility} />
    </div>
    <ul className="job-card-tags" aria-label="Características">
      {job.modality ? <li>{jobModalityLabels[job.modality as JobModalityValue] ?? job.modality}</li> : null}
      {job.professionalArea ? <li>{job.professionalArea}</li> : null}
    </ul>
    <p className="job-card-location">{job.location || (job.modality === "REMOTO" ? "Trabalho remoto" : "Local não informado")}</p>
    <details className="job-card-access">
      <summary>Acessibilidade declarada: {present.length ? present.join(", ") : "nenhum recurso marcado como presente"}</summary>
      <ul>{job.accessibility.map(item => <li key={item.code}>{item.label}: {item.statusLabel}</li>)}</ul>
    </details>
  </article>;
}
