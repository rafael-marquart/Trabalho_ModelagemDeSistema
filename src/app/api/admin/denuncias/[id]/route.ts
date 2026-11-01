import { NextResponse } from "next/server";
import { getReportForAdmin } from "@/lib/reports/moderation-service";
import { requireAdmin, unauthorized } from "@/lib/reports/http";

type Context = { params: Promise<{ id: string }> };

/** SPEC-020: one report with the context needed for the analysis and its history. */
export async function GET(_request: Request, context: Context) {
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const { id } = await context.params;
  const report = await getReportForAdmin(id);
  if (!report) return NextResponse.json({ message: "Denúncia não encontrada." }, { status: 404 });
  return NextResponse.json({ report }, { headers: { "Cache-Control": "no-store" } });
}
