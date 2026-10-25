import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { passwordConfirmationSchema } from "@/lib/auth/password-policy";
import { hashOneTimeToken } from "@/lib/auth/tokens";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const schema = passwordConfirmationSchema.extend({ token: z.string().min(20).max(200) });

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Confira o link e os dados informados.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { token, password } = parsed.data;
  const tokenRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashOneTimeToken(token) },
    include: { user: { select: { id: true, isActive: true } } }
  });
  const now = new Date();
  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= now || !tokenRecord.user.isActive) {
    return NextResponse.json({ message: "O link é inválido ou expirou. Solicite uma nova recuperação." }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);

  // Lock the user row before claiming the token. Different valid reset tokens
  // for the same account must serialize too; otherwise two concurrent requests
  // could each claim a different token and both change the password.
  const resetSucceeded = await prisma.$transaction(async (tx) => {
    const eligibleUser = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "User"
      WHERE "id" = ${tokenRecord.userId}
        AND "isActive" = true
      FOR UPDATE
    `;
    if (eligibleUser.length !== 1) return false;

    // The conditional claim also rejects reuse, expiry, or a token invalidated
    // by a competing reset after the initial lookup.
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: tokenRecord.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now }
    });
    if (claimed.count !== 1) return false;

    await tx.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash, passwordChangedAt: now, failedLoginCount: 0, lockedUntil: null }
    });
    await tx.passwordResetToken.deleteMany({
      where: { userId: tokenRecord.userId, id: { not: tokenRecord.id } }
    });
    await tx.session.deleteMany({ where: { userId: tokenRecord.userId } });
    await tx.auditEvent.create({
      data: { actorUserId: tokenRecord.userId, eventType: "AUTH_PASSWORD_RESET_SUCCEEDED", subjectType: "User", subjectId: tokenRecord.userId }
    });
    return true;
  });

  if (!resetSucceeded) {
    return NextResponse.json({ message: "O link é inválido ou expirou. Solicite uma nova recuperação." }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "Senha redefinida. Você já pode entrar com a nova senha." });
}
