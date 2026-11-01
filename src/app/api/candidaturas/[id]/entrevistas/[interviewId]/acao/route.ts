import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveJobActor } from "@/lib/jobs/access";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { finishInterview } from "@/lib/interviews/service";

type Context = { params: Promise<{ id: string; interviewId: string }> };
const bodySchema = z.object({ action: z.enum(["cancel", "complete"]) }).strict();

/** SPEC-018: cancels a scheduled interview or marks it as completed (which opens the candidate's evaluation). */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Ação desconhecida." }, { status: 400 });
  const { id, interviewId } = await context.params;
  const result = await finishInterview({ companyId: actor.companyId, actorUserId: actor.user.id, applicationId: id, interviewId, action: parsed.data.action });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true });
}
