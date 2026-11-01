import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { resolveJobActor } from "@/lib/jobs/access";
import { fieldsToData, jobInputSchema, toJobResponse, type JobFields } from "@/lib/jobs/schema";
import { zodIssues } from "@/lib/jobs/issues";
import { jobStatuses } from "@/lib/jobs/constants";

export async function GET(request: Request) {
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const status = new URL(request.url).searchParams.get("status");
  const where = { companyId: actor.companyId, ...(status && (jobStatuses as readonly string[]).includes(status) ? { status: status as (typeof jobStatuses)[number] } : {}) };
  const [jobs, grouped] = await Promise.all([
    prisma.job.findMany({ where, orderBy: { updatedAt: "desc" }, include: { _count: { select: { applications: true } } } }),
    prisma.job.groupBy({ by: ["status"], where: { companyId: actor.companyId }, _count: { _all: true } })
  ]);
  const counts: Record<string, number> = { DRAFT: 0, OPEN: 0, PAUSED: 0, CLOSED: 0 };
  for (const group of grouped) counts[group.status] = group._count._all;
  // SPEC-013: number of applications per job, to reach each job's funnel from the list.
  return NextResponse.json({ jobs: jobs.map((job) => ({ ...toJobResponse(job), applicationCount: (job as { _count?: { applications: number } })._count?.applications ?? 0 })), counts });
}

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;

  const parsed = jobInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Confira os campos indicados.", issues: zodIssues(parsed.error) }, { status: 400 });
  }
  const { user, companyId } = actor;
  // Drafts may be incomplete or inconsistent; only publishing enforces completeness (OPEN-021).
  const job = await prisma.$transaction(async (tx) => {
    const created = await tx.job.create({
      data: { companyId, createdByUserId: user.id, status: "DRAFT", origin: "OWN", ...fieldsToData(parsed.data as JobFields) }
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: user.id, eventType: "JOB_CREATED", subjectType: "Job", subjectId: created.id,
        metadata: { companyId, origin: "OWN", status: "DRAFT" }
      }
    });
    return created;
  });
  return NextResponse.json({ ok: true, job: toJobResponse(job) }, { status: 201 });
}
