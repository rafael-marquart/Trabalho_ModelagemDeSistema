import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { infrastructureCategories, infrastructureItems } from "@/lib/company-infrastructure/items";
import {
  canonicalAnswers, describeChanges, infrastructureInputSchema, normalizeAnswers
} from "@/lib/company-infrastructure/schema";

type CompanyContext =
  | { error: NextResponse; user?: undefined; company?: undefined }
  | { error?: undefined; user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>; company: { id: string } };

async function currentCompany(): Promise<CompanyContext> {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") {
    return { error: NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 }) };
  }
  const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true } });
  if (!company || !user.isActive) {
    return { error: NextResponse.json({ message: "A empresa não está habilitada para registrar infraestrutura." }, { status: 403 }) };
  }
  return { user, company };
}

const catalog = {
  categories: infrastructureCategories,
  items: infrastructureItems.map(({ code, category, label, description, required }) => ({ code, category, label, description, required }))
};

export async function GET() {
  const context = await currentCompany();
  if (context.error) return context.error;
  const record = await prisma.companyInfrastructure.findUnique({
    where: { companyId: context.company.id }, select: { answers: true, updatedAt: true }
  });
  return NextResponse.json({
    catalog, answers: normalizeAnswers(record?.answers), updatedAt: record ? record.updatedAt.toISOString() : null
  });
}

export async function PUT(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const context = await currentCompany();
  if (context.error) return context.error;

  const body = await request.json().catch(() => null);
  const parsed = infrastructureInputSchema.safeParse(body);
  if (!parsed.success) {
    // Issues are keyed by item code so the screen can show each message next to its field.
    const issues: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] === "answers" && typeof issue.path[1] === "string" ? issue.path[1] : "form";
      if (!issues[key]) issues[key] = issue.message;
    }
    return NextResponse.json({ message: "Confira os itens indicados.", issues }, { status: 400 });
  }

  const answers = normalizeAnswers(parsed.data.answers);
  const { user, company } = context;
  const saved = await prisma.$transaction(async (tx) => {
    const previous = await tx.companyInfrastructure.findUnique({
      where: { companyId: company.id }, select: { answers: true }
    });
    const before = previous ? normalizeAnswers(previous.answers) : null;
    const record = await tx.companyInfrastructure.upsert({
      where: { companyId: company.id },
      create: { companyId: company.id, answers },
      update: { answers },
      select: { answers: true, updatedAt: true }
    });
    const changes = describeChanges(before, answers);
    if (!previous || canonicalAnswers(before!) !== canonicalAnswers(answers)) {
      await tx.auditEvent.create({
        data: {
          actorUserId: user.id,
          eventType: previous ? "COMPANY_INFRASTRUCTURE_UPDATED" : "COMPANY_INFRASTRUCTURE_CREATED",
          subjectType: "CompanyInfrastructure", subjectId: company.id,
          // Item codes and change types only; declared values and notes are never copied into the audit trail.
          metadata: { changes, changeCount: changes.length }
        }
      });
    }
    return record;
  });
  return NextResponse.json({ ok: true, catalog, answers: normalizeAnswers(saved.answers), updatedAt: saved.updatedAt.toISOString() });
}
