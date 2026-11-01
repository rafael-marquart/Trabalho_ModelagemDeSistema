import { z } from "zod";
import { prisma } from "@/lib/prisma";

// SPEC-018: post-interview evaluation by the candidate (OPEN-070 to OPEN-073). One per completed interview, within 60
// calendar days of its completion, never edited. Individual rows are restricted; only the aggregate distribution by
// number of stars is meant for the public note (SPEC-021).

export const EVALUATION_WINDOW_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Refused attempts by the same person within 24 h that are recorded as a possible abuse for administrative review. */
export const ABUSE_THRESHOLD = 3;

const rating = (label: string) => z.number({ message: `Escolha de 1 a 5 estrelas para ${label}.` }).int().min(1, `Escolha de 1 a 5 estrelas para ${label}.`).max(5, `Escolha de 1 a 5 estrelas para ${label}.`);
export const evaluationInputSchema = z.object({
  accessibilityRating: rating("acessibilidade"),
  inclusionRating: rating("postura inclusiva"),
  comment: z.string().max(1000, "Use até 1000 caracteres.").optional()
    .transform((value) => value?.replace(/\r\n/g, "\n").trim() || undefined)
    .refine((value) => !value || !/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/.test(value), "O comentário tem caracteres inválidos.")
}).strict();
export type EvaluationInput = z.infer<typeof evaluationInputSchema>;

export const evaluationDeadline = (completedAt: Date) => new Date(completedAt.getTime() + EVALUATION_WINDOW_DAYS * DAY_MS);

export type EvaluationState =
  | { kind: "OPEN"; deadline: string }
  | { kind: "EXPIRED"; deadline: string }
  | { kind: "DONE"; submittedAt: string; accessibilityRating: number; inclusionRating: number; comment: string | null };

/** What the candidate can do about one completed interview: evaluate, nothing (expired) or see their own evaluation. */
export function evaluationState(interview: { completedAt: Date | null; evaluation: { submittedAt: Date; accessibilityRating: number; inclusionRating: number; comment: string | null } | null }, now: Date): EvaluationState | null {
  if (!interview.completedAt) return null;
  if (interview.evaluation) {
    const { submittedAt, accessibilityRating, inclusionRating, comment } = interview.evaluation;
    return { kind: "DONE", submittedAt: submittedAt.toISOString(), accessibilityRating, inclusionRating, comment };
  }
  const deadline = evaluationDeadline(interview.completedAt);
  return { kind: now < deadline ? "OPEN" : "EXPIRED", deadline: deadline.toISOString() };
}

type Result = { ok: true } | { ok: false; status: number; message: string };

async function refuse(userId: string, interviewId: string, reason: string, status: number, message: string, now: Date): Promise<Result> {
  // Refused attempts are relevant events; repeated ones are recorded for administrative review, with no automatic block.
  await prisma.auditEvent.create({ data: { actorUserId: userId, eventType: "EVALUATION_REFUSED", subjectType: "Interview", subjectId: interviewId, metadata: { reason } } });
  const since = new Date(now.getTime() - DAY_MS);
  const recent = await prisma.auditEvent.count({ where: { actorUserId: userId, eventType: "EVALUATION_REFUSED", createdAt: { gte: since } } });
  if (recent >= ABUSE_THRESHOLD) {
    const flagged = await prisma.auditEvent.findFirst({ where: { actorUserId: userId, eventType: "EVALUATION_ABUSE_SUSPECTED", createdAt: { gte: since } }, select: { id: true } });
    if (!flagged) {
      await prisma.auditEvent.create({ data: { actorUserId: userId, eventType: "EVALUATION_ABUSE_SUSPECTED", subjectType: "User", subjectId: userId, metadata: { refusedAttemptsIn24h: recent, forReview: true } } });
    }
  }
  return { ok: false, status, message };
}

/**
 * Registers the candidate's evaluation of a completed interview of their own application (OPEN-070/071/072). Ownership,
 * completion, the 60-day window and the absence of an earlier evaluation are all checked here; a refusal writes nothing
 * but its audit entry.
 */
export async function submitEvaluation(userId: string, interviewId: string, input: EvaluationInput, now: Date = new Date()): Promise<Result> {
  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, application: { candidateUserId: userId } },
    select: { id: true, status: true, completedAt: true, applicationId: true, application: { select: { job: { select: { companyId: true } } } }, evaluation: { select: { id: true } } }
  });
  if (!interview) return refuse(userId, interviewId, "NOT_ELIGIBLE", 404, "Entrevista não encontrada.", now);
  if (interview.status !== "COMPLETED" || !interview.completedAt) return refuse(userId, interviewId, "NOT_COMPLETED", 409, "Só é possível avaliar depois que a entrevista for concluída.", now);
  if (interview.evaluation) return refuse(userId, interviewId, "DUPLICATE", 409, "Você já avaliou este processo. A avaliação enviada não pode ser alterada.", now);
  if (now >= evaluationDeadline(interview.completedAt)) return refuse(userId, interviewId, "EXPIRED", 409, `O prazo de ${EVALUATION_WINDOW_DAYS} dias para avaliar esta entrevista terminou.`, now);
  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.interviewEvaluation.create({ data: {
        interviewId: interview.id, applicationId: interview.applicationId, candidateUserId: userId, companyId: interview.application.job.companyId,
        accessibilityRating: input.accessibilityRating, inclusionRating: input.inclusionRating, comment: input.comment ?? null, submittedAt: now
      } });
      await tx.auditEvent.create({ data: { actorUserId: userId, eventType: "EVALUATION_SUBMITTED", subjectType: "InterviewEvaluation", subjectId: created.id, metadata: { interviewId: interview.id, companyId: interview.application.job.companyId } } });
      // SPEC-021: the public note changed; the new distribution (counts only) is recorded for traceability.
      const companyId = interview.application.job.companyId;
      const [accessibility, inclusion] = await Promise.all([
        tx.interviewEvaluation.groupBy({ by: ["accessibilityRating"], where: { companyId }, _count: { _all: true } }),
        tx.interviewEvaluation.groupBy({ by: ["inclusionRating"], where: { companyId }, _count: { _all: true } })
      ]);
      const counts = (rows: { _count: { _all: number } }[], key: (row: never) => number) => Object.fromEntries([1, 2, 3, 4, 5].map((star) => [star, rows.find((row) => key(row as never) === star)?._count._all ?? 0]));
      await tx.auditEvent.create({ data: {
        actorUserId: null, eventType: "PUBLIC_RATING_UPDATED", subjectType: "Company", subjectId: companyId,
        metadata: {
          total: accessibility.reduce((sum, row) => sum + row._count._all, 0),
          accessibility: counts(accessibility, (row: { accessibilityRating: number }) => row.accessibilityRating),
          inclusion: counts(inclusion, (row: { inclusionRating: number }) => row.inclusionRating)
        }
      } });
    });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return refuse(userId, interviewId, "DUPLICATE", 409, "Você já avaliou este processo. A avaliação enviada não pode ser alterada.", now);
    }
    throw error;
  }
  return { ok: true };
}

/**
 * For SPEC-021: how many valid evaluations a company received with each number of stars, per criterion. Counts only,
 * never identities, identifiers or comments (OPEN-073).
 */
export async function ratingDistribution(companyId: string) {
  const [accessibility, inclusion] = await Promise.all([
    prisma.interviewEvaluation.groupBy({ by: ["accessibilityRating"], where: { companyId }, _count: { _all: true } }),
    prisma.interviewEvaluation.groupBy({ by: ["inclusionRating"], where: { companyId }, _count: { _all: true } })
  ]);
  const stars = [1, 2, 3, 4, 5] as const;
  return {
    accessibility: Object.fromEntries(stars.map((star) => [star, accessibility.find((row) => row.accessibilityRating === star)?._count._all ?? 0])) as Record<1 | 2 | 3 | 4 | 5, number>,
    inclusion: Object.fromEntries(stars.map((star) => [star, inclusion.find((row) => row.inclusionRating === star)?._count._all ?? 0])) as Record<1 | 2 | 3 | 4 | 5, number>
  };
}
