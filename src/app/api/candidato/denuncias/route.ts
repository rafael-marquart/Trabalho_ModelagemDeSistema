import { NextResponse } from "next/server";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { createReport, listOwnReports, reportInputSchema } from "@/lib/reports/reporter-service";
import { invalid, requireCandidate, unauthorized } from "@/lib/reports/http";

/** SPEC-019: the signed-in candidate's own reports (progress and result only). */
export async function GET() {
  const user = await requireCandidate();
  if (!user) return unauthorized("Entre como candidato para ver suas denúncias.");
  return NextResponse.json({ reports: await listOwnReports(user.id) }, { headers: { "Cache-Control": "no-store" } });
}

/** SPEC-019: registers a report about a job the candidate can see; the company comes from the job. */
export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await requireCandidate();
  if (!user) return unauthorized("Entre como candidato para denunciar uma vaga.");
  const parsed = reportInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  const result = await createReport(user.id, parsed.data);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true, reportId: result.reportId }, { status: 201 });
}
