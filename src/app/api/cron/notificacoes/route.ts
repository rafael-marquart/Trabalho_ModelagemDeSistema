import { NextResponse } from "next/server";
import { deliverDueNotifications } from "@/lib/notifications/service";
import { isAuthorizedCron } from "@/lib/security/cron";

// SPEC-017 on serverless hosting: the periodic round that retries e-mails that failed temporarily (OPEN-068). Called by
// the scheduler (Vercel Cron and/or GitHub Actions); e-mails are first attempted right after each event (after()).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const result = await deliverDueNotifications({ limit: 50 });
  return NextResponse.json({ ok: true, ...result });
}
