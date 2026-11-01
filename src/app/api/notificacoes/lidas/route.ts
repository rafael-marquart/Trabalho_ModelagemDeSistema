import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { noticeRecipient } from "@/lib/notifications/access";
import { countUnreadNotices, markNoticesRead } from "@/lib/notifications/service";

const bodySchema = z.object({ id: z.string().min(1).max(64).optional() }).strict();

/** Marks one of the person's notices as read, or all of them when no id is given. Someone else's notice is never touched. */
export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await noticeRecipient();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const changed = await markNoticesRead(user.id, parsed.data.id);
  return NextResponse.json({ ok: true, changed, unread: await countUnreadNotices(user.id) });
}
