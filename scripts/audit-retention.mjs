/**
 * Audit-event retention policy: one calendar year from createdAt.
 * Events marked retentionHold are preserved for legal/operational obligations.
 */
export function getAuditRetentionCutoff(now = new Date()) {
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - 1);
  return cutoff;
}

export async function purgeExpiredAuditEvents(prisma, { now = new Date(), execute = false } = {}) {
  const cutoff = getAuditRetentionCutoff(now);
  const where = { createdAt: { lt: cutoff }, retentionHold: false };

  if (!execute) {
    const eligibleCount = await prisma.auditEvent.count({ where });
    return { cutoff, eligibleCount, deletedCount: 0, executed: false };
  }

  return prisma.$transaction(async tx => {
    const eligibleCount = await tx.auditEvent.count({ where });
    const deletion = await tx.auditEvent.deleteMany({ where });
    if (deletion.count > 0) {
      await tx.auditEvent.create({
        data: {
          eventType: "AUDIT_RETENTION_PURGE",
          subjectType: "AuditEvent",
          metadata: {
            deletedCount: deletion.count,
            cutoff: cutoff.toISOString()
          }
        }
      });
    }
    return {
      cutoff,
      eligibleCount,
      deletedCount: deletion.count,
      executed: true
    };
  });
}
