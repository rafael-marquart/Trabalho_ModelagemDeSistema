import Link from "next/link";

export default function CandidateSignupPage() {
  return <main className="auth-page"><Link className="brand auth-brand" href="/"><span className="brand-mark">a</span><span>Acessa<span className="brand-accent">Vagas</span></span></Link><section className="auth-card"><Link className="back-link" href="/">← Voltar ao início</Link><p className="eyebrow">Cadastro de candidato</p><h1>Vamos preparar seu perfil.</h1><p className="muted">O cadastro está na próxima etapa de implementação. Nenhum dado será solicitado até que o fluxo esteja pronto.</p><p className="auth-footer"><Link href="/candidato/login">Já tem uma conta? Entrar</Link></p></section></main>;
}