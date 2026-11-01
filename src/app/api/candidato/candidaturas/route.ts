import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { applyToJob } from "@/lib/applications/service";
import { listCandidateApplications } from "@/lib/applications/candidate-service";

// The candidate comes from the session only; the body names the job and nothing else (SPEC-011 section 9).
const bodySchema = z.object({ jobId: z.string().min(1).max(64) }).strict();

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Entre como candidato para se candidatar." }, { status: 401 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const result = await applyToJob(user.id, parsed.data.jobId);
  if (!result.ok) return NextResponse.json({ code: result.code, message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true, application: result.application }, { status: 201 });
}

/** SPEC-012/016: the signed-in candidate's own applications, with the current stage (cancelled ones included). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Entre como candidato para ver suas candidaturas." }, { status: 401 });
  return NextResponse.json({ applications: await listCandidateApplications(user.id) }, { headers: { "Cache-Control": "no-store" } });
}
