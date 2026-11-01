import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { evaluationInputSchema, submitEvaluation } from "@/lib/evaluations/service";

type Context = { params: Promise<{ interviewId: string }> };

/** SPEC-018: the candidate evaluates a completed interview of their own application. The candidate comes from the session. */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Entre como candidato para avaliar o processo." }, { status: 401 });
  const parsed = evaluationInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Confira os campos indicados.", issues: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message])) }, { status: 400 });
  }
  const { interviewId } = await context.params;
  const result = await submitEvaluation(user.id, interviewId, parsed.data);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true }, { status: 201 });
}
