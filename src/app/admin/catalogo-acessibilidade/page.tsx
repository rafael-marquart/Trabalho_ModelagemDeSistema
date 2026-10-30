import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import CatalogEditor from "./catalog-editor";

export default async function AccessibilityCatalogAdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  return <CompanyShell role="ADMIN" active="catalog" userName={user.fullName}>
    <main className="company-content">
      <CatalogEditor />
    </main>
  </CompanyShell>;
}
