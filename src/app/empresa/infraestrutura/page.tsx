import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import InfrastructureEditor from "./infrastructure-editor";

export default async function CompanyInfrastructurePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return (
    <CompanyShell role="COMPANY" active="settings" userName={user.fullName}>
      <main id="conteudo" className="company-content" aria-labelledby="infrastructure-title">
        <header className="company-page-heading">
          <h1 id="infrastructure-title">Infraestrutura de acessibilidade</h1>
          <p className="muted">Informe o que a sua organização oferece hoje. O que não for informado permanece como &quot;não informado&quot; e não é interpretado como presença nem como ausência.</p>
        </header>
        <InfrastructureEditor />
      </main>
    </CompanyShell>
  );
}
