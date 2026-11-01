"use client";

import React, { useId, useRef, useState } from "react";
import Link from "next/link";

type Evaluation = { id: string; submittedAt: string; interviewAt: string | null };
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
const categories = [
  { value: "ACCESSIBILITY_INCOMPATIBILITY", label: "Possível incompatibilidade de acessibilidade", hint: "A vaga ou o processo não oferecem a acessibilidade declarada ou necessária." },
  { value: "FALSE_INCLUSION", label: "Possível falsa inclusão", hint: "A vaga se apresenta como inclusiva, mas a prática indica o contrário." }
] as const;

/**
 * SPEC-019: report form. Category and description are required; evidence is optional text (links or a description)
 * and never a medical report or a personal document. The confirmation says the report was registered, without
 * anticipating any decision.
 */
export default function ReportForm({ jobId, jobTitle, companyName, evaluations }: { jobId: string; jobTitle: string; companyName: string; evaluations: Evaluation[] }) {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [evidence, setEvidence] = useState("");
  const [evaluationId, setEvaluationId] = useState("");
  const [risk, setRisk] = useState(false);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const ids = { description: useId(), evidence: useId(), evaluation: useId(), risk: useId() };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found: Record<string, string> = {};
    if (!category) found.category = "Escolha o tipo da situação.";
    if (description.trim().length < 20) found.description = "Descreva a situação com pelo menos 20 caracteres.";
    setIssues(found); setError("");
    if (Object.keys(found).length) { setError("Confira os campos indicados."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/candidato/denuncias", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, category, description, ...(evidence.trim() ? { evidence } : {}), ...(evaluationId ? { evaluationId } : {}), reporterFlaggedRisk: risk })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.message || "Não foi possível registrar a denúncia."); setIssues(body.issues ?? {}); return; }
      setSent(body.reportId);
      setTimeout(() => resultRef.current?.focus(), 0);
    } catch { setError("Não foi possível conectar ao serviço. Nada foi enviado; tente novamente."); }
    finally { setBusy(false); }
  }

  if (sent) return <div className="application-result" role="status">
    <h2 ref={resultRef} tabIndex={-1}>Denúncia registrada</h2>
    <p>Recebemos a sua denúncia sobre a vaga {jobTitle}. Ela será analisada pela moderação da plataforma, com meta de até 5 dias úteis. O registro não significa que houve irregularidade: nada muda na vaga até a análise.</p>
    <p>A empresa não recebe o seu nome nem os seus dados. Você acompanha o andamento em Minhas denúncias.</p>
    <p><Link className="text-link" href={`/candidato/denuncias/${sent}`}>Acompanhar a denúncia →</Link></p>
  </div>;

  return <form className="report-form" onSubmit={submit} noValidate>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    <fieldset className="star-field" aria-describedby={issues.category ? `${ids.description}-category` : undefined}>
      <legend>Tipo da situação</legend>
      <div className="report-categories">
        {categories.map((item) => <label key={item.value} className="report-category">
          <input type="radio" name="category" value={item.value} checked={category === item.value} onChange={() => setCategory(item.value)} />
          <span><strong>{item.label}</strong><span className="muted">{item.hint}</span></span>
        </label>)}
      </div>
      {issues.category ? <span className="field-error" id={`${ids.description}-category`}>{issues.category}</span> : null}
    </fieldset>
    <div>
      <label htmlFor={ids.description}><span className="profile-section-title">O que aconteceu</span></label>
      <textarea id={ids.description} rows={6} maxLength={3000} value={description} onChange={(event) => setDescription(event.target.value)}
        aria-invalid={Boolean(issues.description)} aria-describedby={`${ids.description}-hint`} />
      <span className="muted" id={`${ids.description}-hint`}>{`Descreva a situação com o máximo de detalhes que puder (mínimo de 20 caracteres). ${description.length} de 3000.`}</span>
      {issues.description ? <span className="field-error">{issues.description}</span> : null}
    </div>
    <div>
      <label htmlFor={ids.evidence}><span className="profile-section-title">Evidências (opcional)</span></label>
      <textarea id={ids.evidence} rows={3} maxLength={2000} value={evidence} onChange={(event) => setEvidence(event.target.value)} aria-describedby={`${ids.evidence}-hint`} />
      <span className="muted" id={`${ids.evidence}-hint`}>Links ou a descrição de mensagens, fotos ou documentos que você tenha. Não envie laudo médico nem documentos pessoais: eles não são necessários.</span>
      {issues.evidence ? <span className="field-error">{issues.evidence}</span> : null}
    </div>
    {evaluations.length ? <div>
      <label htmlFor={ids.evaluation}><span className="profile-section-title">A denúncia é sobre a entrevista que você avaliou? (opcional)</span></label>
      <select id={ids.evaluation} value={evaluationId} onChange={(event) => setEvaluationId(event.target.value)}>
        <option value="">Não, é sobre a vaga em geral</option>
        {evaluations.map((item) => <option key={item.id} value={item.id}>{`Sim, a entrevista ${item.interviewAt ? `de ${date(item.interviewAt)}` : ""} avaliada em ${date(item.submittedAt)}`}</option>)}
      </select>
    </div> : null}
    <label className="notices-email" htmlFor={ids.risk}>
      <input id={ids.risk} type="checkbox" checked={risk} onChange={(event) => setRisk(event.target.checked)} />
      <span>Há risco à segurança ou à acessibilidade de alguém agora (análise com prioridade)</span>
    </label>
    <p className="muted">{`Vaga: ${jobTitle}, ${companyName}. Até 3 denúncias a cada 24 horas.`}</p>
    <div className="apply-actions">
      <button type="submit" className="primary-button" disabled={busy}>{busy ? "Enviando…" : "Registrar denúncia"}</button>
      <Link className="secondary-button" href={`/candidato/vagas/${jobId}`}>Voltar à vaga</Link>
    </div>
  </form>;
}
