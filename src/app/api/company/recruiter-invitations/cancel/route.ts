import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { prisma } from "@/lib/prisma";

const schema = z.object({ invitationId: z.string().min(1).max(100) });

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Convite inválido." }, { status: 400 });
  const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true } });
  if (!company || !user.isActive) return NextResponse.json({ message: "A empresa não está habilitada para gerenciar recrutadores." }, { status: 403 });
  const now = new Date();
  const changed = await prisma.$transaction(async tx => {
    const updated = await tx.recruiterInvitation.updateMany({
      where: { id: parsed.data.invitationId, companyId: company.id, status: "PENDING", expiresAt: { gt: now } },
      data: { status: "CANCELLED", respondedAt: now }
    });
    if (updated.count !== 1) return false;
    await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "RECRUITER_INVITATION_CANCELLED", subjectType: "RecruiterInvitation", subjectId: parsed.data.invitationId } });
    return true;
  });
  if (!changed) return NextResponse.json({ message: "Convite não encontrado ou não está mais pendente." }, { status: 409 });
  return NextResponse.json({ ok: true, message: "Convite cancelado." });
}
