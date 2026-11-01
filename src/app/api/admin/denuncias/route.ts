import { NextResponse } from "next/server";
import { listQueue } from "@/lib/reports/moderation-service";
import { requireAdmin, unauthorized } from "@/lib/reports/http";

/** SPEC-020: moderation queue (open reports) or history (concluded), for the platform administrator only. */
export async function GET(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const filter = new URL(request.url).searchParams.get("filtro") === "concluidas" ? "concluded" : "open";
  return NextResponse.json({ reports: await listQueue(filter) }, { headers: { "Cache-Control": "no-store" } });
}
