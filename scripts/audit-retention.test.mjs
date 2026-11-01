import { describe, expect, it, vi } from "vitest";
import { getAuditRetentionCutoff, purgeExpiredAuditEvents } from "./audit-retention.mjs";

describe("audit event retention", () => {
  it("uses a one-calendar-year cutoff", () => {
    const now = new Date("2026-10-25T12:00:00.000Z");
    expect(getAuditRetentionCutoff(now).toISOString()).toBe("2025-10-25T12:00:00.000Z");
  });

  it("defaults to a dry run and never deletes records", async () => {
    const prisma = { auditEvent: { count: vi.fn().mockResolvedValue(4), deleteMany: vi.fn() } };

    const result = await purgeExpiredAuditEvents(prisma, { now: new Date("2026-10-25T12:00:00.000Z") });

    expect(result).toMatchObject({ eligibleCount: 4, deletedCount: 0, executed: false });
    expect(prisma.auditEvent.count).toHaveBeenCalledWith({
      where: { createdAt: { lt: new Date("2025-10-25T12:00:00.000Z") }, retentionHold: false }
    });
    expect(prisma.auditEvent.deleteMany).not.toHaveBeenCalled();
  });

  it("deletes only expired records without a retention hold and audits the purge", async () => {
    const tx = {
      auditEvent: {
        count: vi.fn().mockResolvedValue(3),
        deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
        create: vi.fn().mockResolvedValue({ id: "purge-audit" })
      }
    };
    const prisma = { $transaction: vi.fn(async callback => callback(tx)) };

    const result = await purgeExpiredAuditEvents(prisma, {
      now: new Date("2026-10-25T12:00:00.000Z"),
      execute: true
    });

    expect(result).toMatchObject({ eligibleCount: 3, deletedCount: 3, executed: true });
    expect(tx.auditEvent.deleteMany).toHaveBeenCalledWith({
      where: { createdAt: { lt: new Date("2025-10-25T12:00:00.000Z") }, retentionHold: false }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: {
        eventType: "AUDIT_RETENTION_PURGE",
        subjectType: "AuditEvent",
        metadata: { deletedCount: 3, cutoff: "2025-10-25T12:00:00.000Z" }
      }
    });
  });

  it("does not create a purge event when nothing was deleted", async () => {
    const tx = {
      auditEvent: {
        count: vi.fn().mockResolvedValue(0),
        deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
        create: vi.fn()
      }
    };
    const prisma = { $transaction: vi.fn(async callback => callback(tx)) };

    await purgeExpiredAuditEvents(prisma, { now: new Date("2026-10-25T12:00:00.000Z"), execute: true });

    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });
});
