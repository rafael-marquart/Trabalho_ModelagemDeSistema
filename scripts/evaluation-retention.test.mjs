import { describe, expect, it, vi } from "vitest";
import { anonymizeExpiredEvaluations } from "./evaluation-retention.mjs";

describe("evaluation retention (SPEC-018)", () => {
  const now = new Date("2026-11-01T12:00:00Z");
  const where = { submittedAt: { lt: new Date("2025-11-01T12:00:00Z") }, anonymizedAt: null };
  it("only counts in a dry run", async () => {
    const prisma = { interviewEvaluation: { count: vi.fn().mockResolvedValue(2), updateMany: vi.fn() } };
    expect(await anonymizeExpiredEvaluations(prisma, { now })).toMatchObject({ eligibleCount: 2, executed: false });
    expect(prisma.interviewEvaluation.updateMany).not.toHaveBeenCalled();
  });
  it("removes the links to people and the comment, keeping company, ratings and only the year", async () => {
    const tx = { interviewEvaluation: { findMany: vi.fn().mockResolvedValue([{ id: "e1", submittedAt: new Date("2025-06-17T14:00:00Z") }]), update: vi.fn() } };
    const prisma = { $transaction: vi.fn(async cb => cb(tx)) };
    expect(await anonymizeExpiredEvaluations(prisma, { now, execute: true })).toMatchObject({ anonymizedCount: 1, executed: true });
    expect(tx.interviewEvaluation.findMany.mock.calls[0][0].where).toEqual(where);
    expect(tx.interviewEvaluation.update).toHaveBeenCalledWith({ where: { id: "e1" }, data: { interviewId: null, applicationId: null, candidateUserId: null, comment: null, anonymizedAt: now, submittedAt: new Date("2025-01-01T00:00:00Z") } });
  });
});
