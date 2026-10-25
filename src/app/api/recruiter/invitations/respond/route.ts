import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { hashOneTimeToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

const schema = z.object({ token: z.string().min(20).max(200), action: z.enum(["accept", "refuse"]) });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "RECRUITER") return NextResponse.json({ message: "Entre na conta de recrutador para responder ao convite." }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Convite inválido ou expirado." }, { status: 400 });
  const now = new Date();
  const tokenHash = hashOneTimeToken(parsed.data.token);
  const invitation = await prisma.recruiterInvitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.recipientUserId !== user.id || invitation.status !== "PENDING") {
    return NextResponse.json({ message: "Convite inválido, já respondido ou destinado a outra conta." }, { status: 400 });
  }
  if (invitation.expiresAt <= now) {
    await prisma.recruiterInvitation.updateMany({ where: { id: invitation.id, status: "PENDING", expiresAt: { lte: now } }, data: { status: "EXPIRED", respondedAt: now } });
    return NextResponse.json({ message: "Convite expirado. Peça à empresa que envie outro." }, { status: 400 });
  }

  const outcome = await prisma.$transaction(async tx => {
    const claimed = await tx.recruiterInvitation.updateMany({
      where: { id: invitation.id, recipientUserId: user.id, status: "PENDING", expiresAt: { gt: now }, tokenHash },
      data: { status: parsed.data.action === "accept" ? "ACCEPTED" : "REFUSED", respondedAt: now }
    });
    if (claimed.count !== 1) return false;
    if (parsed.data.action === "accept") {
      const active = await tx.recruiterLink.findFirst({ where: { recruiterId: user.id, active: true }, select: { id: true } });
      if (active) throw new Error("RECRUITER_ALREADY_LINKED");
      const company = await tx.company.findUnique({ where: { id: invitation.companyId }, select: { accountUser: { select: { isActive: true } } } });
      if (!company || !company.accountUser.isActive) throw new Error("COMPANY_NOT_ACTIVE");
      await tx.recruiterLink.create({ data: { companyId: invitation.companyId, recruiterId: user.id } });
    }
    await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: parsed.data.action === "accept" ? "RECRUITER_INVITATION_ACCEPTED" : "RECRUITER_INVITATION_REFUSED", subjectType: "RecruiterInvitation", subjectId: invitation.id } });
    return true;
  }).catch(error => {
    if (error instanceof Error && ["RECRUITER_ALREADY_LINKED", "COMPANY_NOT_ACTIVE"].includes(error.message)) return error.message;
    throw error;
  });

  if (outcome === "RECRUITER_ALREADY_LINKED") return NextResponse.json({ message: "Você já possui vínculo ativo com outra empresa." }, { status: 409 });
  if (outcome === "COMPANY_NOT_ACTIVE") return NextResponse.json({ message: "A empresa não está habilitada." }, { status: 409 });
  if (!outcome) return NextResponse.json({ message: "O convite deixou de ser válido." }, { status: 409 });
  return NextResponse.json({ ok: true, message: parsed.data.action === "accept" ? "Convite aceito e vínculo criado." : "Convite recusado." });
}
