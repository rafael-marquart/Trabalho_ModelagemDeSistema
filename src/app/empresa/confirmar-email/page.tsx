"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useEffect, useState } from "react";

export default function ConfirmCompanyEmailPage() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<"ready" | "loading" | "success" | "error">("ready");
  const [message, setMessage] = useState("Selecione o botão abaixo para confirmar o e-mail corporativo.");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const value = new URLSearchParams(window.location.search).get("token") || "";
    setToken(value);
    if (value.length < 20 || value.length > 200) {
      setStatus("error");
      setMessage("O link é inválido ou expirou. Solicite uma nova confirmação.");
    }
  }, []);

  async function confirmEmail() {
    if (submitting || status === "success" || token.length < 20 || token.length > 200) return;
    setSubmitting(true);
    setStatus("loading");
    setMessage("Validando o link de confirmação…");
    try {
      const response = await fetch("/api/auth/company/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });
      const result = await response.json();
      setStatus(response.ok ? "success" : "error");
      setMessage(result.message || "Não foi possível confirmar o e-mail.");
    } catch {
      setStatus("error");
      setMessage("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <Link className="brand auth-brand" href="/">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="confirm-title">
        <p className="eyebrow">Verificação da empresa</p>
        <h1 id="confirm-title">Confirmação de e-mail corporativo</h1>
        <p className={status === "error" ? "form-error" : status === "success" ? "form-success" : "muted"} role={status === "error" ? "alert" : "status"} aria-live="polite">
          {message}
        </p>
        {status !== "success" && token.length >= 20 && token.length <= 200 && (
          <button className="primary-button" type="button" onClick={confirmEmail} disabled={submitting}>
            {submitting ? "Confirmando…" : status === "error" ? "Tentar novamente" : "Confirmar e-mail"}
          </button>
        )}
        {status === "error" && <p className="auth-footer"><Link href="/empresa/reenviar-confirmacao">Solicitar novo link de confirmação</Link></p>}
        {status !== "loading" && <p className="auth-footer"><Link href="/empresa/login">Ir para o acesso da empresa</Link></p>}
      </section>
    </main>
  );
}
