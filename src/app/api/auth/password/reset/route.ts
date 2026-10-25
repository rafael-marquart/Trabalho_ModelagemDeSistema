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
  await prisma.$transaction([
    prisma.user.update({
      where: { id: tokenRecord.userId },
      data: { passwordHash, passwordChangedAt: now, failedLoginCount: 0, lockedUntil: null }
    }),
    prisma.passwordResetToken.update({ where: { id: tokenRecord.id }, data: { usedAt: now } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: tokenRecord.userId, id: { not: tokenRecord.id } } }),
    prisma.session.deleteMany({ where: { userId: tokenRecord.userId } }),
    prisma.auditEvent.create({ data: { actorUserId: tokenRecord.userId, eventType: "AUTH_PASSWORD_RESET_SUCCEEDED", subjectType: "User", subjectId: tokenRecord.userId } })
  ]);

  return NextResponse.json({ ok: true, message: "Senha redefinida. Você já pode entrar com a nova senha." });
}