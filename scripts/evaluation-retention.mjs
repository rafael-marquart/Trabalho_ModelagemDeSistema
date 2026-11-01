/**
 * Post-interview evaluations (SPEC-018, OPEN-073): one year after submission, the individual record is irreversibly
 * anonymized — the links to the interview, the application and the candidate, and the comment are removed. Only the
 * company and the two ratings remain, for the aggregate distribution by number of stars (SPEC-021).
 */
export function getEvaluationRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return cutoff;
}

export async function anonymizeExpiredEvaluations(prisma, { now = new Date(), execute = false } = {}) {
  const cutoff = getEvaluationRetentionCutoff(now);
  const where = { submittedAt: { lt: cutoff }, anonymizedAt: null };
  if (!execute) return { cutoff, eligibleCount: await prisma.interviewEvaluation.count({ where }), anonymizedCount: 0, executed: false };
  const result = await prisma.interviewEvaluation.updateMany({
    where, data: { interviewId: null, applicationId: null, candidateUserId: null, comment: null, anonymizedAt: now }
  });
  return { cutoff, eligibleCount: result.count, anonymizedCount: result.count, executed: true };
}
