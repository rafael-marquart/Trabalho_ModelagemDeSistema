import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "acessa_session";
const IDLE_TIMEOUT_MS = 60 * 60 * 1000;
const REMEMBERED_SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function digest(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, rememberMe: boolean) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const absoluteExpiresAt = new Date(now.getTime() + (rememberMe ? REMEMBERED_SESSION_MS : IDLE_TIMEOUT_MS));
  const expiresAt = new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, absoluteExpiresAt.getTime()));

  await prisma.session.create({
    data: { tokenHash: digest(token), userId, rememberMe, expiresAt, absoluteExpiresAt, lastSeenAt: now }
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    ...(rememberMe ? { expires: absoluteExpiresAt } : {})
  });
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

  await prisma.session.update({
    where: { id: session.id },
    data: {
      lastSeenAt: now,
      expiresAt: new Date(Math.min(now.getTime() + IDLE_TIMEOUT_MS, session.absoluteExpiresAt.getTime()))
    }
  });

  return session.user;
}