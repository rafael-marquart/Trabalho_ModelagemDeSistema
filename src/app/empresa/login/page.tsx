"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthSplitLayout from "@/components/auth-split-layout";

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
    <AuthSplitLayout
      profile="company"
      eyebrow="Área da empresa"
      title="Entrar como empresa"
      description="Publique vagas e acompanhe seus processos seletivos."
      footer={<p className="auth-footer">Ainda não cadastrou sua empresa? <Link href="/empresa/cadastro">Cadastrar empresa</Link></p>}
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="identifier">E-mail corporativo</label>
        <input id="identifier" type="email" autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required />
        <label htmlFor="password">Senha</label>
        <input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
        <div className="form-options">
          <label className="checkbox-label"><input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} /> Manter conectado</label>
          <Link href="/recuperar-senha">Esqueci minha senha</Link>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Entrando..." : "Entrar na plataforma"}</button>
      </form>
    </AuthSplitLayout>
  );
}
