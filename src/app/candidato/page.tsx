import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CandidateHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");

  return (
    <main className="auth-page">
      <div className="entry-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link>
        <section className="auth-card">
          <p className="eyebrow">Área do candidato</p>
          <h1>Olá, {user.fullName}.</h1>
          <p className="muted">Sua sessão está ativa. Esta área será desenvolvida nas próximas etapas da implementação.</p>
          <form action="/api/auth/logout" method="post"><button className="primary-button" type="submit">Sair da conta</button></form>
        </section>
      </div>
    </main>
  );
}