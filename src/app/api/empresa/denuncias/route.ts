import { NextResponse } from "next/server";
import { resolveJobActor } from "@/lib/jobs/access";
import { listCompanyReports } from "@/lib/reports/moderation-service";

/** SPEC-019/020: reports about the actor's company that need an answer or were concluded; never who reported. */
export async function GET() {
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  return NextResponse.json({ reports: await listCompanyReports(actor.companyId) }, { headers: { "Cache-Control": "no-store" } });
}
