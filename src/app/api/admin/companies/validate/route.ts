import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const schema = z.object({ companyId: z.string().min(1).max(128), decision: z.literal("approve") });

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const actor = await getCurrentUser();
  if (!actor || actor.role !== "ADMIN" || !actor.isActive) {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Informe uma empresa válida para revisão." }, { status: 400 });

  const now = new Date();
  const outcome = await prisma.$transaction(async tx => {
    const company = await tx.company.findUnique({
      where: { id: parsed.data.companyId },
      select: { id: true, officialId: true, emailConfirmedAt: true, officialIdValidatedAt: true, accountUserId: true }
    });
    if (!company) return "NOT_FOUND" as const;
    if (!company.emailConfirmedAt) return "EMAIL_NOT_CONFIRMED" as const;
    if (company.officialIdValidatedAt) return "ALREADY_VALIDATED" as const;

    const updated = await tx.company.updateMany({
      where: { id: company.id, emailConfirmedAt: { not: null }, officialIdValidatedAt: null },
      data: { officialIdValidatedAt: now, officialIdValidatedBy: actor.id }
    });
    if (updated.count !== 1) return "STALE" as const;

    await tx.user.updateMany({
      where: { id: company.accountUserId, role: "COMPANY", isActive: false },
      data: { isActive: true }
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: actor.id,
        eventType: "ADMIN_COMPANY_OFFICIAL_ID_VALIDATED",
        subjectType: "Company",
        subjectId: company.id,
        metadata: { officialIdSuffix: company.officialId.slice(-4) }
      }
    });
    return "OK" as const;
  });

  if (outcome === "NOT_FOUND") return NextResponse.json({ message: "Empresa não encontrada." }, { status: 404 });
  if (outcome === "EMAIL_NOT_CONFIRMED") return NextResponse.json({ message: "O e-mail corporativo deve ser confirmado antes da validação do CNPJ." }, { status: 409 });
  if (outcome === "ALREADY_VALIDATED") return NextResponse.json({ message: "O CNPJ desta empresa já foi validado." }, { status: 409 });
  if (outcome !== "OK") return NextResponse.json({ message: "A empresa foi alterada por outra operação. Atualize e tente novamente." }, { status: 409 });
  return NextResponse.json({ ok: true, message: "CNPJ validado e conta empresarial ativada." });
}
