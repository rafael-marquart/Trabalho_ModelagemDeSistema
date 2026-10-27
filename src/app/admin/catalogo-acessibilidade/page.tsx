import Link from "next/link";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth/session";
import CatalogEditor from "./catalog-editor";

export default async function AccessibilityCatalogAdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  return (
    <main className="auth-page">
      <div className="theme-control-host"><ThemeToggle /></div>
      <div className="catalog-admin-content">
        <Link className="brand auth-brand" href="/"><img className="brand-logo" src="/images/logo-acessa-vagas.png" alt="Acessa Vagas" /></Link>
        <Link className="back-link" href="/">← Voltar ao início</Link>
        <form action="/api/auth/logout" method="post"><button className="secondary-button" type="submit">Sair da conta</button></form>
      </div>
      <CatalogEditor />
    </main>
  );
}
