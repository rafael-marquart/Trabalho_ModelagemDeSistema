import { describe, expect, it, vi } from "vitest";
import { getCompatibilityRetentionCutoff, purgeExpiredCompatibilityResults } from "./compatibility-retention.mjs";

describe("compatibility result retention", () => {
  it("cuts off one year back", () => {
    expect(getCompatibilityRetentionCutoff(new Date("2026-10-28T12:00:00Z")).toISOString()).toBe("2025-10-28T12:00:00.000Z");
  });
  it("only counts in a dry run", async () => {
    const prisma = { compatibilityResult: { count: vi.fn().mockResolvedValue(3), deleteMany: vi.fn() } };
    const result = await purgeExpiredCompatibilityResults(prisma, { now: new Date("2026-10-28T12:00:00Z") });
    expect(result).toMatchObject({ eligibleCount: 3, deletedCount: 0, executed: false });
    expect(prisma.compatibilityResult.deleteMany).not.toHaveBeenCalled();
  });
  it("deletes only expired rows when executed", async () => {
    const tx = { compatibilityResult: { count: vi.fn().mockResolvedValue(2), deleteMany: vi.fn().mockResolvedValue({ count: 2 }) } };
    const prisma = { $transaction: vi.fn(async cb => cb(tx)) };
    const result = await purgeExpiredCompatibilityResults(prisma, { now: new Date("2026-10-28T12:00:00Z"), execute: true });
    expect(result).toMatchObject({ deletedCount: 2, executed: true });
    expect(tx.compatibilityResult.deleteMany).toHaveBeenCalledWith({ where: { executedAt: { lt: new Date("2025-10-28T12:00:00Z") } } });
  });
});
