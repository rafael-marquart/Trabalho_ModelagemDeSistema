import { NextResponse } from "next/server";
import { resolveJobActor } from "@/lib/jobs/access";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { interviewInputSchema, scheduleInterview } from "@/lib/interviews/service";

type Context = { params: Promise<{ id: string }> };

/** SPEC-018: the company (or a linked recruiter) schedules an interview for an application of its own job. */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const parsed = interviewInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Confira os campos indicados.", issues: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message])) }, { status: 400 });
  }
  const { id } = await context.params;
  const result = await scheduleInterview({ companyId: actor.companyId, actorUserId: actor.user.id, applicationId: id, input: parsed.data });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true, interviewId: result.interviewId }, { status: 201 });
}
