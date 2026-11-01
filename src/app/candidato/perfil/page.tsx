import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import ProfileEditor from "./profile-editor";

export default async function CandidateProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") redirect("/candidato/login");
  return <CompanyShell role="CANDIDATE" active="profile" userName={user.fullName}>
    <main id="conteudo" className="company-content candidate-profile-content" aria-labelledby="candidate-profile-title">
      <header className="company-page-heading candidate-profile-header">
        <p className="eyebrow">Área do candidato</p><h1 id="candidate-profile-title">Meu perfil</h1>
        <p className="muted">Organize suas informações profissionais e declare, se desejar, suas necessidades de acessibilidade.</p>
      </header>
      <ProfileEditor accountName={user.fullName} accountEmail={user.email} />
    </main>
  </CompanyShell>;
}
