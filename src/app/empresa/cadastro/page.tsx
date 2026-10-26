"use client";

import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { FormEvent, useState } from "react";

export default function CompanySignupPage() {
  const [form,setForm]=useState({legalName:"",tradeName:"",officialId:"",contactEmail:"",password:"",confirmPassword:""});
  const [error,setError]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();setError("");setMessage("");
    if(form.password!==form.confirmPassword){setError("As senhas não coincidem.");return;}
    setLoading(true);
    try{
      const response=await fetch("/api/auth/register/company",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const result=await response.json();
      if(!response.ok){setError(result.message||"Não foi possível enviar o cadastro.");return;}
      setMessage(result.message);
    }catch{setError("Não foi possível conectar ao serviço. Tente novamente.");}
    finally{setLoading(false);}
  }
  return <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div><Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link><section className="auth-card"><Link className="back-link" href="/">← Voltar ao início</Link><p className="eyebrow">Cadastro de empresa</p><h1>Traga sua empresa para a plataforma.</h1><p className="muted">Preencha os dados organizacionais para iniciar o cadastro.</p><form className="auth-form" onSubmit={submit}>
    <label htmlFor="legalName">Razão social</label><input id="legalName" value={form.legalName} onChange={e=>setForm({...form,legalName:e.target.value})} required maxLength={200}/>
    <label htmlFor="tradeName">Nome fantasia (opcional)</label><input id="tradeName" value={form.tradeName} onChange={e=>setForm({...form,tradeName:e.target.value})} maxLength={200}/>
    <label htmlFor="officialId">CNPJ (14 dígitos)</label><input id="officialId" inputMode="numeric" autoComplete="off" value={form.officialId} onChange={e=>setForm({...form,officialId:e.target.value})} required maxLength={18} aria-describedby="cnpj-help"/><p id="cnpj-help" className="muted">Informe os 14 dígitos do CNPJ. O sistema confere apenas a quantidade de dígitos, sem consultar se o CNPJ existe.</p>
    <label htmlFor="contactEmail">E-mail corporativo</label><input id="contactEmail" type="email" autoComplete="email" value={form.contactEmail} onChange={e=>setForm({...form,contactEmail:e.target.value})} required/>
    <label htmlFor="password">Senha</label><input id="password" type="password" autoComplete="new-password" minLength={10} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} required/><p className="muted">Mínimo de 10 caracteres, com maiúscula, minúscula e número.</p>
    <label htmlFor="confirmPassword">Confirmar senha</label><input id="confirmPassword" type="password" autoComplete="new-password" value={form.confirmPassword} onChange={e=>setForm({...form,confirmPassword:e.target.value})} required/>
    {error&&<p className="form-error" role="alert">{error}</p>}{message&&<><p role="status" aria-live="polite">{message}</p><p className="auth-footer">Não recebeu o e-mail? <Link href="/empresa/reenviar-confirmacao">Solicitar novo link de confirmação</Link></p></>}<button className="primary-button" type="submit" disabled={loading}>{loading?"Enviando...":"Enviar cadastro"}</button>
  </form><p className="auth-footer"><Link href="/empresa/login">Já tem uma conta? Entrar</Link></p></section></main>;
}