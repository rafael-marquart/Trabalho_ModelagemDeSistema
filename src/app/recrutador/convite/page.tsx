"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function RecruiterInvitationPage() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Carregando convite…");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    setMessage(value ? "Entre na sua conta de recrutador para aceitar ou recusar o convite." : "O link do convite está ausente ou inválido.");
    setError(!value);
  }, []);

  async function respond(action: "accept" | "refuse") {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/recruiter/invitations/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, action })
      });
      const result = await response.json();
      setMessage(result.message || "Não foi possível responder ao convite.");
      setError(!response.ok);
    } catch {
      setMessage("Não foi possível conectar ao serviço. Tente novamente.");
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="invitation-title">
        <p className="eyebrow">Vínculo organizacional</p>
        <h1 id="invitation-title">Convite para recrutador</h1>
        <p className={error ? "form-error" : "muted"} role={error ? "alert" : "status"} aria-live="polite">{message}</p>
        {token && <div className="auth-form">
          <button className="primary-button" disabled={loading} onClick={() => respond("accept")}>{loading ? "Processando…" : "Aceitar convite"}</button>
          <button className="secondary-button" disabled={loading} onClick={() => respond("refuse")}>Recusar convite</button>
        </div>}
        <p className="auth-footer"><Link href="/recrutador/login">Entrar como recrutador</Link></p>
      </section>
    </main>
  );
}
