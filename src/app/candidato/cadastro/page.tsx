"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function CandidateSignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", email: "", cpf: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (form.password !== form.confirmPassword) { setError("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/register/candidate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const result = await response.json();
      if (!response.ok) { setError(result.message || "Não foi possível criar a conta."); return; }
      router.push("/candidato/login?cadastro=sucesso");
    } catch { setError("Não foi possível conectar ao serviço. Tente novamente."); }
    finally { setLoading(false); }
  }

  return <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div><Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link><section className="auth-card"><Link className="back-link" href="/">← Voltar ao início</Link><p className="eyebrow">Cadastro de candidato</p><h1>Vamos preparar seu perfil.</h1><p className="muted">Crie sua conta para começar a explorar oportunidades.</p><form className="auth-form" onSubmit={submit}>
    <label htmlFor="fullName">Nome completo</label><input id="fullName" autoComplete="name" maxLength={160} value={form.fullName} onChange={e=>setForm({...form,fullName:e.target.value})} required />
    <label htmlFor="email">E-mail</label><input id="email" type="email" autoComplete="email" maxLength={254} value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required />
    <label htmlFor="cpf">CPF</label><input id="cpf" inputMode="numeric" autoComplete="off" placeholder="000.000.000-00" value={form.cpf} onChange={e=>setForm({...form,cpf:e.target.value})} required />
    <label htmlFor="password">Senha</label><input id="password" type="password" autoComplete="new-password" minLength={10} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required /><p className="muted">Mínimo de 10 caracteres, com maiúscula, minúscula e número.</p>
    <label htmlFor="confirmPassword">Confirmar senha</label><input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required />
    {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={loading}>{loading?"Criando conta...":"Criar conta"}</button>
  </form><p className="auth-footer">Já tem uma conta? <Link href="/candidato/login">Entrar</Link></p></section></main>;
}