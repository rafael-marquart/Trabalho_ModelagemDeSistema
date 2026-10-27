import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { resolveJobActor } from "@/lib/jobs/access";
import { listActiveCandidatesForJob } from "@/lib/jobs/applications";
import { jobActions, transitions } from "@/lib/jobs/constants";
import { rowToFields, toJobResponse, validateForPublication } from "@/lib/jobs/schema";

type Context = { params: Promise<{ id: string }> };
const bodySchema = z.object({ action: z.enum(jobActions as unknown as [string, ...string[]]) }).strict();
const eventTypes = { publish: "JOB_PUBLISHED", pause: "JOB_PAUSED", reopen: "JOB_REOPENED", close: "JOB_CLOSED" } as const;

export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const { id } = await context.params;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Ação desconhecida." }, { status: 400 });
  const action = parsed.data.action as keyof typeof transitions;

  const job = await prisma.job.findFirst({ where: { id, companyId: actor.companyId } });
  if (!job) return NextResponse.json({ message: "Vaga não encontrada." }, { status: 404 });

  const rule = transitions[action];
  if (!rule.from.includes(job.status)) {
    return NextResponse.json({ message: "Esta ação não está disponível para o estado atual da vaga." }, { status: 409 });
  }
  // Publishing and reopening put the job back in front of candidates, so the publication rules run again.
  if (action === "publish" || action === "reopen") {
    const issues = validateForPublication(rowToFields(job));
    if (Object.keys(issues).length) {
      return NextResponse.json({ message: "A vaga ainda não pode ser publicada. Confira os campos indicados.", issues }, { status: 400 });
    }
  }
  const { user } = actor;
  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.job.update({
      where: { id: job.id },
      data: {
        status: rule.to,
        ...(action === "publish" ? { publishedAt: now } : {}),
        ...(action === "close" ? { closedAt: now } : {})
      }
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: user.id, eventType: eventTypes[action], subjectType: "Job", subjectId: job.id,
        metadata: { companyId: job.companyId, fromStatus: job.status, toStatus: rule.to }
      }
    });
    return saved;
  });
  // Closing never moves candidates or removes applications; it only reports who is still active so they can be notified.
  const activeCandidates = action === "close" ? await listActiveCandidatesForJob(job.id) : [];
  return NextResponse.json({ ok: true, job: toJobResponse(updated), activeCandidates: activeCandidates.length });
}
