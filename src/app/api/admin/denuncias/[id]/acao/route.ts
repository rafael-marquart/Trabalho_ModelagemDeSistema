import { NextResponse } from "next/server";
import { z } from "zod";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { concludeReport, decisionSchema, infoRequestSchema, requestCompanyInfo, setPriority, startAnalysis } from "@/lib/reports/moderation-service";
import { invalid, requireAdmin, unauthorized } from "@/lib/reports/http";

type Context = { params: Promise<{ id: string }> };
const actionSchema = z.object({ action: z.enum(["start", "priority", "request", "conclude"]) }).passthrough();

/** SPEC-020: moderation steps — start the analysis, change priority, ask the company, conclude. Admin only. */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const admin = await requireAdmin();
  if (!admin) return unauthorized();
  const body = await request.json().catch(() => null);
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Ação desconhecida." }, { status: 400 });
  const { action, ...rest } = parsed.data;
  const { id } = await context.params;
  let result;
  if (action === "start") result = await startAnalysis(admin.id, id);
  else if (action === "priority") {
    const priority = z.object({ highPriority: z.boolean() }).strict().safeParse(rest);
    if (!priority.success) return invalid(priority.error);
    result = await setPriority(admin.id, id, priority.data.highPriority);
  } else if (action === "request") {
    const input = infoRequestSchema.safeParse(rest);
    if (!input.success) return invalid(input.error);
    result = await requestCompanyInfo(admin.id, id, input.data);
  } else {
    const input = decisionSchema.safeParse(rest);
    if (!input.success) return invalid(input.error);
    result = await concludeReport(admin.id, id, input.data);
  }
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true });
}
