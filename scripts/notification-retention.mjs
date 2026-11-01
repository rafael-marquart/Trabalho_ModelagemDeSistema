/**
 * Notification records (SPEC-017, OPEN-069): technical records of e-mail delivery kept for one year like the audit
 * (OPEN-006). Only finished rows (sent or failed for good) are removed; pending ones are never discarded.
 */
export function getNotificationRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return cutoff;
}

export async function purgeExpiredNotifications(prisma, { now = new Date(), execute = false } = {}) {
  const cutoff = getNotificationRetentionCutoff(now);
  const where = { createdAt: { lt: cutoff }, status: { in: ["SENT", "FAILED"] } };
  if (!execute) return { cutoff, eligibleCount: await prisma.notification.count({ where }), deletedCount: 0, executed: false };
  const deletion = await prisma.notification.deleteMany({ where });
  return { cutoff, eligibleCount: deletion.count, deletedCount: deletion.count, executed: true };
}
