"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Applied = { appliedAt: string; stageLabel: string; score: number | null };
const dateTime = (iso: string) => new Date(iso).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(", ", " às ");

/**
 * SPEC-011: "Candidatar-se" opens a confirmation step; the server checks everything again before registering
 * (status, duplicate, critical barrier). A refusal explains why and nothing is created.
 */
export default function ApplyPanel({ jobId, jobTitle, companyName, score }: { jobId: string; jobTitle: string; companyName: string; score: number | null }) {
  const router = useRouter();
  const [step, setStep] = useState<"idle" | "confirm" | "sending">("idle");
  const [error, setError] = useState("");
  const [applied, setApplied] = useState<Applied | null>(null);
  const resultRef = useRef<HTMLHeadingElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  async function submit() {
    setStep("sending"); setError("");
    try {
      const response = await fetch("/api/candidato/candidaturas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) { setError(body.message || "Não foi possível registrar a candidatura. Tente novamente."); setStep("idle"); return; }
      setApplied(body.application as Applied);
      setTimeout(() => resultRef.current?.focus(), 0);
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente."); setStep("idle");
    }
  }

  if (applied) {
    return <div className="apply-result" role="status">
      <h3 ref={resultRef} tabIndex={-1}>Candidatura registrada</h3>
      <p>{`Registrada em ${dateTime(applied.appliedAt)}, na etapa ${applied.stageLabel}, ${applied.score !== null ? `com ${applied.score}% de compatibilidade` : "sem score de compatibilidade calculado"}.`}</p>
    </div>;
  }
  return <div className="apply-panel">
    {error ? <p className="form-error" role="alert">{error}</p> : null}
    {step === "idle" ? <button type="button" className="primary-button" onClick={() => { setStep("confirm"); setTimeout(() => confirmRef.current?.focus(), 0); }}>Candidatar-se</button> : <div className="apply-confirm">
      <p>{`Confirme sua candidatura para ${jobTitle}, em ${companyName}. Ela será registrada ${score !== null ? `com o seu score atual de compatibilidade (${score}%)` : "sem score de compatibilidade, porque faltam dados para calculá-lo"} e começa na etapa Inscrito.`}</p>
      <div className="apply-actions">
        <button ref={confirmRef} type="button" className="primary-button" disabled={step === "sending"} onClick={submit}>{step === "sending" ? "Registrando…" : "Confirmar candidatura"}</button>
        <button type="button" className="secondary-button" disabled={step === "sending"} onClick={() => setStep("idle")}>Voltar</button>
      </div>
    </div>}
  </div>;
}
