import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema, normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

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
  const user = await prisma.user.findFirst({
    where: input.profile === "candidate"
      ? { OR: [{ email: identifier }, ...(normalizedCpf ? [{ cpf: normalizedCpf }] : [])] }
      : { email: identifier }
  });

  // Serialize credential checks for a known account, not just counter updates.
  // Otherwise a valid login and a wrong-password request can race and reset/increment
  // the consecutive-failure counter in an order different from their DB updates.
  const outcome = await prisma.$transaction(async (tx) => {
    let currentUser = null;
    if (user) {
      const lockKey = `login-account:${user.id}`;
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${lockKey}, 0))`;
      currentUser = await tx.user.findUnique({ where: { id: user.id } });
    }

    const now = new Date();
    const eligible = Boolean(
      currentUser &&
      currentUser.role === expectedRole &&
      currentUser.isActive &&
      (!currentUser.lockedUntil || currentUser.lockedUntil <= now)
    );
    const valid = Boolean(eligible && currentUser && await verifyPassword(currentUser.passwordHash, input.password));

    await tx.loginAttempt.create({
      data: { identifierKey, ipKey, succeeded: valid }
    });

    if (currentUser && currentUser.role === expectedRole && currentUser.isActive) {
      if (valid) {
        await tx.user.update({
          where: { id: currentUser.id },
          data: { failedLoginCount: 0, lockedUntil: null }
        });
      } else if (!currentUser.lockedUntil || currentUser.lockedUntil <= now) {
        const nextCount = currentUser.failedLoginCount + 1;
        if (nextCount >= MAX_ATTEMPTS) {
          await tx.user.update({
            where: { id: currentUser.id },
            data: { failedLoginCount: 0, lockedUntil: new Date(now.getTime() + WINDOW_MS) }
          });
        } else {
          await tx.user.update({
            where: { id: currentUser.id },
            data: { failedLoginCount: nextCount }
          });
        }
      }
    }

    return {
      valid,
      userId: valid && currentUser ? currentUser.id : null,
      passwordChangedAt: valid && currentUser ? currentUser.passwordChangedAt : null
    };
  });

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