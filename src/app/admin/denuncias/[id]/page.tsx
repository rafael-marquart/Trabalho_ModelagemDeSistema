import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import ModerationDetail from "@/components/reports/moderation-detail";
import { getCurrentUser } from "@/lib/auth/session";

/** SPEC-020: analysis and decision of one report. */
export default async function ModerationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");
  const { id } = await params;
  return <CompanyShell role="ADMIN" active="reports" userName={user.fullName}>
    <ModerationDetail reportId={id} />
  </CompanyShell>;
}
