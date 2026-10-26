import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import RecruiterDashboardClient from "./recruiter-dashboard-client";

export default async function RecruiterHomePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") redirect("/recrutador/login");

  return <RecruiterDashboardClient />;
}
