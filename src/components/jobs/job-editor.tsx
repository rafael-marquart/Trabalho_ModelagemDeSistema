"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ChoiceGroup from "@/components/choice-group";
import { brazilianStates, jobModalities, jobModalityLabels, jobStatusLabels, TEXT_LIMITS, type JobAction, type JobModalityValue, type JobStatusValue } from "@/lib/jobs/constants";
import { infrastructureItems, infrastructureStatuses, statusLabels, type InfrastructureStatus } from "@/lib/company-infrastructure/items";

type Form = {
  title: string; description: string; requirements: string; modality: JobModalityValue | "";
  locationCity: string; locationState: string; locationAddress: string; deadline: string;
  salaryMin: string; salaryMax: string; accessibility: Record<string, InfrastructureStatus>;
};
const MISSING_FIELDS = "Falta preencher ou corrigir algum campo. Os campos com problema estão indicados em vermelho, acima nesta página.";
const empty: Form = { title: "", description: "", requirements: "", modality: "", locationCity: "", locationState: "", locationAddress: "", deadline: "", salaryMin: "", salaryMax: "", accessibility: {} };

function parseMoney(text: string): number | null | "invalid" {
  const trimmed = text.trim().replace(/\./g, "").replace(",", ".");
  if (!trimmed) return null;
  const value = Number(trimmed);
  return Number.isFinite(value) && value >= 0 ? value : "invalid";
}
function moneyText(value: number | null) { return value === null || value === undefined ? "" : String(value).replace(".", ","); }

export default function JobEditor({ basePath, jobId }: { basePath: string; jobId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<Form>(empty);
  const [status, setStatus] = useState<JobStatusValue | "NEW">(jobId ? "DRAFT" : "NEW");
  const [loading, setLoading] = useState(Boolean(jobId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [issues, setIssues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!jobId) return;
    let active = true;
    fetch(`/api/vagas/${jobId}`).then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 404 ? "Vaga não encontrada." : "Falha ao carregar.");
      if (!active) return;
      const job = data.job;
      setStatus(job.status);
      setForm({ ...empty, title: job.title, description: job.description, requirements: job.requirements, modality: job.modality,
        locationCity: job.locationCity, locationState: job.locationState, locationAddress: job.locationAddress, deadline: job.deadline,
        salaryMin: moneyText(job.salaryMin), salaryMax: moneyText(job.salaryMax), accessibility: job.accessibility ?? {} });
    }).catch(err => { if (active) setError(err.message || "Não foi possível carregar a vaga."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [jobId]);

  useEffect(() => {
    if (!Object.keys(issues).length) return;
    const first = document.querySelector<HTMLElement>(".job-form .field-error");
    if (first && typeof first.scrollIntoView === "function") first.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [issues]);

  const readOnly = status === "CLOSED";
  const published = status === "OPEN" || status === "PAUSED";
  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm(current => ({ ...current, [key]: value }));
    setIssues(current => { if (!(key in current)) return current; const next = { ...current }; delete next[key]; return next; });
  }
  function setAccessibility(code: string, value: InfrastructureStatus) {
    setForm(current => ({ ...current, accessibility: { ...current.accessibility, [code]: value } }));
    setIssues(current => { const key = `accessibility.${code}`; if (!(key in current)) return current; const next = { ...current }; delete next[key]; return next; });
  }
  function fieldError(key: string) { return issues[key] ? <p className="form-error field-error" id={`err-${key}`} role="alert">{issues[key]}</p> : null; }

  function payload() {
    const min = parseMoney(form.salaryMin), max = parseMoney(form.salaryMax);
    if (min === "invalid" || max === "invalid") {
      setIssues({ salary: "Informe os valores de salário apenas com números, por exemplo 3500,00." });
      return null;
    }
    return { title: form.title, description: form.description, requirements: form.requirements, modality: form.modality,
      locationCity: form.locationCity, locationState: form.locationState, locationAddress: form.locationAddress, deadline: form.deadline,
      salaryMin: min, salaryMax: max, accessibility: form.accessibility };
  }

  async function request(url: string, method: string, body: unknown) {
    const response = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => ({}));
    return { ok: response.ok, data };
  }
  function showFailure(data: { message?: string; issues?: Record<string, string> }) {
    setIssues(data.issues ?? {});
    setError(data.issues && Object.keys(data.issues).length ? MISSING_FIELDS : data.message || "Não foi possível salvar a vaga.");
  }

  async function save() {
    const body = payload(); if (!body) { setError(MISSING_FIELDS); return null; }
    const result = jobId ? await request(`/api/vagas/${jobId}`, "PUT", body) : await request("/api/vagas", "POST", body);
    if (!result.ok) { showFailure(result.data); return null; }
    return result.data.job as { id: string; status: JobStatusValue };
  }

  async function onSave(event?: React.FormEvent) {
    event?.preventDefault();
    if (readOnly || busy) return;
    setBusy(true); setError(""); setNotice(""); setIssues({});
    try {
      const job = await save();
      if (!job) return;
      if (!jobId) { router.push(`${basePath}/${job.id}`); return; }
      setNotice(published ? "Alterações salvas." : "Rascunho salvo.");
    } catch { setError("Não foi possível salvar a vaga. Tente novamente."); }
    finally { setBusy(false); }
  }

  async function onAction(action: JobAction) {
    if (readOnly || busy) return;
    if (action === "close" && !window.confirm("Encerrar esta vaga? Esta ação não pode ser desfeita.")) return;
    setBusy(true); setError(""); setNotice(""); setIssues({});
    try {
      const job = await save();
      if (!job) return;
      const result = await request(`/api/vagas/${job.id}/acao`, "POST", { action });
      if (!result.ok) { showFailure(result.data); if (!jobId) router.push(`${basePath}/${job.id}`); return; }
      if (action === "close") { router.push(basePath); return; }
      if (!jobId) { router.push(`${basePath}/${job.id}`); return; }
      setStatus(result.data.job.status);
      setNotice(action === "publish" ? "Vaga publicada." : action === "pause" ? "Vaga pausada." : "Vaga reaberta.");
    } catch { setError("Não foi possível concluir a ação. Tente novamente."); }
    finally { setBusy(false); }
  }

  if (loading) return <main className="company-content"><p className="muted" role="status">Carregando vaga…</p></main>;
  if (error && jobId && status === "DRAFT" && !form.title && error === "Vaga não encontrada.") return <main className="company-content"><p className="form-error" role="alert">{error}</p></main>;

  const needsLocation = form.modality === "PRESENCIAL" || form.modality === "HIBRIDO";
  return <main className="company-content" aria-labelledby="job-editor-title">
    <header className="company-page-heading">
      <h1 id="job-editor-title">{jobId ? "Vaga" : "Nova vaga"}{status !== "NEW" ? <span className={`status-pill job-status-inline ${status === "OPEN" ? "status-active" : status === "PAUSED" ? "status-pending" : "status-neutral"}`}>{jobStatusLabels[status]}</span> : null}</h1>
      <p className="muted">{readOnly ? "Esta vaga está encerrada e não pode mais ser alterada." : "Rascunhos podem ficar incompletos. Para publicar, preencha todos os campos obrigatórios e declare a acessibilidade da vaga."}</p>
    </header>
    <form className="job-form" onSubmit={onSave} noValidate>
      <fieldset className="profile-section job-fieldset" disabled={readOnly}>
        <legend className="sr-only">Dados da vaga</legend>
        <h2>Dados da vaga</h2>
        <label className="job-field"><span className="profile-section-title">Título {published ? "(obrigatório)" : ""}</span>
          <input type="text" value={form.title} maxLength={TEXT_LIMITS.title} onChange={e => set("title", e.target.value)} aria-invalid={Boolean(issues.title)} aria-describedby={issues.title ? "err-title" : undefined} />
        </label>{fieldError("title")}
        <label className="job-field"><span className="profile-section-title">Descrição</span>
          <textarea rows={6} value={form.description} maxLength={TEXT_LIMITS.description} onChange={e => set("description", e.target.value)} aria-invalid={Boolean(issues.description)} aria-describedby={issues.description ? "err-description" : undefined} />
        </label>{fieldError("description")}
        <label className="job-field"><span className="profile-section-title">Requisitos</span>
          <textarea rows={5} value={form.requirements} maxLength={TEXT_LIMITS.requirements} onChange={e => set("requirements", e.target.value)} aria-invalid={Boolean(issues.requirements)} aria-describedby={issues.requirements ? "err-requirements" : undefined} />
        </label>{fieldError("requirements")}
        <label className="job-field"><span className="profile-section-title">Prazo de inscrição</span>
          <input type="date" value={form.deadline} onChange={e => set("deadline", e.target.value)} aria-invalid={Boolean(issues.deadline)} aria-describedby={issues.deadline ? "err-deadline" : undefined} />
        </label>{fieldError("deadline")}
      </fieldset>

      <fieldset className="profile-section job-fieldset" disabled={readOnly}>
        <legend className="sr-only">Modalidade e local</legend>
        <h2>Modalidade e local</h2>
        <ChoiceGroup legend="Modalidade" className="job-choice" choices={jobModalities.map(value => ({ value, label: jobModalityLabels[value] }))} value={form.modality} onChange={value => set("modality", value)} describedBy={issues.modality ? "err-modality" : undefined} />
        {fieldError("modality")}
        <div className="job-row">
          <label className="job-field"><span className="profile-section-title">Cidade{needsLocation ? " (obrigatória)" : ""}</span>
            <input type="text" value={form.locationCity} maxLength={TEXT_LIMITS.city} onChange={e => set("locationCity", e.target.value)} aria-invalid={Boolean(issues.locationCity)} aria-describedby={issues.locationCity ? "err-locationCity" : undefined} />
            {fieldError("locationCity")}
          </label>
          <label className="job-field"><span className="profile-section-title">Estado{needsLocation ? " (obrigatório)" : ""}</span>
            <select value={form.locationState} onChange={e => set("locationState", e.target.value)} aria-invalid={Boolean(issues.locationState)} aria-describedby={issues.locationState ? "err-locationState" : undefined}>
              <option value="">Selecione</option>
              {brazilianStates.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            {fieldError("locationState")}
          </label>
        </div>
        <label className="job-field"><span className="profile-section-title">Endereço (opcional)</span>
          <input type="text" value={form.locationAddress} maxLength={TEXT_LIMITS.address} onChange={e => set("locationAddress", e.target.value)} />
        </label>
      </fieldset>

      <fieldset className="profile-section job-fieldset" disabled={readOnly}>
        <legend className="sr-only">Remuneração</legend>
        <h2>Remuneração (opcional)</h2>
        <div className="job-row">
          <label className="job-field"><span className="profile-section-title">Salário mínimo (R$)</span>
            <input type="text" inputMode="decimal" value={form.salaryMin} onChange={e => set("salaryMin", e.target.value)} aria-describedby={issues.salary ? "err-salary" : undefined} /></label>
          <label className="job-field"><span className="profile-section-title">Salário máximo (R$)</span>
            <input type="text" inputMode="decimal" value={form.salaryMax} onChange={e => set("salaryMax", e.target.value)} aria-describedby={issues.salary ? "err-salary" : undefined} /></label>
        </div>
        {fieldError("salary")}
      </fieldset>

      <fieldset className="profile-section job-fieldset" disabled={readOnly}>
        <legend className="sr-only">Acessibilidade da vaga</legend>
        <h2>Acessibilidade da vaga</h2>
        <p className="muted">Declare o que esta vaga oferece em cada item. Para publicar, escolha uma opção em todos; &quot;Não informado&quot; é uma resposta válida.</p>
        {infrastructureItems.map(item => <div key={item.code} className="infrastructure-item">
          <ChoiceGroup legend={item.label} className="accessibility-declaration-choices" value={form.accessibility[item.code] ?? ""}
            onChange={value => setAccessibility(item.code, value)} describedBy={issues[`accessibility.${item.code}`] ? `err-accessibility.${item.code}` : undefined}
            choices={infrastructureStatuses.map(value => ({ value, label: statusLabels[value] }))} />
          {fieldError(`accessibility.${item.code}`)}
        </div>)}
      </fieldset>

      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {notice ? <p className="form-success" role="status">{notice}</p> : null}
      {!readOnly ? <div className="profile-actions">
        {status === "NEW" || status === "DRAFT" ? <>
          <button type="submit" className="secondary-button" disabled={busy}>Salvar rascunho</button>
          <button type="button" className="primary-button" disabled={busy} onClick={() => onAction("publish")}>Publicar vaga</button>
        </> : <>
          <button type="submit" className="primary-button" disabled={busy}>Salvar alterações</button>
          {status === "OPEN" ? <button type="button" className="secondary-button" disabled={busy} onClick={() => onAction("pause")}>Pausar</button> : null}
          {status === "PAUSED" ? <button type="button" className="secondary-button" disabled={busy} onClick={() => onAction("reopen")}>Reabrir</button> : null}
          <button type="button" className="secondary-button" disabled={busy} onClick={() => onAction("close")}>Encerrar vaga</button>
        </>}
      </div> : null}
    </form>
  </main>;
}
