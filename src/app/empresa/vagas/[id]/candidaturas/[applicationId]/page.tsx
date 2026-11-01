import React from "react";
import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import ApplicationDetail from "@/components/applications/application-detail";
import { getCurrentUser } from "@/lib/auth/session";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string; applicationId: string }> }) {
  const { id, applicationId } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return <CompanyShell role="COMPANY" active="jobs" userName={user.fullName}>
    <ApplicationDetail basePath="/empresa/vagas" jobId={id} applicationId={applicationId} />
  </CompanyShell>;
}
