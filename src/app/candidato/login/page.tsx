"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CandidateLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
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
        body: JSON.stringify({ profile: "candidate", identifier, password, rememberMe })
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
      <Link className="brand auth-brand" href="/">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="back-link" href="/">← Voltar ao início</Link>
        <p className="eyebrow">Área do candidato</p>
        <h1 id="login-title">Que bom ter você de volta.</h1>
        <p className="muted">Entre para acompanhar suas oportunidades.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="identifier">E-mail ou CPF</label>
          <input id="identifier" autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required />
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <div className="form-options">
            <label className="checkbox-label"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} /> Manter conectado</label>
            <Link href="/recuperar-senha">Esqueci minha senha</Link>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <p className="auth-footer">Ainda não tem uma conta? <Link href="/candidato/cadastro">Cadastre-se</Link></p>
      </section>
    </main>
  );
}