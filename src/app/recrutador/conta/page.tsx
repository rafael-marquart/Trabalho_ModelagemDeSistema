import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import ProfilePhotoEditor from "@/components/profile-photo";
import { getCurrentUser } from "@/lib/auth/session";

/** The recruiter's own account: name, e-mail and profile photo (OPEN-101). */
export default async function RecruiterAccountPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");

  return <CompanyShell role="RECRUITER" active="profile" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="recruiter-account-title">
      <header className="company-page-heading">
        <h1 id="recruiter-account-title">Minha conta</h1>
        <p className="muted">Seus dados de acesso e sua foto.</p>
      </header>
      <div className="candidate-profile-form">
        <section className="profile-section" aria-labelledby="recruiter-account-data">
          <h2 id="recruiter-account-data">Dados da conta</h2>
          <dl className="account-data">
            <div><dt>Nome</dt><dd>{user.fullName}</dd></div>
            <div><dt>E-mail</dt><dd>{user.email}</dd></div>
          </dl>
        </section>
        <ProfilePhotoEditor name={user.fullName} note="Opcional. A foto aparece no topo da sua área de recrutador." />
      </div>
    </main>
  </CompanyShell>;
}
