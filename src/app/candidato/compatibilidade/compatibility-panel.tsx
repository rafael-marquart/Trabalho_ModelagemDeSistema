"use client";

import React, { useEffect, useState } from "react";
import { transportModes } from "@/lib/candidate-profile/options";

type Job = { id: string; title: string; company: string; modality: string | null; city: string; state: string; deadline: string };
type Dimension = { status: string; score: number | null; components: { label: string; score: number | null; detail: string }[] };
type Result = {
  id: string; status: "COMPLETE" | "INCOMPATIBLE" | "INSUFFICIENT_DATA"; score: number | null; executedAt: string; factors: string[];
  missing: { dimension: string; item: string; action: string }[]; dimensions: Record<"A" | "T" | "D", Dimension>;
};
const dimensionNames = { A: "Acessibilidade", T: "Perfil técnico", D: "Modalidade e deslocamento" } as const;
const statusText = { COMPLETE: "Score calculado", INCOMPATIBLE: "Vaga incompatível", INSUFFICIENT_DATA: "Dados insuficientes" } as const;
const statusClass = { COMPLETE: "status-active", INCOMPATIBLE: "status-neutral", INSUFFICIENT_DATA: "status-pending" } as const;
const modalityText: Record<string, string> = { PRESENCIAL: "Presencial", HIBRIDO: "Híbrido", REMOTO: "Remoto" };

export default function CompatibilityPanel() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [modes, setModes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/candidato/vagas").then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error();
      if (active) setJobs(data.jobs);
    }).catch(() => { if (active) setError("Não foi possível carregar as vagas. Atualize a página para tentar novamente."); });
    return () => { active = false; };
  }, []);

  async function analyze(job: Job) {
    setBusy(job.id); setError("");
    try {
      const response = await fetch("/api/candidato/compatibilidade", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: job.id, ...(modes[job.id] ? { transportMode: modes[job.id] } : {}) })
      });
      const data = await response.json();
      if (!response.ok) { setError(data.message || "Não foi possível calcular a compatibilidade."); return; }
      setResults(current => ({ ...current, [job.id]: data.result }));
    } catch { setError("Não foi possível calcular a compatibilidade. Tente novamente."); }
    finally { setBusy(""); }
  }

  if (jobs === null && !error) return <p className="muted" role="status">Carregando vagas…</p>;
  return <div className="compat-list">
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {jobs?.length === 0 ? <p className="muted">Nenhuma vaga publicada no momento.</p> : null}
    {jobs?.map(job => {
      const result = results[job.id];
      const onsite = job.modality === "PRESENCIAL" || job.modality === "HIBRIDO";
      return <article key={job.id} className="profile-section compat-card" aria-labelledby={`job-${job.id}`}>
        <h2 id={`job-${job.id}`}>{job.title || "Sem título"}</h2>
        <p className="muted">{job.company} · {job.modality ? modalityText[job.modality] : "Modalidade não informada"}{job.city ? ` · ${job.city}/${job.state}` : ""}</p>
        <div className="compat-actions">
          {onsite ? <label className="compat-mode"><span className="profile-section-title">Meio de transporte para esta vaga</span>
            <select value={modes[job.id] ?? ""} onChange={e => setModes(current => ({ ...current, [job.id]: e.target.value }))}>
              <option value="">Usar o do meu perfil</option>
              {transportModes.map(mode => <option key={mode} value={mode}>{mode}</option>)}
            </select></label> : null}
          <button type="button" className="primary-button" disabled={busy === job.id} onClick={() => analyze(job)}>{busy === job.id ? "Calculando…" : result ? "Recalcular" : "Calcular compatibilidade"}</button>
        </div>
        {result ? <div className="compat-result" role="status">
          <p><span className={`status-pill ${statusClass[result.status]}`}>{statusText[result.status]}</span>{result.score !== null ? <strong className="compat-score"> {result.score}%</strong> : null}</p>
          <h3>Principais fatores</h3>
          <ul>{result.factors.map((factor, index) => <li key={index}>{factor}</li>)}</ul>
          {result.missing.length ? <><h3>O que falta</h3><ul>{result.missing.map((item, index) => <li key={index}><strong>{item.item.replace(/\.+$/, "")}.</strong> {item.action}</li>)}</ul></> : null}
          <h3>Por dimensão</h3>
          <ul>{(["A", "T", "D"] as const).map(code => <li key={code}><strong>{dimensionNames[code]}:</strong> {result.dimensions[code].status === "EVALUATED" ? `${Math.round(result.dimensions[code].score ?? 0)}/100` : result.dimensions[code].status === "NOT_APPLICABLE" ? "não se aplica" : "dados insuficientes"}
            {result.dimensions[code].components.length ? <ul>{result.dimensions[code].components.map((component, index) => <li key={index}>{component.label}: {component.detail}</li>)}</ul> : null}</li>)}</ul>
        </div> : null}
      </article>;
    })}
  </div>;
}
