import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { passwordConfirmationSchema } from "@/lib/auth/password-policy";
import { hashOneTimeToken } from "@/lib/auth/tokens";

const schema = passwordConfirmationSchema.extend({ token: z.string().min(20).max(200) });

export async function POST(request: Request) {
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

  // Claim the token conditionally inside the same transaction as the password
  // change. This prevents two concurrent requests from successfully reusing it.
  const resetSucceeded = await prisma.$transaction(async (tx) => {
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
