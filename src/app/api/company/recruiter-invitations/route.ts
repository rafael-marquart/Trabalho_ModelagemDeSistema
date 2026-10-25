import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";

const schema = z.object({ email: z.string().trim().email().max(254) });
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true } });
  if (!company || !user.isActive) return NextResponse.json({ message: "A empresa não está habilitada para gerenciar recrutadores." }, { status: 403 });
  const now = new Date();
  const expired = await prisma.recruiterInvitation.findMany({ where: { companyId: company.id, status: "PENDING", expiresAt: { lte: now } }, select: { id: true } });
  for (const invitation of expired) {
    await prisma.$transaction(async tx => {
      const changed = await tx.recruiterInvitation.updateMany({
        where: { id: invitation.id, companyId: company.id, status: "PENDING", expiresAt: { lte: now } },
        data: { status: "EXPIRED", respondedAt: now }
      });
      if (changed.count === 1) {
        await tx.auditEvent.create({
          data: { actorUserId: user.id, eventType: "RECRUITER_INVITATION_EXPIRED", subjectType: "RecruiterInvitation", subjectId: invitation.id }
        });
      }
    });
  }
  const invitations = await prisma.recruiterInvitation.findMany({
    where: { companyId: company.id },
    select: { id: true, status: true, expiresAt: true, createdAt: true, respondedAt: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json({ invitations });
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true, legalName: true } });
  if (!company || !user.isActive) return NextResponse.json({ message: "A empresa não está habilitada para gerenciar recrutadores." }, { status: 403 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Informe um e-mail válido." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const recipient = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } });
  if (!recipient || recipient.role !== "RECRUITER") {
    return NextResponse.json({ message: "Se o e-mail corresponder a uma conta de recrutador elegível, o convite será processado." }, { status: 202 });
  }
  const activeLink = await prisma.recruiterLink.findFirst({ where: { recruiterId: recipient.id, active: true }, select: { id: true } });
  if (activeLink) return NextResponse.json({ message: "Este recrutador já possui vínculo ativo." }, { status: 409 });

  const { token, tokenHash } = createOneTimeToken();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS);
  // Serialize sends for this company/recipient pair. Without the advisory lock,
  // simultaneous requests can both observe no pending invite and create duplicates.
  const invitationResult = await prisma.$transaction(async (tx) => {
    const lockKey = `recruiter-invitation:${company.id}:${recipient.id}`;
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;

    const now = new Date();
    const expiredInvitations = await tx.recruiterInvitation.findMany({
      where: {
        companyId: company.id,
        recipientUserId: recipient.id,
        status: "PENDING",
        expiresAt: { lte: now }
      },
      select: { id: true }
    });

    for (const expiredInvitation of expiredInvitations) {
      const expired = await tx.recruiterInvitation.updateMany({
        where: {
          id: expiredInvitation.id,
          status: "PENDING",
          expiresAt: { lte: now }
        },
        data: { status: "EXPIRED", respondedAt: now }
      });

      if (expired.count === 1) {
        await tx.auditEvent.create({
          data: {
            actorUserId: user.id,
            eventType: "RECRUITER_INVITATION_EXPIRED",
            subjectType: "RecruiterInvitation",
            subjectId: expiredInvitation.id
          }
        });
      }
    }

    const pending = await tx.recruiterInvitation.findFirst({
      where: { companyId: company.id, recipientUserId: recipient.id, status: "PENDING", expiresAt: { gt: now } },
      orderBy: { createdAt: "desc" }
    });
    const invitation = pending
      ? await tx.recruiterInvitation.update({ where: { id: pending.id }, data: { tokenHash, expiresAt, sentByUserId: user.id, respondedAt: null }, select: { id: true } })
      : await tx.recruiterInvitation.create({ data: { companyId: company.id, recipientUserId: recipient.id, sentByUserId: user.id, tokenHash, expiresAt }, select: { id: true } });

    await tx.auditEvent.create({
      data: { actorUserId: user.id, eventType: pending ? "RECRUITER_INVITATION_RESENT" : "RECRUITER_INVITATION_SENT", subjectType: "RecruiterInvitation", subjectId: invitation.id }
    });
    return { invitation, wasResent: Boolean(pending) };
  });
  const { invitation, wasResent } = invitationResult;
  const baseUrl = getPublicBaseUrl(request);
  try {
    if (!baseUrl) throw new Error("APP_BASE_URL is required to send production email links");
    await sendEmail({
      to: recipient.email,
      subject: "Convite para se vincular a uma empresa — Acessa Vagas",
      text: `A empresa ${company.legalName} convidou você para se vincular à organização. Aceite ou recuse em até 7 dias: ${baseUrl}/recrutador/convite?token=${token}\n\nSe você não esperava este convite, pode recusá-lo ou ignorar esta mensagem.`
    });
  } catch {
    const failedAt = new Date();
    const cancellationApplied = await prisma.$transaction(async tx => {
      // Guard by tokenHash as well as status: a stale failed send must not cancel a newer resend.
      const changed = await tx.recruiterInvitation.updateMany({
        where: { id: invitation.id, tokenHash, status: "PENDING" },
        data: { status: "CANCELLED", respondedAt: failedAt }
      });
      if (changed.count === 1) {
        await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "RECRUITER_INVITATION_DELIVERY_FAILED", subjectType: "RecruiterInvitation", subjectId: invitation.id } });
        await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "RECRUITER_INVITATION_CANCELLED_AFTER_DELIVERY_FAILURE", subjectType: "RecruiterInvitation", subjectId: invitation.id } });
      }
      return changed.count === 1;
    });
    return NextResponse.json({
      message: cancellationApplied
        ? "Não foi possível enviar o e-mail; o convite foi cancelado. Tente enviar novamente."
        : "Não foi possível confirmar a entrega deste e-mail. Verifique a lista de convites antes de tentar novamente."
    }, { status: 502 });
  }
  return NextResponse.json({ ok: true, message: wasResent ? "Convite reenviado; o link anterior foi invalidado." : "Convite enviado." }, { status: wasResent ? 200 : 201 });
}
