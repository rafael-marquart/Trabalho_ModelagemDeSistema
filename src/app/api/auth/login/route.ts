import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { loginSchema, normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Confira os dados informados." }, { status: 400 });
  }

  const input = parsed.data;
  const identifier = normalizeIdentifier(input.identifier);
  const normalizedCpf = normalizeCpf(input.identifier);
  const identifierKey = key(identifier);
  const ipKey = key(getClientIp(request));
  const cutoff = new Date(Date.now() - WINDOW_MS);

  const recentFailures = await prisma.loginAttempt.count({
    where: {
      OR: [{ identifierKey }, { ipKey }],
      succeeded: false,
      createdAt: { gte: cutoff }
    }
  });

  if (recentFailures >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { message: "Muitas tentativas de acesso. Aguarde 15 minutos e tente novamente." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findFirst({
    where: input.profile === "candidate"
      ? { OR: [{ email: identifier }, ...(normalizedCpf ? [{ cpf: normalizedCpf }] : [])] }
      : { email: identifier }
  });

  const expectedRole = input.profile === "candidate" ? "CANDIDATE" : "COMPANY";
  const locked = user?.lockedUntil && user.lockedUntil > new Date();
  const valid = Boolean(
    user &&
    user.role === expectedRole &&
    user.isActive &&
    !locked &&
    await verifyPassword(user.passwordHash, input.password)
  );

  await prisma.loginAttempt.create({ data: { identifierKey, ipKey, succeeded: valid } });

  if (!valid || !user) {
    if (user && user.role === expectedRole && user.isActive) {
      const failedLoginCount = user.failedLoginCount + 1;
      const shouldLock = failedLoginCount >= MAX_ATTEMPTS;
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginCount: shouldLock ? 0 : failedLoginCount,
          lockedUntil: shouldLock ? new Date(Date.now() + WINDOW_MS) : user.lockedUntil
        }
      });
    }
    return NextResponse.json(
      { message: "Não foi possível entrar com os dados informados." },
      { status: 401 }
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { failedLoginCount: 0, lockedUntil: null }
  });
  await createSession(user.id, input.rememberMe);
  await prisma.auditEvent.create({
    data: { actorUserId: user.id, eventType: "AUTH_LOGIN_SUCCEEDED", subjectType: "User", subjectId: user.id }
  });

  return NextResponse.json({
    ok: true,
    redirectTo: input.profile === "candidate" ? "/candidato" : "/empresa"
  });
}