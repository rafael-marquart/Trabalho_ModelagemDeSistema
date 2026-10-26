import Link from "next/link";
import ThemeToggle from "@/components/theme-toggle";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CompanyHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");

  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="entry-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.svg" alt="Acessa Vagas" /></Link>
        <section className="auth-card">
          <p className="eyebrow">Área da empresa</p>
          <h1>Bem-vinda ao Acessa Vagas.</h1>
          <p className="muted">Gerencie os convites e vínculos com recrutadores da sua organização.</p><p className="auth-footer"><Link href="/empresa/recrutadores">Gerenciar recrutadores</Link></p>
          <form action="/api/auth/logout" method="post"><button className="primary-button" type="submit">Sair da conta</button></form>
        </section>
      </div>
    </main>
  );
}