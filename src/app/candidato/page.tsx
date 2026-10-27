import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CandidateHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="entry-content candidate-home-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
        <section className="auth-card candidate-home-card">
          <p className="eyebrow">Área do candidato</p><h1>Olá, {user.fullName}.</h1>
          <p className="muted">Mantenha seu perfil atualizado para registrar sua formação, competências, experiências e necessidades de acessibilidade.</p>
          <div className="candidate-home-actions">
            <Link className="primary-button candidate-profile-link" href="/candidato/perfil">Gerenciar meu perfil <span aria-hidden="true">→</span></Link>
            <form action="/api/auth/logout" method="post"><button className="secondary-button" type="submit">Sair da conta</button></form>
          </div>
        </section>
      </div>
    </main>
  );
}
