import { redirect } from "next/navigation";
import CompanyShell from "@/components/company-shell";
import { getCurrentUser } from "@/lib/auth/session";
import RecruiterDashboardClient from "./recruiter-dashboard-client";

export default async function RecruiterHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");

  return <CompanyShell role="RECRUITER" active="home" userName={user.fullName}>
    <RecruiterDashboardClient />
  </CompanyShell>;
}
