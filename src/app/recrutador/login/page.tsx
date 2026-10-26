"use client";
import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecruiterLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile: "recruiter", identifier, password, rememberMe: false }) });
      const result = await response.json();
      if (!response.ok) { setError(result.message || "Não foi possível entrar."); return; }

      const currentParams = new URLSearchParams(window.location.search);
      const token = currentParams.get("token") || "";
      const action = currentParams.get("action");
      if (token.length >= 20 && token.length <= 200 && (action === "accept" || action === "refuse")) {
        const invitationUrl = new URLSearchParams({ token, action });
        router.push("/recrutador/convite?" + invitationUrl.toString());
      } else {
        router.push(result.redirectTo);
      }
      router.refresh();
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setLoading(false); }
  }
  return <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
    
    <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
    <section className="auth-card" aria-labelledby="recruiter-login-title">
      <Link className="back-link" href="/">← Voltar ao início</Link>
      <p className="eyebrow">Área do recrutador</p><h1 id="recruiter-login-title">Acesse sua conta de recrutador.</h1>
      <p className="muted">Entre para responder aos convites de vínculo com empresas.</p>
      <form className="auth-form" onSubmit={submit}>
        <label htmlFor="identifier">E-mail</label><input id="identifier" type="email" autoComplete="username" value={identifier} onChange={e => setIdentifier(e.target.value)} required />
        <label htmlFor="password">Senha</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="primary-button" type="submit" disabled={loading}>{loading ? "Entrando…" : "Entrar"}</button>
      </form>
    </section>
  </main>;
}
