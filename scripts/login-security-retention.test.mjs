import { describe, expect, it, vi } from "vitest";
import { getLoginAttemptRetentionCutoff, purgeExpiredLoginSecurityRecords } from "./login-security-retention.mjs";
describe("login security record retention", () => {
  it("keeps a rolling 24-hour diagnostic window for attempts", () => {
    const now = new Date("2026-10-25T12:00:00.000Z");
    expect(getLoginAttemptRetentionCutoff(now).toISOString()).toBe("2026-10-24T12:00:00.000Z");
  });
  it("defaults to a dry run and never deletes records", async () => {
    const prisma = {
      loginAttempt: { count: vi.fn().mockResolvedValue(7), deleteMany: vi.fn() },
      loginBlock: { count: vi.fn().mockResolvedValue(2), deleteMany: vi.fn() }
    };
    const now = new Date("2026-10-25T12:00:00.000Z");
    const result = await purgeExpiredLoginSecurityRecords(prisma, { now });
    expect(result).toMatchObject({ eligibleAttempts: 7, eligibleBlocks: 2, deletedAttempts: 0, deletedBlocks: 0, executed: false });
    expect(prisma.loginAttempt.count).toHaveBeenCalledWith({ where: { createdAt: { lt: new Date("2026-10-24T12:00:00.000Z") } } });
    expect(prisma.loginBlock.count).toHaveBeenCalledWith({ where: { blockedUntil: { lt: now } } });
    expect(prisma.loginAttempt.deleteMany).not.toHaveBeenCalled();
    expect(prisma.loginBlock.deleteMany).not.toHaveBeenCalled();
  });
  it("deletes only attempts older than 24 hours and already expired blocks", async () => {
    const tx = {
      loginAttempt: { count: vi.fn().mockResolvedValue(7), deleteMany: vi.fn().mockResolvedValue({ count: 7 }) },
      loginBlock: { count: vi.fn().mockResolvedValue(2), deleteMany: vi.fn().mockResolvedValue({ count: 2 }) }
    };
    const prisma = { $transaction: vi.fn(async callback => callback(tx)) };
    const now = new Date("2026-10-25T12:00:00.000Z");
    const result = await purgeExpiredLoginSecurityRecords(prisma, { now, execute: true });
    expect(result).toMatchObject({ eligibleAttempts: 7, eligibleBlocks: 2, deletedAttempts: 7, deletedBlocks: 2, executed: true });
    expect(tx.loginAttempt.deleteMany).toHaveBeenCalledWith({ where: { createdAt: { lt: new Date("2026-10-24T12:00:00.000Z") } } });
    expect(tx.loginBlock.deleteMany).toHaveBeenCalledWith({ where: { blockedUntil: { lt: now } } });
  });
});
