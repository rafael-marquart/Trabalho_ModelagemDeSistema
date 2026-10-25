"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useState, type FormEvent } from "react";

export default function ResendCompanyVerificationPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function requestConfirmation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/company/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Não foi possível solicitar um novo link.");
        return;
      }
      setMessage(result.message);
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <Link className="brand auth-brand" href="/" aria-label="Acessa Vagas — início">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="resend-title">
        <Link className="back-link" href="/empresa/login">← Voltar ao acesso da empresa</Link>
        <p className="eyebrow">Verificação da empresa</p>
        <h1 id="resend-title">Solicitar novo link de confirmação</h1>
        <p className="muted">
          Informe o e-mail corporativo usado no cadastro. Se houver uma conta empresarial pendente, enviaremos um novo link e invalidaremos o anterior.
        </p>
        <form className="auth-form" onSubmit={requestConfirmation}>
          <label htmlFor="company-email">E-mail corporativo</label>
          <input
            id="company-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            required
            maxLength={254}
          />
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Solicitando..." : "Enviar novo link"}
          </button>
        </form>
        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p className="muted" role="status" aria-live="polite">{message}</p>}
      </section>
    </main>
  );
}
