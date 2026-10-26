import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { randomBytes } from "node:crypto";
import { sendEmail } from "@/lib/email";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";

const schema = z.object({ email: z.string().trim().email().max(254), fullName: z.string().trim().min(2).max(160) });
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
const genericMessage = "Se os dados corresponderem a um recrutador elegível, as instruções serão enviadas ao e-mail informado.";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const company = await prisma.company.findUnique({ where: { accountUserId: user.id }, select: { id: true } });
  if (!company || !user.isActive) return NextResponse.json({ message: "A empresa não está habilitada para gerenciar recrutadores." }, { status: 403 });
  const now = new Date();
  const records = await prisma.recruiterInvitation.findMany({
    where: { companyId: company.id },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      createdAt: true,
      respondedAt: true,
      recipientName: true,
      recipientEmail: true
    },
    orderBy: { createdAt: "desc" }
  });
  // GET is read-only: expose expired pending invitations as EXPIRED in the
  // response without mutating state or writing audit events during a read.
  // State transitions and their audit events happen in explicit write flows.
  // Return the name/email snapshot entered by the inviting company, not live
  // personal data from the recipient account.
  const invitations = records.map(({ recipientName, recipientEmail, ...invitation }) => ({
    ...invitation,
    recipient: { fullName: recipientName, email: recipientEmail },
    status: invitation.status === "PENDING" && invitation.expiresAt <= now
      ? "EXPIRED"
      : invitation.status
  }));
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
  if (!parsed.success) return NextResponse.json({ message: "Informe nome e e-mail válidos para o recrutador." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  let recipient = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, role: true, isActive: true, pendingActivation: true }
  });

  const recordNeutralRequest = async () => {
    const { tokenHash } = createOneTimeToken();
    const expiresAt = new Date(Date.now() + SEVEN_DAYS);
    await prisma.$transaction(async tx => {
      const lockKey = "recruiter-invitation-request:" + company.id + ":" + email;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
      const existing = await tx.recruiterInvitation.findFirst({
        where: { companyId: company.id, recipientEmail: email, recipientUserId: null, status: "PENDING", expiresAt: { gt: new Date() } },
        select: { id: true }
      });
      if (existing) {
        await tx.recruiterInvitation.update({ where: { id: existing.id }, data: { tokenHash, expiresAt, sentByUserId: user.id, respondedAt: null, recipientName: parsed.data.fullName, recipientEmail: email }, select: { id: true } });
      } else {
        await tx.recruiterInvitation.create({ data: { companyId: company.id, recipientUserId: null, recipientName: parsed.data.fullName, recipientEmail: email, sentByUserId: user.id, tokenHash, expiresAt }, select: { id: true } });
      }
      await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "RECRUITER_INVITATION_REQUEST_RECEIVED", subjectType: "Company", subjectId: company.id } });
    });
    return NextResponse.json({ ok: true, message: genericMessage }, { status: 202 });
  };

  if (recipient && recipient.role !== "RECRUITER") return recordNeutralRequest();
  if (!recipient) {
    const initialSecret = randomBytes(32).toString("base64url");
    const passwordHash = await hashPassword(initialSecret);
    try {
      recipient = await prisma.$transaction(async tx => {
        const created = await tx.user.create({
          data: {
            email,
            fullName: parsed.data.fullName,
            passwordHash,
            role: "RECRUITER",
            isActive: false,
            pendingActivation: true
          },
          select: { id: true, email: true, role: true, isActive: true, pendingActivation: true }
        });
        await tx.auditEvent.create({
          data: { actorUserId: user.id, eventType: "RECRUITER_ACCOUNT_CREATED_PENDING_ACTIVATION", subjectType: "User", subjectId: created.id }
        });
        return created;
      });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        recipient = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, role: true, isActive: true, pendingActivation: true }
        });
        if (!recipient || recipient.role !== "RECRUITER" || (!recipient.isActive && !recipient.pendingActivation)) return recordNeutralRequest();
      }
      throw error;
    }
  }
  if (!recipient.isActive && !recipient.pendingActivation) return recordNeutralRequest();
  const activeLink = await prisma.recruiterLink.findFirst({ where: { recruiterId: recipient.id, active: true }, select: { id: true } });
  if (activeLink) return recordNeutralRequest();

  const { token, tokenHash } = createOneTimeToken();
  const expiresAt = new Date(Date.now() + SEVEN_DAYS);
  // Serialize sends for this company/recipient pair. Without the advisory lock,
  // simultaneous requests can both observe no pending invite and create duplicates.
  const invitationResult = await prisma.$transaction(async (tx) => {
    const lockKey = `recruiter-invitation:${company.id}:${recipient.id}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;

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
      ? await tx.recruiterInvitation.update({ where: { id: pending.id }, data: { tokenHash, expiresAt, sentByUserId: user.id, respondedAt: null, recipientName: parsed.data.fullName, recipientEmail: email }, select: { id: true } })
      : await tx.recruiterInvitation.create({ data: { companyId: company.id, recipientUserId: recipient.id, recipientName: parsed.data.fullName, recipientEmail: email, sentByUserId: user.id, tokenHash, expiresAt }, select: { id: true } });

    await tx.auditEvent.create({
      data: { actorUserId: user.id, eventType: pending ? "RECRUITER_INVITATION_RESENT" : "RECRUITER_INVITATION_SENT", subjectType: "RecruiterInvitation", subjectId: invitation.id }
    });
    return { invitation, wasResent: Boolean(pending) };
  });
  const { invitation } = invitationResult;
  const baseUrl = getPublicBaseUrl(request);
  try {
    if (!baseUrl) throw new Error("APP_BASE_URL is required to send production email links");
    await sendEmail({
      to: recipient.email,
      subject: "Convite para se vincular a uma empresa — Acessa Vagas",
      text: `A empresa ${company.legalName} convidou você para se vincular à organização. Aceite ou recuse em até 7 dias: ${baseUrl}/recrutador/convite?token=${token}\n\nSe você ainda não tem uma conta ativa, poderá definir sua senha antes de aceitar o vínculo. Se não esperava este convite, pode recusá-lo ou ignorar esta mensagem.`
    });
  } catch {
    const replacement = createOneTimeToken();
    await prisma.$transaction(async tx => {
      const changed = await tx.recruiterInvitation.updateMany({
        where: { id: invitation.id, tokenHash, status: "PENDING" },
        data: { tokenHash: replacement.tokenHash }
      });
      if (changed.count === 1) await tx.auditEvent.create({
        data: { actorUserId: user.id, eventType: "RECRUITER_INVITATION_DELIVERY_FAILED", subjectType: "RecruiterInvitation", subjectId: invitation.id }
      });
    });
    return NextResponse.json({ ok: true, message: genericMessage }, { status: 202 });
  }
  return NextResponse.json({ ok: true, message: genericMessage }, { status: 202 });
}
