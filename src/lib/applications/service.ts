import { prisma } from "@/lib/prisma";
import { analyzeWithContext, loadCandidateContext } from "@/lib/compatibility/service";
import type { TravelEstimator } from "@/lib/compatibility/travel";
import { checkJobAvailability } from "@/lib/jobs/availability";
import { BLOCKING_STAGES } from "@/lib/jobs/applications";
import { stageLabels } from "./stages";

export type RefusalCode = "JOB_NOT_FOUND" | "JOB_UNAVAILABLE" | "INCOMPATIBLE" | "ELIGIBILITY_PENDING" | "SCORE_UNAVAILABLE" | "DUPLICATE";
export type ApplicationView = { appliedAt: string; stage: string; stageLabel: string; score: number };
export type ApplyResult =
  | { ok: true; application: ApplicationView }
  | { ok: false; code: RefusalCode; message: string; status: number };

const refuse = (code: RefusalCode, message: string, status = 409): ApplyResult => ({ ok: false, code, message, status });
const view = (row: { appliedAt: Date; stage: string; score: number }): ApplicationView =>
  ({ appliedAt: row.appliedAt.toISOString(), stage: row.stage, stageLabel: stageLabels[row.stage] ?? row.stage, score: row.score });
const lowerFirst = (text: string) => text.charAt(0).toLocaleLowerCase("pt-BR") + text.slice(1);

class Refused extends Error {
  constructor(readonly result: ApplyResult) { super("refused"); }
}

/** The candidate's application to a job that still blocks a new one (in progress or hired), if any. */
export async function findBlockingApplication(userId: string, jobId: string): Promise<ApplicationView | null> {
  const row = await prisma.application.findFirst({
    where: { candidateUserId: userId, jobId, stage: { in: [...BLOCKING_STAGES] } }, orderBy: { appliedAt: "desc" }
  });
  return row ? view(row) : null;
}

/**
 * SPEC-011 (OPEN-048/049): registers an application only after every check passes, in this order: job available
 * (SPEC-009), no active application for the same job (RB-14), SPEC-007 result without critical barrier and with a
 * complete score. A refusal says why and creates nothing; the record and its audit event are written together.
 */
export async function applyToJob(userId: string, jobId: string, deps: { estimator?: TravelEstimator; now?: Date } = {}): Promise<ApplyResult> {
  const availability = await checkJobAvailability(jobId, deps.now);
  if (!availability) return refuse("JOB_NOT_FOUND", "Vaga não encontrada.", 404);
  if (availability.code !== "OPEN") return refuse("JOB_UNAVAILABLE", `Não é possível se candidatar: ${lowerFirst(availability.message)}`);
  const existing = await findBlockingApplication(userId, jobId);
  if (existing) return refuse("DUPLICATE", `Você já se candidatou a esta vaga (etapa ${existing.stageLabel}).`);

  const job = await prisma.job.findFirst({ where: { id: jobId, status: "OPEN", origin: "OWN" } });
  if (!job) return refuse("JOB_UNAVAILABLE", "Não é possível se candidatar: a vaga deixou de estar aberta.");
  const result = await analyzeWithContext(userId, await loadCandidateContext(userId), job, undefined, deps);
  if (result.status === "INCOMPATIBLE") {
    return refuse("INCOMPATIBLE", "Não é possível se candidatar: a vaga declara não ter um recurso que você marcou como indispensável.");
  }
  if ((result.critical?.pending ?? []).length) {
    return refuse("ELIGIBILITY_PENDING", "Não é possível se candidatar ainda: a vaga não informou um recurso que você marcou como indispensável, então a elegibilidade não foi concluída.");
  }
  if (result.status !== "COMPLETE" || result.score === null) {
    const fromProfile = result.missing.some((item) => item.responsible === "CANDIDATE");
    return refuse("SCORE_UNAVAILABLE", fromProfile
      ? "A candidatura exige o score de compatibilidade calculado. Complete os dados indicados no seu perfil e tente de novo."
      : "A candidatura exige o score de compatibilidade calculado, e faltam informações que a empresa precisa completar na vaga.");
  }
  const score = result.score;

  try {
    const created = await prisma.$transaction(async (tx) => {
      // The job is read again inside the transaction: a status change after the checks above wins (SPEC-009).
      const stillOpen = await tx.job.findFirst({ where: { id: jobId, status: "OPEN" }, select: { id: true } });
      if (!stillOpen) throw new Refused(refuse("JOB_UNAVAILABLE", "Não é possível se candidatar: a vaga deixou de estar aberta."));
      const application = await tx.application.create({
        data: { candidateUserId: userId, jobId, score, compatibilityResultId: result.id }
      });
      await tx.auditEvent.create({
        data: { actorUserId: userId, eventType: "APPLICATION_SUBMITTED", subjectType: "Application", subjectId: application.id, metadata: { jobId, stage: application.stage } }
      });
      return application;
    });
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
