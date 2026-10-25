import Link from "next/link";

export default function PasswordRecoveryPage() {
  return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">a</span><span>Acessa<span className="brand-accent">Vagas</span></span></Link><section className="auth-card"><Link className="back-link" href="/">← Voltar ao início</Link><p className="eyebrow">Segurança da conta</p><h1>Recupere seu acesso.</h1><p className="muted">A recuperação de senha ainda não está ativa. Estamos implementando o fluxo com links de uso único e validade limitada, conforme a especificação.</p><p className="auth-footer"><Link href="/candidato/login">Voltar ao login de candidato</Link></p></section></main>;
}