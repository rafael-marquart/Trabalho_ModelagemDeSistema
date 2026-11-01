import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import ModerationQueue from "@/components/reports/moderation-queue";
import { getCurrentUser } from "@/lib/auth/session";

/** SPEC-020: moderation queue for the platform administrator. */
export default async function ModerationQueuePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  return <CompanyShell role="ADMIN" active="reports" userName={user.fullName}>
    <main id="conteudo" className="company-content" aria-labelledby="queue-title">
      <header className="company-page-heading"><div>
        <h1 id="queue-title">Denúncias</h1>
        <p className="muted">Prioridade alta primeiro, depois as mais antigas. Meta de análise: 5 dias úteis a partir do registro.</p>
      </div></header>
      <ModerationQueue />
    </main>
  </CompanyShell>;
}
