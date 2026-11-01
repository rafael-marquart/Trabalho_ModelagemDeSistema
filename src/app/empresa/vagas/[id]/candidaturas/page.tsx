import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import FunnelBoard from "@/components/applications/funnel-board";
import { getCurrentUser } from "@/lib/auth/session";

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return <CompanyShell role="COMPANY" active="jobs" userName={user.fullName}>
    <FunnelBoard basePath="/empresa/vagas" jobId={id} />
  </CompanyShell>;
}
