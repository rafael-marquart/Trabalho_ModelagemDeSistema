"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { useEffect, useState } from "react";

export default function ConfirmCompanyEmailPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Validando o link de confirmação…");

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setStatus("error");
      setMessage("O link é inválido ou expirou. Solicite uma nova confirmação.");
      return;
    }

    let cancelled = false;
    fetch("/api/auth/company/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    }).then(async response => {
      const result = await response.json();
      if (cancelled) return;
      setStatus(response.ok ? "success" : "error");
      setMessage(result.message || "Não foi possível confirmar o e-mail.");
    }).catch(() => {
      if (cancelled) return;
      setStatus("error");
      setMessage("Não foi possível conectar ao serviço. Tente novamente.");
    });

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <Link className="brand auth-brand" href="/">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="confirm-title">
        <p className="eyebrow">Verificação da empresa</p>
        <h1 id="confirm-title">Confirmação de e-mail corporativo</h1>
        <p className={status === "error" ? "form-error" : "muted"} role={status === "error" ? "alert" : "status"} aria-live="polite">
          {message}
        </p>
        {status !== "loading" && <p className="auth-footer"><Link href="/empresa/login">Ir para o acesso da empresa</Link></p>}
      </section>
    </main>
  );
}
