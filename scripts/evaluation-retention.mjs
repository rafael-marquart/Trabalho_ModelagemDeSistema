/**
 * Post-interview evaluations (SPEC-018, OPEN-073): one year after submission, the individual record is irreversibly
 * anonymized — the links to the interview, the application and the candidate, and the comment are removed. Only the
 * company, the two ratings and the year of submission remain, for the aggregate distribution by number of stars (SPEC-021).
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
  // The submission date is reduced to its year (SPEC-021), which needs one update per row; a transaction keeps it atomic.
  return prisma.$transaction(async tx => {
    const rows = await tx.interviewEvaluation.findMany({ where, select: { id: true, submittedAt: true } });
    for (const row of rows) {
      await tx.interviewEvaluation.update({
        where: { id: row.id },
        data: { interviewId: null, applicationId: null, candidateUserId: null, comment: null, anonymizedAt: now, submittedAt: new Date(Date.UTC(row.submittedAt.getUTCFullYear(), 0, 1)) }
      });
    }
    return { cutoff, eligibleCount: rows.length, anonymizedCount: rows.length, executed: true };
  });
}
