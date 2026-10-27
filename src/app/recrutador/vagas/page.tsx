import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import JobsPanel from "@/components/jobs/jobs-panel";

export default async function JobsPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");
  return <CompanyShell role="RECRUITER" active="jobs" userName={user.fullName}>
    <JobsPanel basePath="/recrutador/vagas" />
  </CompanyShell>;
}
