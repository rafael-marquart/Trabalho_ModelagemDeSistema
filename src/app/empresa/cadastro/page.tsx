import Link from "next/link";

export default function CompanySignupPage() {
  return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">a</span><span>Acessa<span className="brand-accent">Vagas</span></span></Link><section className="auth-card"><Link className="back-link" href="/">← Voltar ao início</Link><p className="eyebrow">Cadastro de empresa</p><h1>Traga sua empresa para a plataforma.</h1><p className="muted">O cadastro organizacional será implementado na próxima etapa. Ainda não é possível criar uma conta por esta tela.</p><p className="auth-footer"><Link href="/empresa/login">Já tem uma conta? Entrar</Link></p></section></main>;
}