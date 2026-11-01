import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import NotificationsCenter from "@/components/notifications/notifications-center";
import { getCurrentUser } from "@/lib/auth/session";

/** SPEC-017 (decision of 01/11/2026): notices inside the site. */
export default async function NotificationsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");
  return <CompanyShell role="RECRUITER" active="notifications" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="notices-title">
      <header className="company-page-heading">
        <div>
          <h1 id="notices-title">Notificações</h1>
          <p className="muted">Avisos sobre as candidaturas. A situação oficial está sempre na página indicada em cada aviso.</p>
        </div>
      </header>
      <NotificationsCenter />
    </main>
  </CompanyShell>;
}
