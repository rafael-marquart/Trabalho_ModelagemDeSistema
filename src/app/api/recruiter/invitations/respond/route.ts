import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { hashOneTimeToken } from "@/lib/auth/tokens";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/password-policy";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  token: z.string().min(20).max(200),
  action: z.enum(["accept", "refuse"]),
  password: passwordSchema.optional()
});

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Convite inválido ou expirado. Confira os dados e a senha." }, { status: 400 });

  const user = await getCurrentUser();
  if (user && user.role !== "RECRUITER") {
    return NextResponse.json({ message: "Você está conectado com outra conta (empresa ou candidato). Saia dela, ou use outra janela anônima, e abra o convite novamente." }, { status: 401 });
  }
  const now = new Date();
  const tokenHash = hashOneTimeToken(parsed.data.token);
  const invitation = await prisma.recruiterInvitation.findUnique({ where: { tokenHash } });
  if (!invitation || invitation.status !== "PENDING" || !invitation.recipientUserId) {
    return NextResponse.json({ message: "Convite inválido, já respondido ou expirado." }, { status: 400 });
  }
  const recipientUserId = invitation.recipientUserId;

  const pendingSetup = !user && parsed.data.action === "accept";
  if (user && (user.role !== "RECRUITER" || user.id !== recipientUserId)) {
    return NextResponse.json({ message: "Entre na conta de recrutador destinatária do convite." }, { status: 401 });
  }
  if (!user && parsed.data.action !== "refuse" && !pendingSetup) {
    return NextResponse.json({ message: "Entre na conta destinatária do convite." }, { status: 401 });
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientUserId },
    select: { id: true, role: true, isActive: true, pendingActivation: true }
  });
  if (!recipient || recipient.role !== "RECRUITER" || (pendingSetup && !recipient.pendingActivation)) {
    return NextResponse.json({ message: "Entre na conta de recrutador destinatária do convite." }, { status: 401 });
  }
  if (pendingSetup && !parsed.data.password) {
    return NextResponse.json({ message: "Crie uma senha para ativar sua conta e aceitar o vínculo." }, { status: 400 });
  }
  if (parsed.data.action === "accept" && user && !user.isActive) {
    return NextResponse.json({ message: "Esta conta não está habilitada para aceitar convites." }, { status: 403 });
  }

  if (invitation.expiresAt <= now) {
    await prisma.$transaction(async tx => {
      const changed = await tx.recruiterInvitation.updateMany({
        where: { id: invitation.id, recipientUserId: recipientUserId, tokenHash, status: "PENDING", expiresAt: { lte: now } },
        data: { status: "EXPIRED", respondedAt: now }
      });
      if (changed.count === 1) await tx.auditEvent.create({
        data: { actorUserId: user?.id ?? null, eventType: "RECRUITER_INVITATION_EXPIRED", subjectType: "RecruiterInvitation", subjectId: invitation.id }
      });
    });
    return NextResponse.json({ message: "Convite expirado. Peça à empresa que envie outro." }, { status: 400 });
  }

  const newPasswordHash = pendingSetup && parsed.data.password ? await hashPassword(parsed.data.password) : null;
  try {
    const outcome = await prisma.$transaction(async tx => {
      if (parsed.data.action === "accept") {
        const company = await tx.company.findUnique({ where: { id: invitation.companyId }, select: { id: true, accountUser: { select: { isActive: true } } } });
        if (!company || !company.accountUser.isActive) return "COMPANY_NOT_ACTIVE" as const;
        const active = await tx.recruiterLink.findFirst({ where: { recruiterId: recipientUserId, active: true }, select: { id: true } });
        if (active) return "RECRUITER_ALREADY_LINKED" as const;
      }

      const claimed = await tx.recruiterInvitation.updateMany({
        where: { id: invitation.id, recipientUserId: recipientUserId, status: "PENDING", expiresAt: { gt: now }, tokenHash },
        data: { status: parsed.data.action === "accept" ? "ACCEPTED" : "REFUSED", respondedAt: now }
      });
      if (claimed.count !== 1) return "STALE" as const;

      if (parsed.data.action === "accept") {
        if (pendingSetup) {
          const activated = await tx.user.updateMany({
            where: { id: recipientUserId, role: "RECRUITER", isActive: false, pendingActivation: true },
            data: { passwordHash: newPasswordHash!, isActive: true, pendingActivation: false, passwordChangedAt: now }
          });
          if (activated.count !== 1) throw new Error("RECRUITER_ACTIVATION_RACE");
        }
        await tx.recruiterLink.create({ data: { companyId: invitation.companyId, recruiterId: recipientUserId } });
      }
      await tx.auditEvent.create({
        data: {
          actorUserId: user?.id ?? recipientUserId,
          eventType: parsed.data.action === "accept" ? (pendingSetup ? "RECRUITER_ACCOUNT_ACTIVATED_AND_INVITATION_ACCEPTED" : "RECRUITER_INVITATION_ACCEPTED") : "RECRUITER_INVITATION_REFUSED",
          subjectType: "RecruiterInvitation",
          subjectId: invitation.id
        }
      });
      return "OK" as const;
    }, { isolationLevel: "Serializable" });

    if (outcome === "RECRUITER_ALREADY_LINKED") return NextResponse.json({ message: "Você já possui vínculo ativo com outra empresa." }, { status: 409 });
    if (outcome === "COMPANY_NOT_ACTIVE") return NextResponse.json({ message: "A empresa não está habilitada." }, { status: 409 });
    if (outcome !== "OK") return NextResponse.json({ message: "O convite deixou de ser válido." }, { status: 409 });
    return NextResponse.json({ ok: true, message: parsed.data.action === "accept" ? "Convite aceito e vínculo criado. Você já pode entrar com sua nova senha." : "Convite recusado." });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2034") {
      return NextResponse.json({ message: "Houve uma alteração simultânea no vínculo. Atualize a página e tente novamente." }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ message: "Você já possui vínculo ativo com outra empresa. Atualize a página e verifique seus vínculos." }, { status: 409 });
    }
    if (error instanceof Error && error.message === "RECRUITER_ACTIVATION_RACE") {
      return NextResponse.json({ message: "A ativação da conta mudou durante a solicitação. Solicite um novo convite." }, { status: 409 });
    }
    throw error;
  }
}
