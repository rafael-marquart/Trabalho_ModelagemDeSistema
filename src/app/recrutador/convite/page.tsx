"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterInvitationPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("Carregando convite…");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    setMessage(value ? "Aceite ou recuse o convite. Se ainda não estiver conectado, você será encaminhado ao acesso de recrutador." : "O link do convite está ausente ou inválido.");
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
      if (response.status === 401) {
        const loginUrl = new URL("/recrutador/login", window.location.origin);
        loginUrl.searchParams.set("token", token);
        loginUrl.searchParams.set("action", action);
        router.push(loginUrl.pathname + loginUrl.search);
        return;
      }
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
