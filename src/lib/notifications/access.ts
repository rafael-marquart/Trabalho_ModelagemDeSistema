import { getCurrentUser } from "@/lib/auth/session";

/** People who receive notices: candidates, company accounts and recruiters (the admin area has none). */
export async function noticeRecipient() {
  const user = await getCurrentUser();
  if (!user || !user.isActive || !["CANDIDATE", "COMPANY", "RECRUITER"].includes(user.role)) return null;
  return user;
}
