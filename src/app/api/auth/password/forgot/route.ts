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
  // This header is trustworthy only when the deployment proxy overwrites it.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: genericMessage }, { status: 200 });

  const input = parsed.data;
  const identifier = normalizeIdentifier(input.identifier);
  const cpf = normalizeCpf(input.identifier);
  const identifierKey = digest(identifier);
  const ipKey = digest(clientIp(request));
  const cutoff = new Date(Date.now() - WINDOW_MS);

  // The baseline defines independent limits per account/identifier and per IP.
  // Count each dimension separately so one identifier does not consume the quota
  // of an unrelated identifier behind the same address (and vice versa).
  const [identifierAttempts, ipAttempts] = await Promise.all([
    prisma.recoveryAttempt.count({ where: { identifierKey, createdAt: { gte: cutoff } } }),
    prisma.recoveryAttempt.count({ where: { ipKey, createdAt: { gte: cutoff } } })
  ]);
  if (identifierAttempts >= MAX_REQUESTS || ipAttempts >= MAX_REQUESTS) {
    return NextResponse.json(
      { message: "Limite de solicitações atingido. Aguarde 15 minutos antes de tentar novamente." },
      { status: 429 }
    );
  }
  await prisma.recoveryAttempt.create({ data: { identifierKey, ipKey } });

  const user = await prisma.user.findFirst({
    where: input.profile === "candidate"
      ? { role: "CANDIDATE", isActive: true, OR: [{ email: identifier }, ...(cpf ? [{ cpf }] : [])] }
      : { role: "COMPANY", email: identifier, isActive: true },
    select: { id: true, email: true }
  });

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
      // Do not disclose account existence or mail configuration to the requester.
      await prisma.auditEvent.create({ data: { actorUserId: user.id, eventType: "AUTH_PASSWORD_RECOVERY_EMAIL_FAILED", subjectType: "User", subjectId: user.id } });
    }
  }
  return NextResponse.json({ message: genericMessage }, { status: 200 });
}
