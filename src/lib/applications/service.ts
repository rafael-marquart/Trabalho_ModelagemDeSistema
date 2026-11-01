import { prisma } from "@/lib/prisma";
import { analyzeWithContext, loadCandidateContext, toView } from "@/lib/compatibility/service";
import type { TravelEstimator } from "@/lib/compatibility/travel";
import { checkJobAvailability } from "@/lib/jobs/availability";
import { BLOCKING_STAGES } from "@/lib/jobs/applications";
import { stageLabels } from "./stages";
import { enqueueApplicationSubmitted, kickNotificationDelivery } from "@/lib/notifications/service";

export type RefusalCode = "JOB_NOT_FOUND" | "JOB_UNAVAILABLE" | "INCOMPATIBLE" | "DUPLICATE";
export type ApplicationView = { id: string; appliedAt: string; stage: string; stageLabel: string; score: number | null };
export type ApplyResult =
  | { ok: true; application: ApplicationView }
  | { ok: false; code: RefusalCode; message: string; status: number };

const refuse = (code: RefusalCode, message: string, status = 409): ApplyResult => ({ ok: false, code, message, status });
const view = (row: { id: string; appliedAt: Date; stage: string; score: number | null }): ApplicationView =>
  ({ id: row.id, appliedAt: row.appliedAt.toISOString(), stage: row.stage, stageLabel: stageLabels[row.stage] ?? row.stage, score: row.score });
const lowerFirst = (text: string) => text.charAt(0).toLocaleLowerCase("pt-BR") + text.slice(1);

class Refused extends Error {
  constructor(readonly result: ApplyResult) { super("refused"); }
}

/**
 * The SPEC-007 result registered with the candidate's latest application to a job, so it stays visible after the job
 * closes (it is not recalculated: closed jobs are not analyzed). Only the candidate's own application is read.
 */
export async function findApplicationResult(userId: string, jobId: string) {
  const row = await prisma.application.findFirst({
    where: { candidateUserId: userId, jobId }, orderBy: { appliedAt: "desc" },
    select: { appliedAt: true, compatibilityResult: { select: { id: true, executedAt: true, rulesVersion: true, jobId: true, outcome: true } } }
  });
  return row ? { appliedAt: row.appliedAt.toISOString(), result: toView(row.compatibilityResult) } : null;
}

/** The candidate's application to a job that still blocks a new one (in progress or hired), if any. */
export async function findBlockingApplication(userId: string, jobId: string): Promise<ApplicationView | null> {
  const row = await prisma.application.findFirst({
    where: { candidateUserId: userId, jobId, stage: { in: [...BLOCKING_STAGES] } }, orderBy: { appliedAt: "desc" }
  });
  return row ? view(row) : null;
}

/**
 * SPEC-011: registers an application only after every check passes, in this order: job available (SPEC-009), no active
 * application for the same job (RB-14) and no critical barrier in the SPEC-007 result (RB-02/RB-15). Missing data does
 * not prevent applying (decision of 31/10/2026, revising OPEN-048/049): the application keeps the result as it is, with
 * an empty score when it could not be calculated. A refusal says why and creates nothing.
 */
export async function applyToJob(userId: string, jobId: string, deps: { estimator?: TravelEstimator; now?: Date } = {}): Promise<ApplyResult> {
  const availability = await checkJobAvailability(jobId, deps.now);
  if (!availability) return refuse("JOB_NOT_FOUND", "Vaga não encontrada.", 404);
  if (availability.code !== "OPEN") return refuse("JOB_UNAVAILABLE", `Não é possível se candidatar: ${lowerFirst(availability.message)}`);
  const existing = await findBlockingApplication(userId, jobId);
  if (existing) return refuse("DUPLICATE", `Você já se candidatou a esta vaga (etapa ${existing.stageLabel}).`);

  const job = await prisma.job.findFirst({ where: { id: jobId, status: "OPEN", origin: "OWN" }, include: { company: { select: { tradeName: true, legalName: true } } } });
  if (!job) return refuse("JOB_UNAVAILABLE", "Não é possível se candidatar: a vaga deixou de estar aberta.");
  const result = await analyzeWithContext(userId, await loadCandidateContext(userId), job, undefined, deps);
  if (result.status === "INCOMPATIBLE") {
    return refuse("INCOMPATIBLE", "Não é possível se candidatar: a vaga declara não ter um recurso que você marcou como indispensável.");
  }
  // Without a complete analysis the score stays empty; it is never presumed (RB-16).
  const score = result.status === "COMPLETE" ? result.score : null;

  try {
    const created = await prisma.$transaction(async (tx) => {
      // The job is read again inside the transaction: a status change after the checks above wins (SPEC-009).
      const stillOpen = await tx.job.findFirst({ where: { id: jobId, status: "OPEN" }, select: { id: true } });
      if (!stillOpen) throw new Refused(refuse("JOB_UNAVAILABLE", "Não é possível se candidatar: a vaga deixou de estar aberta."));
      const application = await tx.application.create({
        data: { candidateUserId: userId, jobId, score, compatibilityResultId: result.id }
      });
      await tx.applicationStageEvent.create({
        data: { applicationId: application.id, fromStage: null, toStage: application.stage, kind: "SUBMITTED", actorUserId: userId }
      });
      await tx.auditEvent.create({
        data: { actorUserId: userId, eventType: "APPLICATION_SUBMITTED", subjectType: "Application", subjectId: application.id, metadata: { jobId, stage: application.stage } }
      });
      // SPEC-017: confirmation e-mail to the candidate, recorded with the application.
      await enqueueApplicationSubmitted(tx, {
        applicationId: application.id, jobId, candidateUserId: userId,
        jobTitle: job.title || "Vaga sem título", companyName: job.company.tradeName || job.company.legalName
      });
      return application;
    });
    kickNotificationDelivery();
    return { ok: true, application: view(created) };
  } catch (error) {
    if (error instanceof Refused) return error.result;
    // A concurrent request created the active application first (partial unique index).
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return refuse("DUPLICATE", "Você já se candidatou a esta vaga.");
    }
    throw error;
  }
}
