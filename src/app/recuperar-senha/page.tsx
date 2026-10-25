"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Profile = "candidate" | "company";

export default function PasswordRecoveryPage() {
  const [token, setToken] = useState("");
  const [profile, setProfile] = useState<Profile>("candidate");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get("token") || "");
  }, []);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, identifier })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Não foi possível solicitar a recuperação.");
        return;
      }
      setMessage(result.message);
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword })
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.message || "Não foi possível redefinir a senha.");
        return;
      }
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
    } catch {
      setError("Não foi possível conectar ao serviço. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <Link className="brand auth-brand" href="/" aria-label="Acessa Vagas — início">
        <img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" />
      </Link>
      <section className="auth-card" aria-labelledby="recovery-title">
        <Link className="back-link" href="/">← Voltar ao início</Link>
        <p className="eyebrow">Segurança da conta</p>
        <h1 id="recovery-title">{token ? "Defina uma nova senha." : "Recupere seu acesso."}</h1>
        <p className="muted">
          {token
            ? "O link de recuperação é válido por 30 minutos e pode ser usado uma única vez."
            : "Informe os dados da sua conta. Se ela for elegível, enviaremos as instruções ao e-mail cadastrado."}
        </p>

        {token ? (
          <form className="auth-form" onSubmit={resetPassword}>
            <label htmlFor="password">Nova senha</label>
            <input id="password" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={password} onChange={event => setPassword(event.target.value)} required />
            <p className="muted">Mínimo de 10 caracteres, com maiúscula, minúscula e número.</p>
            <label htmlFor="confirmPassword">Confirmar nova senha</label>
            <input id="confirmPassword" type="password" autoComplete="new-password" minLength={10} maxLength={128} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
            <button className="primary-button" type="submit" disabled={loading}>{loading ? "Redefinindo..." : "Redefinir senha"}</button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={requestReset}>
            <label htmlFor="profile">Tipo de conta</label>
            <select id="profile" value={profile} onChange={event => setProfile(event.target.value as Profile)}>
              <option value="candidate">Candidato</option>
              <option value="company">Empresa</option>
            </select>
            <label htmlFor="identifier">{profile === "candidate" ? "E-mail ou CPF" : "E-mail"}</label>
            <input id="identifier" autoComplete="username" value={identifier} onChange={event => setIdentifier(event.target.value)} required maxLength={160} />
            <button className="primary-button" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar instruções"}</button>
          </form>
        )}

        {error && <p className="form-error" role="alert">{error}</p>}
        {message && <p role="status" aria-live="polite">{message}</p>}
        <p className="auth-footer"><Link href={token ? "/candidato/login" : "/candidato/login"}>Voltar ao login</Link></p>
      </section>
    </main>
  );
}
