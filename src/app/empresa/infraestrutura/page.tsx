import Link from "next/link";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";
import InfrastructureEditor from "./infrastructure-editor";

export default async function CompanyInfrastructurePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return (
    <main className="auth-page candidate-profile-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="candidate-profile-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
        <Link className="back-link" href="/empresa">← Voltar à área da empresa</Link>
        <header className="candidate-profile-header">
          <p className="eyebrow">Área da empresa</p><h1>Infraestrutura de acessibilidade</h1>
          <p className="muted">Informe o que a sua organização oferece hoje. O que não for informado permanece como &quot;não informado&quot; e não é interpretado como presença nem como ausência.</p>
        </header>
        <InfrastructureEditor />
      </div>
    </main>
  );
}
