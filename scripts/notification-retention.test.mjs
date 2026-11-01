import { describe, expect, it, vi } from "vitest";
import { purgeExpiredNotifications } from "./notification-retention.mjs";

describe("notification retention (SPEC-017)", () => {
  const now = new Date("2026-11-01T12:00:00Z");
  const where = { createdAt: { lt: new Date("2025-11-01T12:00:00Z") }, status: { in: ["SENT", "FAILED"] } };
  it("only counts in a dry run and never touches pending rows", async () => {
    const prisma = { notification: { count: vi.fn().mockResolvedValue(4), deleteMany: vi.fn() } };
    expect(await purgeExpiredNotifications(prisma, { now })).toMatchObject({ eligibleCount: 4, executed: false });
    expect(prisma.notification.count).toHaveBeenCalledWith({ where });
    expect(prisma.notification.deleteMany).not.toHaveBeenCalled();
  });
  it("deletes finished rows older than one year when executed", async () => {
    const prisma = { notification: { deleteMany: vi.fn().mockResolvedValue({ count: 2 }) } };
    expect(await purgeExpiredNotifications(prisma, { now, execute: true })).toMatchObject({ deletedCount: 2, executed: true });
    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({ where });
  });
});
