import Link from "next/link";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";
import CompatibilityPanel from "./compatibility-panel";

export default async function CandidateCompatibilityPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  return (
    <main className="auth-page candidate-profile-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="candidate-profile-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
        <Link className="back-link" href="/candidato">← Voltar à área do candidato</Link>
        <header className="candidate-profile-header">
          <p className="eyebrow">Área do candidato</p><h1>Compatibilidade com vagas</h1>
          <p className="muted">Tela provisória para conferir o cálculo. A busca e a página da vaga com o resultado completo virão nas próximas etapas.</p>
        </header>
        <CompatibilityPanel />
      </div>
    </main>
  );
}
