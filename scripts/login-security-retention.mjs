const ATTEMPT_RETENTION_MS = 24 * 60 * 60 * 1000;
export function getLoginAttemptRetentionCutoff(now = new Date()) {
  return new Date(now.getTime() - ATTEMPT_RETENTION_MS);
}
export async function purgeExpiredLoginSecurityRecords(prisma, { now = new Date(), execute = false } = {}) {
  const attemptCutoff = getLoginAttemptRetentionCutoff(now);
  const attemptsWhere = { createdAt: { lt: attemptCutoff } };
  const blocksWhere = { blockedUntil: { lt: now } };
  if (!execute) {
    const [eligibleAttempts, eligibleBlocks] = await Promise.all([
      prisma.loginAttempt.count({ where: attemptsWhere }),
      prisma.loginBlock.count({ where: blocksWhere })
    ]);
    return { attemptCutoff, eligibleAttempts, eligibleBlocks, deletedAttempts: 0, deletedBlocks: 0, executed: false };
  }
  return prisma.$transaction(async tx => {
    const [attemptCount, blockCount] = await Promise.all([
      tx.loginAttempt.count({ where: attemptsWhere }),
      tx.loginBlock.count({ where: blocksWhere })
    ]);
    const [attemptDeletion, blockDeletion] = await Promise.all([
      tx.loginAttempt.deleteMany({ where: attemptsWhere }),
      tx.loginBlock.deleteMany({ where: blocksWhere })
    ]);
    return {
      attemptCutoff, eligibleAttempts: attemptCount, eligibleBlocks: blockCount,
      deletedAttempts: attemptDeletion.count, deletedBlocks: blockDeletion.count, executed: true
    };
  });
}
