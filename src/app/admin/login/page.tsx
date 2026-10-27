"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";

// Intentionally not linked from the public entry screens: the approved prototypes
// do not offer a public administrator login. Access is by direct URL only.
export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: "admin", identifier, password, rememberMe: false })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Não foi possível entrar. Tente novamente.");
        return;
      }
      router.push(result.redirectTo);
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="entry-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
        <section className="auth-card">
          <p className="eyebrow">Acesso restrito</p>
          <h1>Administração</h1>
          <p className="muted">Entre com a conta de administrador da plataforma.</p>
          <form className="auth-form" onSubmit={handleSubmit}>
            <label htmlFor="identifier">E-mail</label>
            <input id="identifier" type="email" autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required />
            <label htmlFor="password">Senha</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="primary-button" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar  →"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
