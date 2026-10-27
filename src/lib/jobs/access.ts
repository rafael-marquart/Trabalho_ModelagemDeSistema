import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
export type JobActor =
  | { error: NextResponse; user?: undefined; companyId?: undefined }
  | { error?: undefined; user: SessionUser; companyId: string };

/**
 * Resolves who is acting and for which company. The company account manages its own jobs; a recruiter manages
 * the jobs of the company of its active link. The company never comes from the request.
 */
export async function resolveJobActor(): Promise<JobActor> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "COMPANY" && user.role !== "RECRUITER")) {
    return { error: NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 }) };
  }
  if (!user.isActive) {
    return { error: NextResponse.json({ message: "A conta não está habilitada para gerenciar vagas." }, { status: 403 }) };
  }
  if (user.role === "COMPANY") {
    const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true } });
    if (!company) return { error: NextResponse.json({ message: "A empresa não está habilitada para gerenciar vagas." }, { status: 403 }) };
    return { user, companyId: company.id };
  }
  const link = await prisma.recruiterLink.findFirst({ where: { recruiterId: user.id, active: true }, select: { companyId: true } });
  if (!link) return { error: NextResponse.json({ message: "Você não está vinculado a uma empresa." }, { status: 403 }) };
  return { user, companyId: link.companyId };
}
