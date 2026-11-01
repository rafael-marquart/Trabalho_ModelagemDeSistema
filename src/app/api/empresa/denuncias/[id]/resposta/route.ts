import { NextResponse } from "next/server";
import { resolveJobActor } from "@/lib/jobs/access";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { companyResponseSchema, respondAsCompany } from "@/lib/reports/moderation-service";
import { invalid } from "@/lib/reports/http";

type Context = { params: Promise<{ id: string }> };

/** SPEC-020: the reported company answers the administrator's points (company account or linked recruiter). */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const parsed = companyResponseSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return invalid(parsed.error);
  const { id } = await context.params;
  const result = await respondAsCompany({ companyId: actor.companyId, actorUserId: actor.user.id, reportId: id, response: parsed.data.response });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true });
}
