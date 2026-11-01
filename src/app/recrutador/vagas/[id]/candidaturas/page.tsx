import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import FunnelBoard from "@/components/applications/funnel-board";
import { getCurrentUser } from "@/lib/auth/session";

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");
  return <CompanyShell role="RECRUITER" active="jobs" userName={user.fullName}>
    <FunnelBoard basePath="/recrutador/vagas" jobId={id} />
  </CompanyShell>;
}
