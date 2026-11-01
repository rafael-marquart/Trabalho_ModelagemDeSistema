import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import JobEditor from "@/components/jobs/job-editor";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") redirect("/empresa/login");
  return <CompanyShell role="COMPANY" active="jobs" userName={user.fullName}>
    <JobEditor basePath="/empresa/vagas" jobId={id} />
  </CompanyShell>;
}
