"use client";

import React, { useId, useRef, useState } from "react";
import { interviewDateTime } from "@/lib/interviews/format";

export type Interview = {
  id: string; scheduledAt: string; modality: "PRESENCIAL" | "ONLINE"; modalityLabel: string; locationOrLink: string;
  accessibilityResources: string; status: "SCHEDULED" | "COMPLETED" | "CANCELLED"; statusLabel: string; completedAt: string | null; cancelledAt: string | null;
};
type Form = { scheduledAt: string; modality: "PRESENCIAL" | "ONLINE" | ""; locationOrLink: string; accessibilityResources: string };

/** ISO instant → "AAAA-MM-DDTHH:mm" in Brasília time, for the datetime-local field. */
const toLocalInput = (iso: string) => new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 16);
const empty: Form = { scheduledAt: "", modality: "", locationOrLink: "", accessibilityResources: "" };
const pill = { SCHEDULED: "status-pending", COMPLETED: "status-active", CANCELLED: "status-neutral" } as const;

/**
 * SPEC-018 (decision of 01/11/2026): interviews of one application in the company funnel. Scheduling is available in the
 * Entrevista stage; a scheduled interview can be changed, cancelled or marked as completed after its time. The candidate
 * is told about scheduling, changes and cancellation (SPEC-017). The server checks everything again.
 */
export default function InterviewPanel({ applicationId, interviews, canSchedule, candidateEssentials, onChanged }: {
  applicationId: string; interviews: Interview[]; canSchedule: boolean; candidateEssentials: string[]; onChanged: (message: string) => Promise<void> | void;
}) {
  const current = interviews.find((item) => item.status === "SCHEDULED") ?? null;
  const past = interviews.filter((item) => item.status !== "SCHEDULED");
  const [mode, setMode] = useState<"view" | "form" | "cancel" | "complete">("view");
  const [form, setForm] = useState<Form>(empty);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const ids = { when: useId(), modality: useId(), place: useId(), resources: useId() };

  const openForm = (interview: Interview | null) => {
    setForm(interview ? { scheduledAt: toLocalInput(interview.scheduledAt), modality: interview.modality, locationOrLink: interview.locationOrLink, accessibilityResources: interview.accessibilityResources } : empty);
    setIssues({}); setError(""); setMode("form");
    setTimeout(() => firstFieldRef.current?.focus(), 0);
  };

  async function send(url: string, method: string, body: unknown, success: string) {
    setBusy(true); setError(""); setIssues({});
    try {
      const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) { setError(payload.message || "Não foi possível salvar."); setIssues(payload.issues ?? {}); return; }
      setMode("view");
      await onChanged(success);
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setBusy(false); }
  }

  const save = () => current
    ? send(`/api/candidaturas/${applicationId}/entrevistas/${current.id}`, "PUT", form, "Entrevista alterada. O candidato foi avisado.")
    : send(`/api/candidaturas/${applicationId}/entrevistas`, "POST", form, "Entrevista agendada. O candidato foi avisado.");
  const finish = (action: "cancel" | "complete") => current && send(`/api/candidaturas/${applicationId}/entrevistas/${current.id}/acao`, "POST", { action },
    action === "cancel" ? "Entrevista cancelada. O candidato foi avisado." : "Entrevista marcada como concluída. O candidato já pode avaliar o processo.");
  const due = current ? new Date(current.scheduledAt) <= new Date() : false;
  const fieldError = (name: keyof Form) => issues[name] ? <span className="field-error" id={`${ids.when}-${name}-error`}>{issues[name]}</span> : null;

  return <section className="job-detail-section interview-panel" aria-labelledby="interview-title">
    <h2 id="interview-title">Entrevista</h2>
    {error ? <p className="form-error" role="alert">{error}</p> : null}

    {mode === "form" ? <form className="interview-form" onSubmit={(event) => { event.preventDefault(); void save(); }} noValidate>
      <h3>{current ? "Alterar entrevista" : "Agendar entrevista"}</h3>
      <div className="job-field"><label htmlFor={ids.when}><span className="profile-section-title">Data e hora (horário de Brasília)</span></label>
        <input ref={firstFieldRef} id={ids.when} type="datetime-local" required value={form.scheduledAt} aria-invalid={Boolean(issues.scheduledAt)}
          aria-describedby={issues.scheduledAt ? `${ids.when}-scheduledAt-error` : undefined} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} />
        {fieldError("scheduledAt")}
      </div>
      <div className="job-field"><label htmlFor={ids.modality}><span className="profile-section-title">Modalidade</span></label>
        <select id={ids.modality} required value={form.modality} aria-invalid={Boolean(issues.modality)} aria-describedby={issues.modality ? `${ids.when}-modality-error` : undefined} onChange={(event) => setForm({ ...form, modality: event.target.value as Form["modality"] })}>
          <option value="">Escolha</option><option value="PRESENCIAL">Presencial</option><option value="ONLINE">On-line</option>
        </select>
        {fieldError("modality")}
      </div>
      <div className="job-field"><label htmlFor={ids.place}><span className="profile-section-title">{form.modality === "ONLINE" ? "Link da sala" : "Endereço"}</span></label>
        <input id={ids.place} type="text" required maxLength={300} value={form.locationOrLink} aria-invalid={Boolean(issues.locationOrLink)}
          aria-describedby={issues.locationOrLink ? `${ids.when}-locationOrLink-error` : undefined}
          placeholder={form.modality === "ONLINE" ? "https://" : "Rua, número, sala, cidade"} onChange={(event) => setForm({ ...form, locationOrLink: event.target.value })} />
        {fieldError("locationOrLink")}
      </div>
      <div className="job-field"><label htmlFor={ids.resources}><span className="profile-section-title">Recursos de acessibilidade previstos (opcional)</span></label>
        <textarea id={ids.resources} rows={3} maxLength={1000} value={form.accessibilityResources} onChange={(event) => setForm({ ...form, accessibilityResources: event.target.value })}
          placeholder="Ex.: intérprete de Libras, sala no térreo, legendas na chamada" />
        {fieldError("accessibilityResources")}
      </div>
      {candidateEssentials.length ? <p className="muted">{`Recursos que o candidato marcou como indispensáveis: ${candidateEssentials.join(", ")}.`}</p> : null}
      <div className="apply-actions">
        <button type="submit" className="primary-button" disabled={busy}>{busy ? "Salvando…" : current ? "Salvar alteração" : "Agendar e avisar o candidato"}</button>
        <button type="button" className="secondary-button" disabled={busy} onClick={() => setMode("view")}>Voltar</button>
      </div>
    </form> : current ? <div className="interview-current">
      <p><span className={`status-pill ${pill.SCHEDULED}`}>Agendada</span></p>
      <dl className="interview-facts">
        <div><dt>Quando</dt><dd>{`${interviewDateTime(current.scheduledAt)} (horário de Brasília)`}</dd></div>
        <div><dt>Modalidade</dt><dd>{current.modalityLabel}</dd></div>
        <div><dt>{current.modality === "ONLINE" ? "Link" : "Local"}</dt><dd className="interview-place">{current.locationOrLink}</dd></div>
        <div><dt>Recursos de acessibilidade</dt><dd>{current.accessibilityResources || "Nenhum informado"}</dd></div>
      </dl>
      {mode === "cancel" || mode === "complete" ? <div className="apply-confirm">
        <p>{mode === "cancel" ? "Cancelar esta entrevista? O candidato será avisado." : "Marcar a entrevista como concluída? O candidato poderá avaliar o processo por 60 dias."}</p>
        <div className="apply-actions">
          <button type="button" className="primary-button" disabled={busy} onClick={() => finish(mode)}>{busy ? "Salvando…" : "Confirmar"}</button>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => setMode("view")}>Voltar</button>
        </div>
      </div> : <div className="apply-actions">
        <button type="button" className="primary-button" disabled={!due} onClick={() => setMode("complete")} aria-describedby={due ? undefined : `${ids.when}-due`}>Marcar como concluída</button>
        <button type="button" className="secondary-button" onClick={() => openForm(current)}>Alterar</button>
        <button type="button" className="secondary-button" onClick={() => setMode("cancel")}>Cancelar entrevista</button>
      </div>}
      {!due ? <p className="muted" id={`${ids.when}-due`}>Depois do horário da entrevista, marque-a como concluída para o candidato poder avaliar o processo.</p> : null}
    </div> : canSchedule ? <div>
      <p className="muted">Nenhuma entrevista agendada para esta candidatura.</p>
      <button type="button" className="primary-button" onClick={() => openForm(null)}>Agendar entrevista</button>
    </div> : <p className="muted">A entrevista pode ser agendada quando a candidatura estiver na etapa Entrevista.</p>}

    {past.length ? <>
      <h3>Entrevistas anteriores</h3>
      <ul className="interview-history">{past.map((item) => <li key={item.id}>
        <span className={`status-pill ${pill[item.status]}`}>{item.statusLabel}</span>
        <span>{`${interviewDateTime(item.scheduledAt)} · ${item.modalityLabel}`}</span>
      </li>)}</ul>
    </> : null}
  </section>;
}
