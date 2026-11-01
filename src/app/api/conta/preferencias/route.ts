import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { normalizePreferences, preferenceCatalog, preferenceCodes } from "@/lib/accessibility-preferences/catalog";

const inputSchema = z.object({
  preferences: z.object(Object.fromEntries(
    preferenceCodes.map((code) => [code, z.enum(preferenceCatalog[code].values as unknown as [string, ...string[]]).optional()])
  )).strict()
}).strict();

const unauthorized = () => NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const record = await prisma.userPreference.findUnique({ where: { userId: user.id }, select: { preferences: true } });
  return NextResponse.json({ preferences: normalizePreferences(record?.preferences) });
}

export async function PUT(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  const parsed = inputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Preferência inválida." }, { status: 400 });

  const changes = Object.entries(parsed.data.preferences).filter(([, value]) => value !== undefined) as [string, string][];
  const saved = await prisma.$transaction(async (tx) => {
    const current = await tx.userPreference.findUnique({ where: { userId: user.id }, select: { preferences: true } });
    const before = normalizePreferences(current?.preferences);
    const next = normalizePreferences({ ...before, ...Object.fromEntries(changes) });
    const changed = preferenceCodes.filter((code) => before[code] !== next[code]);
    const record = await tx.userPreference.upsert({
      where: { userId: user.id }, create: { userId: user.id, preferences: next }, update: { preferences: next }
    });
    if (changed.length) {
      await tx.auditEvent.create({
        data: {
          actorUserId: user.id, eventType: "ACCESSIBILITY_PREFERENCES_UPDATED", subjectType: "User", subjectId: user.id,
          metadata: { changedPreferences: changed }
        }
      });
    }
    return record;
  });
  return NextResponse.json({ ok: true, preferences: normalizePreferences(saved.preferences) });
}
