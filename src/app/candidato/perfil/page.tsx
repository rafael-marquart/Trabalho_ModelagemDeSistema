import Link from "next/link";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";
import ProfileEditor from "./profile-editor";

export default async function CandidateProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  return (
    <main className="auth-page candidate-profile-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="candidate-profile-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
        <Link className="back-link" href="/candidato">← Voltar à área do candidato</Link>
        <header className="candidate-profile-header">
          <p className="eyebrow">Área do candidato</p><h1>Meu perfil</h1>
          <p className="muted">Organize suas informações profissionais e declare, se desejar, suas necessidades de acessibilidade.</p>
        </header>
        <ProfileEditor accountName={user.fullName} accountEmail={user.email} />
      </div>
    </main>
  );
}
