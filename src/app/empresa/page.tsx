import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CompanyHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");

  return (
    <main className="auth-page">
      <div className="entry-content">
        <Link className="brand auth-brand" href="/"><span className="brand-mark">a</span><span>Acessa<span className="brand-accent">Vagas</span></span></Link>
        <section className="auth-card">
          <p className="eyebrow">Área da empresa</p>
          <h1>Bem-vinda ao Acessa Vagas.</h1>
          <p className="muted">Sua sessão está ativa. O painel da empresa será desenvolvido nas próximas etapas da implementação.</p>
          <form action="/api/auth/logout" method="post"><button className="primary-button" type="submit">Sair da conta</button></form>
        </section>
      </div>
    </main>
  );
}