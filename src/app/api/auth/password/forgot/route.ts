import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  profile: z.enum(["candidate", "company"]),
  identifier: z.string().trim().min(1).max(160)
});
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;
const genericMessage = "Se os dados corresponderem a uma conta elegível, enviaremos instruções ao e-mail cadastrado.";

function digest(value: string) { return createHash("sha256").update(value).digest("hex"); }
function clientIp(request: NextRequest) {
  // Only trust this header when the deployment proxy overwrites it.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: genericMessage }, { status: 200 });

  const input = parsed.data;
  const identifier = normalizeIdentifier(input.identifier);
  const cpf = normalizeCpf(input.identifier);
  const user = await prisma.user.findFirst({
    where: input.profile === "candidate"
      ? { role: "CANDIDATE", isActive: true, OR: [{ email: identifier }, ...(cpf ? [{ cpf }] : [])] }
      : { role: "COMPANY", email: identifier, isActive: true },
    select: { id: true, email: true }
  });

  // Key by the account when it exists, so requesting recovery by email and CPF
  // consumes the same per-account quota. Unknown identifiers still receive a
  // deterministic key without changing the public response.
  const identifierKey = digest(user ? `user:${user.id}` : `input:${input.profile}:${identifier}`);
  const ipKey = digest(clientIp(request));
  // Serialize requests sharing either quota key. Lock keys in a stable order
  // so requests for different accounts from the same IP cannot deadlock.
  // The checks and attempt insert must share the transaction; otherwise
  // concurrent requests could all pass the count before any insert is visible.
  const lockKeys = [
    `recovery:identifier:${identifierKey}`,
    `recovery:ip:${ipKey}`
  ].sort();

  const allowed = await prisma.$transaction(async (tx) => {
    for (const lockKey of lockKeys) {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    }

    const cutoff = new Date(Date.now() - WINDOW_MS);
    const [identifierAttempts, ipAttempts] = await Promise.all([
      tx.recoveryAttempt.count({ where: { identifierKey, createdAt: { gte: cutoff } } }),
      tx.recoveryAttempt.count({ where: { ipKey, createdAt: { gte: cutoff } } })
    ]);

    if (identifierAttempts >= MAX_REQUESTS || ipAttempts >= MAX_REQUESTS) {
      return false;
    }

    await tx.recoveryAttempt.create({ data: { identifierKey, ipKey } });
    return true;
  });

  if (!allowed) {
    return NextResponse.json(
      { message: "Limite de solicitações atingido. Aguarde 15 minutos antes de tentar novamente." },
      { status: 429 }
    );
  }

  if (user) {
    const { token, tokenHash } = createOneTimeToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } }),
      prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } })
    ]);
    const baseUrl = process.env.APP_BASE_URL || new URL(request.url).origin;
    try {
      await sendEmail({
        to: user.email,
        subject: "Recuperação de senha — Acessa Vagas",
        text: `Recebemos uma solicitação de recuperação de senha. Use este link em até 30 minutos e apenas uma vez: ${baseUrl}/recuperar-senha?token=${token}\n\nSe você não solicitou, ignore esta mensagem.`
      });
    } catch {
      // Keep the public response generic if email delivery is not configured.
      await prisma.auditEvent.create({
        data: {
          actorUserId: user.id,
          eventType: "AUTH_PASSWORD_RECOVERY_EMAIL_FAILED",
          subjectType: "User",
          subjectId: user.id
        }
      });
    }
  }

  return NextResponse.json({ message: genericMessage }, { status: 200 });
}
