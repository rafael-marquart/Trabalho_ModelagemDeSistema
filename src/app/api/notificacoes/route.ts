import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizePreferences } from "@/lib/accessibility-preferences/catalog";
import { noticeRecipient } from "@/lib/notifications/access";
import { countUnreadNotices, listNotices } from "@/lib/notifications/service";

/** The signed-in person's own notices (most recent first), the unread count and the e-mail copy setting. */
export async function GET() {
  const user = await noticeRecipient();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const [notices, unread, preference] = await Promise.all([
    listNotices(user.id), countUnreadNotices(user.id),
    prisma.userPreference.findUnique({ where: { userId: user.id }, select: { preferences: true } })
  ]);
  return NextResponse.json({ notices, unread, emailNotifications: normalizePreferences(preference?.preferences).EMAIL_NOTIFICATIONS }, { headers: { "Cache-Control": "no-store" } });
}
