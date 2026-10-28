import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { analyzeCandidateForJob, toView } from "@/lib/compatibility/service";

const bodySchema = z.object({ jobId: z.string().min(1).max(64), transportMode: z.string().max(40).optional() }).strict();
const unauthorized = () => NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });

/** Latest stored result of the signed-in candidate for a job. Results are private to the candidate. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return unauthorized();
  const jobId = new URL(request.url).searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ message: "Informe a vaga." }, { status: 400 });
  const row = await prisma.compatibilityResult.findFirst({ where: { candidateUserId: user.id, jobId }, orderBy: { executedAt: "desc" } });
  return NextResponse.json({ result: row ? toView(row) : null });
}

/** Runs a new analysis for the signed-in candidate and stores it as a new immutable record. */
export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return unauthorized();
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const result = await analyzeCandidateForJob({ userId: user.id, jobId: parsed.data.jobId, transportMode: parsed.data.transportMode });
  if ("error" in result) return NextResponse.json({ message: result.error.message }, { status: result.error.status });
  return NextResponse.json({ ok: true, result: result.view }, { status: 201 });
}
