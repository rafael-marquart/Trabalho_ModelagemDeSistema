import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { resolveJobActor } from "@/lib/jobs/access";
import { jobHasApplications } from "@/lib/jobs/applications";
import { changedFieldNames, fieldsToData, jobInputSchema, rowToFields, toJobResponse, validateForPublication, type JobFields } from "@/lib/jobs/schema";
import { zodIssues } from "@/lib/jobs/issues";

type Context = { params: Promise<{ id: string }> };
const notFound = () => NextResponse.json({ message: "Vaga não encontrada." }, { status: 404 });

export async function GET(_request: Request, context: Context) {
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const { id } = await context.params;
  // Always scoped to the company of the actor: a job of another company looks like a missing one.
  const job = await prisma.job.findFirst({ where: { id, companyId: actor.companyId } });
  if (!job) return notFound();
  return NextResponse.json({ job: toJobResponse(job) });
}

export async function PUT(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const { id } = await context.params;
  const job = await prisma.job.findFirst({ where: { id, companyId: actor.companyId } });
  if (!job) return notFound();

  if (job.status === "CLOSED") {
    return NextResponse.json({ message: "Vagas encerradas não podem ser editadas." }, { status: 409 });
  }
  const parsed = jobInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "Confira os campos indicados.", issues: zodIssues(parsed.error) }, { status: 400 });
  }
  const next = parsed.data as JobFields;
  const before = rowToFields(job);
  const changed = changedFieldNames(before, next);

  if (job.status !== "DRAFT") {
    // Published or paused jobs are edited only if the result is still publishable and no application exists.
    if (changed.length && await jobHasApplications(job.id)) {
      return NextResponse.json({
        message: "Esta vaga já recebeu candidaturas e suas condições não podem mais ser alteradas.", issues: {}, locked: changed
      }, { status: 409 });
    }
    const issues = validateForPublication(next);
    if (Object.keys(issues).length) {
      return NextResponse.json({ message: "Confira os campos indicados. As alterações não foram salvas.", issues }, { status: 400 });
    }
  }
  const { user } = actor;
  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.job.update({ where: { id: job.id }, data: fieldsToData(next) });
    if (changed.length) {
      await tx.auditEvent.create({
        data: {
          actorUserId: user.id, eventType: "JOB_UPDATED", subjectType: "Job", subjectId: job.id,
          // Names of the changed fields only; the content of the job is never copied into the audit trail.
          metadata: { companyId: job.companyId, status: job.status, changedFields: changed, changeCount: changed.length }
        }
      });
    }
    return saved;
  });
  return NextResponse.json({ ok: true, job: toJobResponse(updated) });
}
