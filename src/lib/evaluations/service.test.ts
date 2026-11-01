import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx } = vi.hoisted(() => {
  const tx = { interviewEvaluation: { create: vi.fn() }, auditEvent: { create: vi.fn() } };
  return { tx, prismaMock: {
    interview: { findFirst: vi.fn() }, auditEvent: { create: vi.fn(), count: vi.fn(), findFirst: vi.fn() },
    interviewEvaluation: { groupBy: vi.fn() }, $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx))
  } };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { evaluationInputSchema, evaluationState, ratingDistribution, submitEvaluation } from "./service";

const completedAt = new Date("2026-11-01T12:00:00Z");
const interview = (over = {}) => ({ id: "i1", status: "COMPLETED", completedAt, applicationId: "a1", application: { job: { companyId: "c1" } }, evaluation: null, ...over });
const valid = evaluationInputSchema.parse({ accessibilityRating: 4, inclusionRating: 5, comment: "  Ótimo atendimento  " });

describe("post-interview evaluation (SPEC-018)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.auditEvent.count.mockResolvedValue(1);
    tx.interviewEvaluation.create.mockResolvedValue({ id: "e1" });
  });

  it("requires both ratings from 1 to 5 and accepts an empty comment", () => {
    expect(valid.comment).toBe("Ótimo atendimento");
    expect(evaluationInputSchema.safeParse({ accessibilityRating: 4 }).success).toBe(false);
    expect(evaluationInputSchema.safeParse({ accessibilityRating: 0, inclusionRating: 5 }).success).toBe(false);
    expect(evaluationInputSchema.safeParse({ accessibilityRating: 6, inclusionRating: 5 }).success).toBe(false);
    expect(evaluationInputSchema.safeParse({ accessibilityRating: 3.5, inclusionRating: 5 }).success).toBe(false);
    expect(evaluationInputSchema.parse({ accessibilityRating: 1, inclusionRating: 1, comment: "   " }).comment).toBeUndefined();
    expect(evaluationInputSchema.safeParse({ accessibilityRating: 1, inclusionRating: 1, comment: "x".repeat(1001) }).success).toBe(false);
    expect(evaluationInputSchema.safeParse({ accessibilityRating: 1, inclusionRating: 1, companyId: "c2" }).success).toBe(false);
  });

  it("registers one evaluation for the candidate's own completed interview within 60 days", async () => {
    prismaMock.interview.findFirst.mockResolvedValue(interview());
    const now = new Date("2026-12-30T11:00:00Z");
    expect(await submitEvaluation("cand", "i1", valid, now)).toEqual({ ok: true });
    expect(prismaMock.interview.findFirst.mock.calls[0][0].where).toEqual({ id: "i1", application: { candidateUserId: "cand" } });
    expect(tx.interviewEvaluation.create.mock.calls[0][0].data).toMatchObject({ interviewId: "i1", candidateUserId: "cand", companyId: "c1", accessibilityRating: 4, inclusionRating: 5, comment: "Ótimo atendimento" });
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "EVALUATION_SUBMITTED" });
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain("Ótimo atendimento");
  });

  it.each([
    ["someone else's interview", null, 404],
    ["interview not completed", interview({ status: "SCHEDULED", completedAt: null }), 409],
    ["a second evaluation", interview({ evaluation: { id: "e0" } }), 409],
    ["after 60 days", interview(), 409]
  ])("refuses %s and records the attempt", async (_name, found, status) => {
    prismaMock.interview.findFirst.mockResolvedValue(found);
    const now = _name === "after 60 days" ? new Date("2026-12-31T12:00:00Z") : new Date("2026-11-02T12:00:00Z");
    expect(await submitEvaluation("cand", "i1", valid, now)).toMatchObject({ ok: false, status });
    expect(tx.interviewEvaluation.create).not.toHaveBeenCalled();
    expect(prismaMock.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "EVALUATION_REFUSED" });
  });

  it("records repeated refused attempts for administrative review, without blocking", async () => {
    prismaMock.interview.findFirst.mockResolvedValue(interview({ evaluation: { id: "e0" } }));
    prismaMock.auditEvent.count.mockResolvedValue(3);
    prismaMock.auditEvent.findFirst.mockResolvedValue(null);
    await submitEvaluation("cand", "i1", valid, new Date("2026-11-02T12:00:00Z"));
    expect(prismaMock.auditEvent.create.mock.calls.map((call) => call[0].data.eventType)).toEqual(["EVALUATION_REFUSED", "EVALUATION_ABUSE_SUSPECTED"]);
  });

  it("treats a concurrent duplicate as a refusal", async () => {
    prismaMock.interview.findFirst.mockResolvedValue(interview());
    tx.interviewEvaluation.create.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "P2002" }));
    expect(await submitEvaluation("cand", "i1", valid, new Date("2026-11-02T12:00:00Z"))).toMatchObject({ ok: false, status: 409 });
  });

  it("tells the candidate whether they can still evaluate", () => {
    expect(evaluationState({ completedAt: null, evaluation: null }, completedAt)).toBeNull();
    expect(evaluationState({ completedAt, evaluation: null }, new Date("2026-11-20T00:00:00Z"))).toMatchObject({ kind: "OPEN", deadline: "2026-12-31T12:00:00.000Z" });
    expect(evaluationState({ completedAt, evaluation: null }, new Date("2027-01-01T00:00:00Z"))).toMatchObject({ kind: "EXPIRED" });
    expect(evaluationState({ completedAt, evaluation: { submittedAt: completedAt, accessibilityRating: 4, inclusionRating: 5, comment: null } }, completedAt)).toMatchObject({ kind: "DONE", accessibilityRating: 4 });
  });

  it("gives SPEC-021 only counts per number of stars", async () => {
    prismaMock.interviewEvaluation.groupBy
      .mockResolvedValueOnce([{ accessibilityRating: 5, _count: { _all: 2 } }, { accessibilityRating: 3, _count: { _all: 1 } }])
      .mockResolvedValueOnce([{ inclusionRating: 4, _count: { _all: 3 } }]);
    expect(await ratingDistribution("c1")).toEqual({ accessibility: { 1: 0, 2: 0, 3: 1, 4: 0, 5: 2 }, inclusion: { 1: 0, 2: 0, 3: 0, 4: 3, 5: 0 } });
  });
});
