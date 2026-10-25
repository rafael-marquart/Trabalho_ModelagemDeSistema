"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CompanyLoginPage() {
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
        body: JSON.stringify({ profile: "company", identifier, password, rememberMe })
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
      
      <Link className="brand auth-brand" href="/">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="login-title">
        <Link className="back-link" href="/">← Voltar ao início</Link>
        <p className="eyebrow">Área da empresa</p>
        <h1 id="login-title">Vamos encontrar novos talentos.</h1>
        <p className="muted">Entre para gerenciar sua organização e suas vagas.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="identifier">E-mail</label>
          <input id="identifier" type="email" autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required />
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
          <div className="form-options">
            <label className="checkbox-label"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} /> Manter conectado</label>
            <Link href="/recuperar-senha">Esqueci minha senha</Link>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="primary-button" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar"}</button>
        </form>
        <p className="auth-footer">Ainda não cadastrou sua empresa? <Link href="/empresa/cadastro">Cadastre-se</Link></p>
      </section>
    </main>
  );
}