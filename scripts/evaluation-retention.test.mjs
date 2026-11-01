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
  it("removes the links to people and the comment, keeping only company and ratings", async () => {
    const prisma = { interviewEvaluation: { updateMany: vi.fn().mockResolvedValue({ count: 3 }) } };
    expect(await anonymizeExpiredEvaluations(prisma, { now, execute: true })).toMatchObject({ anonymizedCount: 3, executed: true });
    expect(prisma.interviewEvaluation.updateMany).toHaveBeenCalledWith({ where, data: { interviewId: null, applicationId: null, candidateUserId: null, comment: null, anonymizedAt: now } });
  });
});
