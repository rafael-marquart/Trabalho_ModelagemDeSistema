import Link from "next/link";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import Icon from "@/components/icons";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export default async function CompanyHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true, tradeName: true, legalName: true } });
  const open = company ? await prisma.job.count({ where: { companyId: company.id, status: "OPEN" } }) : 0;
  const drafts = company ? await prisma.job.count({ where: { companyId: company.id, status: "DRAFT" } }) : 0;

  return (
    <CompanyShell role="COMPANY" active="home" userName={company?.tradeName || company?.legalName || user.fullName}>
      <main className="company-content" aria-labelledby="company-home-title">
        <header className="company-page-heading">
          <p className="eyebrow">Área da empresa</p>
          <h1 id="company-home-title">Bem-vinda ao Acessa Vagas.</h1>
          <p className="muted">Publique vagas, registre a infraestrutura de acessibilidade e gerencie os recrutadores da sua organização.</p>
        </header>
        <div className="company-card-grid">
          <Link className="company-card" href="/empresa/vagas">
            <span className="company-card-number">{open}</span>
            <strong>Vagas publicadas</strong>
            <span className="muted">{drafts} {drafts === 1 ? "rascunho" : "rascunhos"} em preparo</span>
          </Link>
          <Link className="company-card" href="/empresa/vagas/nova">
            <span className="company-card-icon"><Icon name="plus" /></span>
            <strong>Nova vaga</strong>
            <span className="muted">Cadastre uma oportunidade e publique quando estiver pronta.</span>
          </Link>
          <Link className="company-card" href="/empresa/recrutadores">
            <span className="company-card-icon"><Icon name="people" /></span>
            <strong>Recrutadores</strong>
            <span className="muted">Convide pessoas e gerencie quem atua nos processos seletivos.</span>
          </Link>
          <Link className="company-card" href="/empresa/configuracoes">
            <span className="company-card-icon"><Icon name="settings" /></span>
            <strong>Configurações</strong>
            <span className="muted">Infraestrutura de acessibilidade da empresa.</span>
          </Link>
        </div>
      </main>
    </CompanyShell>
  );
}
