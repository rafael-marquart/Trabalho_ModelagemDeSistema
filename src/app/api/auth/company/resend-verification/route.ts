import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizeIdentifier } from "@/lib/auth/login-schema";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { emailFailureMetadata, sendEmail } from "@/lib/email";
import { emailTemplates } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const schema = z.object({ email: z.string().trim().email().max(254) });
const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 3;
const genericMessage = "Se houver uma conta empresarial pendente com esse e-mail, enviaremos um novo link de confirmação.";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function clientIp(request: NextRequest) {
  // Only trust this header when the deployment proxy overwrites it.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: genericMessage }, { status: 200 });

  const email = normalizeIdentifier(parsed.data.email);
  const candidate = await prisma.user.findFirst({
    where: { email, role: "COMPANY", isActive: false },
    select: { id: true, email: true, company: { select: { id: true, emailConfirmedAt: true } } }
  });
  const eligible = candidate?.company && !candidate.company.emailConfirmedAt ? candidate : null;
  const eligibleCompanyId = eligible?.company?.id ?? null;
  const identifierKey = digest(eligible ? `company-verification:user:${eligible.id}` : `company-verification:input:${email}`);
  const ipKey = digest(`company-verification:ip:${clientIp(request)}`);
  const scopeKeys = [
    `company-verification:identifier:${identifierKey}`,
    `company-verification:ip:${ipKey}`
  ];
  const lockKeys = [...scopeKeys].sort();
  const token = eligible ? createOneTimeToken() : null;
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const outcome = await prisma.$transaction(async tx => {
    for (const lockKey of lockKeys) {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - WINDOW_MS);
    const activeBlock = await tx.recoveryBlock.findFirst({
      where: { scopeKey: { in: scopeKeys }, blockedUntil: { gt: now } },
      select: { scopeKey: true }
    });
    if (activeBlock) return { allowed: false, token: null, userId: null, companyId: null };

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
      return { allowed: false, token: null, userId: null, companyId: null };
    }

    await tx.recoveryAttempt.create({ data: { identifierKey, ipKey } });
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

    if (!eligible || !token) return { allowed: true, token: null, userId: null, companyId: null };
    const stillEligible = await tx.company.findFirst({
      where: {
        id: eligibleCompanyId!,
        accountUserId: eligible.id,
        emailConfirmedAt: null
      },
      select: { id: true }
    });
    if (!stillEligible) return { allowed: true, token: null, userId: null, companyId: null };

    await tx.companyEmailVerificationToken.deleteMany({
      where: { companyId: stillEligible.id, usedAt: null }
    });
    await tx.companyEmailVerificationToken.create({
      data: { companyId: stillEligible.id, tokenHash: token.tokenHash, expiresAt }
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: null,
        eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_RESEND_REQUESTED",
        subjectType: "User",
        subjectId: eligible.id
      }
    });
    return {
      allowed: true,
      token: token.token,
      userId: eligible.id,
      companyId: stillEligible.id
    };
  });

  if (!outcome.allowed || !outcome.token || !outcome.userId || !outcome.companyId || !eligible) {
    return NextResponse.json({ message: genericMessage }, { status: 200 });
  }

  try {
    const baseUrl = getPublicBaseUrl(request);
    if (!baseUrl) throw new Error("APP_BASE_URL is required to send production email links");
    await sendEmail({ to: eligible.email, ...emailTemplates.companyEmailVerificationResend(`${baseUrl}/empresa/confirmar-email?token=${outcome.token}`) });
  } catch (error) {
    await prisma.$transaction(async tx => {
      await tx.companyEmailVerificationToken.deleteMany({
        where: { companyId: outcome.companyId!, tokenHash: token!.tokenHash, usedAt: null }
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: outcome.userId,
          eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_DELIVERY_FAILED",
          subjectType: "User",
          subjectId: outcome.userId,
          metadata: emailFailureMetadata(error)
        }
      });
    });
  }

  return NextResponse.json({ message: genericMessage }, { status: 200 });
}
