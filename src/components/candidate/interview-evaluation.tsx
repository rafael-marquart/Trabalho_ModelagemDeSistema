"use client";

import React, { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const starWord = (value: number) => `${value} ${value === 1 ? "estrela" : "estrelas"}`;
const date = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

function StarField({ name, legend, hint, value, onChange, error }: { name: string; legend: string; hint: string; value: number; onChange: (value: number) => void; error?: string }) {
  const hintId = useId();
  const errorId = useId();
  return <fieldset className="star-field" aria-describedby={`${hintId}${error ? ` ${errorId}` : ""}`}>
    <legend>{legend}</legend>
    <p className="muted" id={hintId}>{hint}</p>
    <div className="star-options">
      {[1, 2, 3, 4, 5].map((star) => {
        const id = `${name}-${star}`;
        return <div key={star} className={`star-option${value >= star ? " star-filled" : ""}`}>
          <input type="radio" id={id} name={name} value={star} checked={value === star} onChange={() => onChange(star)} />
          <label htmlFor={id}><span className="star-icon" aria-hidden="true">{value >= star ? "★" : "☆"}</span>{starWord(star)}</label>
        </div>;
      })}
    </div>
    {error ? <span className="field-error" id={errorId}>{error}</span> : null}
  </fieldset>;
}

/**
 * SPEC-018: evaluation of a completed interview — two separate ratings (accessibility and inclusive attitude, 1 to 5
 * stars), an optional comment, a review step and the confirmation. Once sent, it cannot be edited (OPEN-071/072).
 */
export default function InterviewEvaluation({ interviewId, deadline }: { interviewId: string; deadline: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "review" | "sending" | "done">("form");
  const [accessibility, setAccessibility] = useState(0);
  const [inclusion, setInclusion] = useState(0);
  const [comment, setComment] = useState("");
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const commentId = useId();
  const focusHeading = () => setTimeout(() => headingRef.current?.focus(), 0);

  function review() {
    const found: Record<string, string> = {};
    if (!accessibility) found.accessibilityRating = "Escolha de 1 a 5 estrelas para acessibilidade.";
    if (!inclusion) found.inclusionRating = "Escolha de 1 a 5 estrelas para postura inclusiva.";
    if (comment.length > 1000) found.comment = "Use até 1000 caracteres.";
    setIssues(found); setError("");
    if (Object.keys(found).length) { setError("Confira os campos indicados."); return; }
    setStep("review"); focusHeading();
  }

  async function send() {
    setStep("sending"); setError("");
    try {
      const response = await fetch(`/api/candidato/entrevistas/${interviewId}/avaliacao`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accessibilityRating: accessibility, inclusionRating: inclusion, ...(comment.trim() ? { comment } : {}) })
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.message || "Não foi possível enviar a avaliação."); setIssues(body.issues ?? {}); setStep(response.status === 400 ? "form" : "review"); return; }
      setStep("done"); focusHeading(); router.refresh();
    } catch { setError("Não foi possível conectar ao serviço. Nada foi enviado; tente novamente."); setStep("review"); }
  }

  if (step === "done") return <div className="application-result" role="status">
    <h3 ref={headingRef} tabIndex={-1}>Avaliação enviada</h3>
    <p>Obrigado! Sua avaliação foi registrada e não pode ser alterada. A empresa não vê o seu nome nem o seu comentário: só a contagem de estrelas entra na nota pública.</p>
  </div>;

  return <div className="evaluation-form">
    <h3 ref={headingRef} tabIndex={-1}>{step === "form" ? "Avalie o processo seletivo" : "Revise a sua avaliação"}</h3>
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {step === "form" ? <>
      <p className="muted">{`Você pode avaliar até ${date(deadline)}. Depois de enviada, a avaliação não pode ser alterada. Seu nome e seu comentário não são mostrados à empresa nem ao público.`}</p>
      <StarField name={`acc-${interviewId}`} legend="Acessibilidade" hint="Os recursos e as condições de acessibilidade atenderam ao que você precisava?" value={accessibility} onChange={setAccessibility} error={issues.accessibilityRating} />
      <StarField name={`inc-${interviewId}`} legend="Postura inclusiva" hint="A equipe tratou você com respeito e de forma inclusiva durante o processo?" value={inclusion} onChange={setInclusion} error={issues.inclusionRating} />
      <div>
        <label htmlFor={commentId}><span className="profile-section-title">Comentário (opcional)</span></label>
        <textarea id={commentId} rows={4} maxLength={1000} value={comment} onChange={(event) => setComment(event.target.value)} aria-invalid={Boolean(issues.comment)} aria-describedby={`${commentId}-count`} />
        <span className="muted" id={`${commentId}-count`}>{`${comment.length} de 1000 caracteres`}</span>
        {issues.comment ? <span className="field-error">{issues.comment}</span> : null}
      </div>
      <div className="apply-actions"><button type="button" className="primary-button" onClick={review}>Revisar avaliação</button></div>
    </> : <>
      <dl className="evaluation-summary">
        <dt>Acessibilidade</dt><dd>{starWord(accessibility)}</dd>
        <dt>Postura inclusiva</dt><dd>{starWord(inclusion)}</dd>
        <dt>Comentário</dt><dd>{comment.trim() || "Sem comentário"}</dd>
      </dl>
      <div className="apply-actions">
        <button type="button" className="primary-button" disabled={step === "sending"} onClick={send}>{step === "sending" ? "Enviando…" : "Enviar avaliação"}</button>
        <button type="button" className="secondary-button" disabled={step === "sending"} onClick={() => { setStep("form"); focusHeading(); }}>Voltar e corrigir</button>
      </div>
    </>}
  </div>;
}
