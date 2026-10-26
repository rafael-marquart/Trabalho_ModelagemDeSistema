import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RecruiterHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");
  return <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
    <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link>
    <section className="auth-card">
      <p className="eyebrow">Área do recrutador</p>
      <h1>Bem-vindo(a) ao Acessa Vagas.</h1>
      <p className="muted">Use o link recebido por e-mail para revisar, aceitar ou recusar um convite de vínculo com uma empresa.</p>
      <form action="/api/auth/logout" method="post"><button className="primary-button" type="submit">Sair da conta</button></form>
    </section>
  </main>;
}
