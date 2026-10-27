import Link from "next/link";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";

export default async function CompanySettingsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return (
    <CompanyShell role="COMPANY" active="settings" userName={user.fullName}>
      <main className="company-content" aria-labelledby="settings-title">
        <header className="company-page-heading">
          <h1 id="settings-title">Configurações</h1>
          <p className="muted">Informações da sua organização.</p>
        </header>
        <div className="company-card-grid">
          <Link className="company-card" href="/empresa/infraestrutura">
            <strong>Infraestrutura de acessibilidade</strong>
            <span className="muted">Registre o que a empresa oferece hoje: rampas, elevadores, sinalização e mais.</span>
          </Link>
        </div>
      </main>
    </CompanyShell>
  );
}
