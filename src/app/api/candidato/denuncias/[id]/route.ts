import { NextResponse } from "next/server";
import { getOwnReport } from "@/lib/reports/reporter-service";
import { requireCandidate, unauthorized } from "@/lib/reports/http";

type Context = { params: Promise<{ id: string }> };

/** One of the candidate's own reports; someone else's answers as not found. */
export async function GET(_request: Request, context: Context) {
  const user = await requireCandidate();
  if (!user) return unauthorized("Entre como candidato para ver suas denúncias.");
  const { id } = await context.params;
  const report = await getOwnReport(user.id, id);
  if (!report) return NextResponse.json({ message: "Denúncia não encontrada." }, { status: 404 });
  return NextResponse.json({ report }, { headers: { "Cache-Control": "no-store" } });
}
