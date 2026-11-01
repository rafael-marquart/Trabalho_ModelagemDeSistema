import { NextResponse } from "next/server";
import { noticeRecipient } from "@/lib/notifications/access";
import { countUnreadNotices } from "@/lib/notifications/service";

/** Unread notices of the signed-in person, for the badge in the side menu. */
export async function GET() {
  const user = await noticeRecipient();
  if (!user) return NextResponse.json({ unread: 0 }, { status: 401 });
  return NextResponse.json({ unread: await countUnreadNotices(user.id) }, { headers: { "Cache-Control": "no-store" } });
}
