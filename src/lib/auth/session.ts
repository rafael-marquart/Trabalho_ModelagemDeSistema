import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "acessa_session";
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const REMEMBERED_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, rememberMe: boolean, expectedPasswordChangedAt: Date): Promise<boolean> {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const absoluteExpiresAt = new Date(now.getTime() + REMEMBERED_SESSION_MS);
  const expiresAt = new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, absoluteExpiresAt.getTime()));

  // Coordinate with password reset: if the password changed after credentials
  // were verified, do not create a session from stale credentials. The check and
  // insert are atomic relative to the reset transaction's user update/session delete.
  const created = await prisma.$transaction(async (tx) => {
    const eligible = await tx.$queryRaw<Array<{ id: string }>>`
      SELECT "id"
      FROM "User"
      WHERE "id" = ${userId}
        AND "isActive" = true
        AND "passwordChangedAt" = ${expectedPasswordChangedAt}
      FOR UPDATE
    `;
    if (eligible.length !== 1) return false;

    await tx.session.create({
      data: { tokenHash: digest(token), userId, rememberMe, expiresAt, absoluteExpiresAt, lastSeenAt: now }
    });
    // Keep successful-login auditing atomic with session creation. If audit
    // persistence fails, the transaction rolls back and no cookie is issued.
    await tx.auditEvent.create({
      data: {
        actorUserId: userId,
        eventType: "AUTH_LOGIN_SUCCEEDED",
        subjectType: "User",
        subjectId: userId
      }
    });
    return true;
  });
  if (!created) return false;

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { expires: absoluteExpiresAt } : {})
  });
  return true;
}

export async function revokeCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await prisma.session.deleteMany({ where: { tokenHash: digest(token) } });
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { tokenHash: digest(token) },
    include: { user: true }
  });

  const now = new Date();
  if (
    !session ||
    !session.user.isActive ||
    session.expiresAt <= now ||
    session.absoluteExpiresAt <= now
  ) {
    if (session) await prisma.session.deleteMany({ where: { id: session.id } });
    return null;
  }

  // A session can be revoked between the read above and this refresh (for
  // example by password reset or logout in another request). Use a conditional
  // update so a stale request never turns that race into a 500 or refreshes an
  // already-expired session.
  const refreshed = await prisma.session.updateMany({
    where: {
      id: session.id,
      expiresAt: { gt: now },
      absoluteExpiresAt: { gt: now }
    },
    data: {
      lastSeenAt: now,
      expiresAt: new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, session.absoluteExpiresAt.getTime()))
    }
  });

  if (refreshed.count !== 1) {
    return null;
  }

  return session.user;
}