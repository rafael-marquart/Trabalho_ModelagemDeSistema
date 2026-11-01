import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import JobEditor from "@/components/jobs/job-editor";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");
  return <CompanyShell role="RECRUITER" active="jobs" userName={user.fullName}>
    <JobEditor basePath="/recrutador/vagas" jobId={id} />
  </CompanyShell>;
}
