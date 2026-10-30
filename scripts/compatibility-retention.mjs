/**
 * Compatibility-result retention (SPEC-007 section 6.2, OPEN-006): one calendar year from executedAt, followed by safe disposal.
 * Rows are immutable (updates are refused by a database trigger); only the purge deletes them.
 */
export function getCompatibilityRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return cutoff;
}

export async function purgeExpiredCompatibilityResults(prisma, { now = new Date(), execute = false } = {}) {
  const cutoff = getCompatibilityRetentionCutoff(now);
  const where = { executedAt: { lt: cutoff } };
  if (!execute) {
    return { cutoff, eligibleCount: await prisma.compatibilityResult.count({ where }), deletedCount: 0, executed: false };
  }
  return prisma.$transaction(async tx => {
    const eligibleCount = await tx.compatibilityResult.count({ where });
    const deletion = await tx.compatibilityResult.deleteMany({ where });
    // Saved travel estimates follow the same one-year retention (they are re-estimated on next use).
    await tx.travelTimeCache?.deleteMany({ where: { computedAt: { lt: cutoff } } });
    return { cutoff, eligibleCount, deletedCount: deletion.count, executed: true };
  });
}
