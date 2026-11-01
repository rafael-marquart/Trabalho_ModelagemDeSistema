import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { emailFailureMetadata, sendEmail } from "@/lib/email";
import { emailTemplates } from "@/lib/email-templates";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

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
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

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

  const recovery = user ? createOneTimeToken() : null;
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  const outcome = await prisma.$transaction(async (tx) => {
    for (const lockKey of lockKeys) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - WINDOW_MS);
    const scopeKeys = [
      `identifier:${identifierKey}`,
      `ip:${ipKey}`
    ];
    const activeBlock = await tx.recoveryBlock.findFirst({
      where: { scopeKey: { in: scopeKeys }, blockedUntil: { gt: now } },
      select: { scopeKey: true, blockedUntil: true }
    });
    if (activeBlock) return { allowed: false, token: null };

    const [identifierAttempts, ipAttempts] = await Promise.all([
      tx.recoveryAttempt.count({ where: { identifierKey, createdAt: { gt: cutoff } } }),
      tx.recoveryAttempt.count({ where: { ipKey, createdAt: { gt: cutoff } } })
    ]);

    const exhaustedScopes = [
      ...(identifierAttempts >= MAX_REQUESTS ? [scopeKeys[0]] : []),
      ...(ipAttempts >= MAX_REQUESTS ? [scopeKeys[1]] : [])
    ];
    if (exhaustedScopes.length) {
      const blockedUntil = new Date(now.getTime() + WINDOW_MS);
      for (const scopeKey of exhaustedScopes) {
        await tx.recoveryBlock.upsert({
          where: { scopeKey },
          create: { scopeKey, blockedUntil },
          update: { blockedUntil }
        });
      }
      return { allowed: false, token: null };
    }

    await tx.recoveryAttempt.create({ data: { identifierKey, ipKey } });

    // The third allowed request starts the cooldown immediately after it is
    // accepted. The current request completes; subsequent requests are blocked.
    const newlyExhaustedScopes = [
      ...(identifierAttempts + 1 >= MAX_REQUESTS ? [scopeKeys[0]] : []),
      ...(ipAttempts + 1 >= MAX_REQUESTS ? [scopeKeys[1]] : [])
    ];
    if (newlyExhaustedScopes.length) {
      const blockedUntil = new Date(now.getTime() + WINDOW_MS);
      for (const scopeKey of newlyExhaustedScopes) {
        await tx.recoveryBlock.upsert({
          where: { scopeKey },
          create: { scopeKey, blockedUntil },
          update: { blockedUntil }
        });
      }
    }

    // Keep the account/IP quota check and token replacement in one transaction.
    // Concurrent recovery requests for the same account share the advisory lock,
    // so a newer request cannot leave multiple reset tokens valid.
    if (user && recovery) {
      await tx.passwordResetToken.deleteMany({ where: { userId: user.id, usedAt: null } });
      await tx.passwordResetToken.create({
        data: { userId: user.id, tokenHash: recovery.tokenHash, expiresAt }
      });
    }

    return { allowed: true, token: recovery?.token ?? null };
  });

  if (!outcome.allowed) {
    // Keep status and message identical for known and unknown identifiers.
    // The persisted cooldown still blocks processing, but does not reveal whether
    // the submitted email/CPF belongs to an account.
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }

  if (user && outcome.token) {
    const baseUrl = getPublicBaseUrl(request);
    try {
      if (!baseUrl) throw new Error("APP_BASE_URL is required to send production email links");
      await sendEmail({ to: user.email, ...emailTemplates.passwordRecovery(`${baseUrl}/recuperar-senha?token=${outcome.token}`) });
    } catch (error) {
      // Keep the public response generic if email delivery is not configured.
      await prisma.auditEvent.create({
        data: {
          actorUserId: user.id,
          eventType: "AUTH_PASSWORD_RECOVERY_EMAIL_FAILED",
          subjectType: "User",
          subjectId: user.id,
          metadata: emailFailureMetadata(error)
        }
      });
    }
  }

  return NextResponse.json({ message: genericMessage }, { status: 200 });
}
