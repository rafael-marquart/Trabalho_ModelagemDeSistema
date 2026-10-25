import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema, normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ACCOUNT_ATTEMPTS = 10;

// Rolling-window IP thresholds: increasing cooldowns reduce automated abuse
// while allowing a small number of mistakes on shared networks.
const IP_FAILURE_THRESHOLDS = [
  { attempts: 120, cooldownSeconds: 60 * 60 },
  { attempts: 80, cooldownSeconds: 15 * 60 },
  { attempts: 50, cooldownSeconds: 5 * 60 },
  { attempts: 30, cooldownSeconds: 60 }
] as const;

function key(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function getClientIp(request: NextRequest): string {
  // The production proxy must overwrite this header; arbitrary client values are not trustworthy.
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export async function POST(request: NextRequest) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Confira os dados informados." }, { status: 400 });
  }

  const input = parsed.data;
  const identifier = normalizeIdentifier(input.identifier);
  const normalizedCpf = normalizeCpf(input.identifier);
  const identifierKey = key(identifier);
  const ipKey = key(getClientIp(request));
  const expectedRole = input.profile === "candidate" ? "CANDIDATE" : input.profile === "recruiter" ? "RECRUITER" : "COMPANY";

  const outcome = await prisma.$transaction(async (tx) => {
    // Serialize attempts from the same IP so concurrent requests cannot all pass
    // the threshold check before any of them is recorded.
    const ipLockKey = `login-ip:${ipKey}`;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${ipLockKey}, 0))`;

    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_MS);
    const recentFailures = await tx.loginAttempt.count({
      where: { ipKey, succeeded: false, createdAt: { gte: windowStart } }
    });
    const ipThreshold = IP_FAILURE_THRESHOLDS.find((threshold) => recentFailures >= threshold.attempts);
    const activeIpBlock = await tx.loginBlock.findUnique({
      where: { ipKey },
      select: { blockedUntil: true, cooldownSeconds: true }
    });

    if (activeIpBlock && activeIpBlock.blockedUntil > now) {
      // Keep cooldowns durable after the 15-minute counting window rolls over.
      // Further blocked requests are counted and restart the current/escalated cooldown.
      const cooldownSeconds = ipThreshold?.cooldownSeconds ?? activeIpBlock.cooldownSeconds;
      const blockedUntil = new Date(now.getTime() + cooldownSeconds * 1000);
      await tx.loginBlock.update({
        where: { ipKey },
        data: { blockedUntil, cooldownSeconds }
      });
      await tx.loginAttempt.create({ data: { identifierKey, ipKey, succeeded: false } });
      return { valid: false, userId: null, passwordChangedAt: null, retryAfterSeconds: cooldownSeconds };
    }

    if (ipThreshold) {
      // Start the full cooldown when the threshold is detected, not at an earlier
      // failure timestamp that could make the cooldown partly or fully elapse first.
      const blockedUntil = new Date(now.getTime() + ipThreshold.cooldownSeconds * 1000);
      await tx.loginBlock.upsert({
        where: { ipKey },
        create: { ipKey, blockedUntil, cooldownSeconds: ipThreshold.cooldownSeconds },
        update: { blockedUntil, cooldownSeconds: ipThreshold.cooldownSeconds }
      });
      // Count blocked requests too, so persistent abuse can escalate the cooldown.
      await tx.loginAttempt.create({ data: { identifierKey, ipKey, succeeded: false } });
      return {
        valid: false,
        userId: null,
        passwordChangedAt: null,
        retryAfterSeconds: ipThreshold.cooldownSeconds
      };
    }

    const user = await tx.user.findFirst({
      where: input.profile === "candidate"
        ? { OR: [{ email: identifier }, ...(normalizedCpf ? [{ cpf: normalizedCpf }] : [])] }
        : { email: identifier }
    });

    // Serialize credential checks for a known account, not just counter updates.
    // Otherwise a valid login and a wrong-password request can race and reset/increment
    // the consecutive-failure counter in an order different from their DB updates.
    let currentUser = null;
    if (user) {
      const accountLockKey = `login-account:${user.id}`;
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${accountLockKey}, 0))`;
      currentUser = await tx.user.findUnique({ where: { id: user.id } });
    }

    const eligible = Boolean(
      currentUser &&
      currentUser.role === expectedRole &&
      currentUser.isActive &&
      (!currentUser.lockedUntil || currentUser.lockedUntil <= now)
    );
    const valid = Boolean(eligible && currentUser && await verifyPassword(currentUser.passwordHash, input.password));

    await tx.loginAttempt.create({ data: { identifierKey, ipKey, succeeded: valid } });

    if (currentUser && currentUser.role === expectedRole && currentUser.isActive) {
      if (valid) {
        await tx.user.update({
          where: { id: currentUser.id },
          data: { failedLoginCount: 0, lastFailedLoginAt: null, lockedUntil: null }
        });
      } else if (!currentUser.lockedUntil || currentUser.lockedUntil <= now) {
        // Count only consecutive failures inside the documented 15-minute window.
        // A stale counter must not cause a lock after failures spread over a longer period.
        const hasRecentFailure = Boolean(currentUser.lastFailedLoginAt && currentUser.lastFailedLoginAt >= windowStart);
        const nextCount = (hasRecentFailure ? currentUser.failedLoginCount : 0) + 1;
        if (nextCount >= MAX_ACCOUNT_ATTEMPTS) {
          await tx.user.update({
            where: { id: currentUser.id },
            data: { failedLoginCount: 0, lastFailedLoginAt: null, lockedUntil: new Date(now.getTime() + WINDOW_MS) }
          });
        } else {
          await tx.user.update({
            where: { id: currentUser.id },
            data: { failedLoginCount: nextCount, lastFailedLoginAt: now }
          });
        }
      }
    }

    return {
      valid,
      userId: valid && currentUser ? currentUser.id : null,
      passwordChangedAt: valid && currentUser ? currentUser.passwordChangedAt : null,
      retryAfterSeconds: null
    };
  });

  if (outcome.retryAfterSeconds) {
    return NextResponse.json(
      { message: "Não foi possível entrar com os dados informados. Aguarde antes de tentar novamente." },
      { status: 429, headers: { "Retry-After": String(outcome.retryAfterSeconds) } }
    );
  }

  if (!outcome.valid || !outcome.userId) {
    return NextResponse.json(
      { message: "Não foi possível entrar com os dados informados." },
      { status: 401 }
    );
  }

  if (!outcome.passwordChangedAt || !(await createSession(outcome.userId, input.rememberMe, outcome.passwordChangedAt))) {
    return NextResponse.json(
      { message: "Não foi possível entrar com os dados informados." },
      { status: 401 }
    );
  }
  return NextResponse.json({
    ok: true,
    redirectTo: input.profile === "candidate" ? "/candidato" : input.profile === "recruiter" ? "/recrutador" : "/empresa"
  });
}
