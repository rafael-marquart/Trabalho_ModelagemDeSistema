import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx, availabilityMock, analyzeMock } = vi.hoisted(() => {
  const tx = { job: { findFirst: vi.fn() }, application: { create: vi.fn() }, applicationStageEvent: { create: vi.fn() }, auditEvent: { create: vi.fn() } };
  return {
    tx,
    prismaMock: { job: { findFirst: vi.fn() }, application: { findFirst: vi.fn() }, $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)) },
    availabilityMock: vi.fn(), analyzeMock: vi.fn()
  };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/jobs/availability", () => ({ checkJobAvailability: availabilityMock }));
vi.mock("@/lib/compatibility/service", () => ({ loadCandidateContext: vi.fn().mockResolvedValue({}), analyzeWithContext: analyzeMock }));
import { applyToJob } from "./service";

const open = { code: "OPEN", label: "Aberta", message: "Inscrições abertas." };
const complete = { id: "result-1", status: "COMPLETE", score: 84, missing: [], critical: { applied: false, barriers: [], pending: [] } };

describe("register an application (SPEC-011)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    availabilityMock.mockResolvedValue(open);
    prismaMock.application.findFirst.mockResolvedValue(null);
    prismaMock.job.findFirst.mockResolvedValue({ id: "job-1", status: "OPEN" });
    tx.job.findFirst.mockResolvedValue({ id: "job-1" });
    tx.application.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: "app-1", stage: "INSCRITO", appliedAt: new Date("2026-10-31T15:00:00Z"), ...data }));
    analyzeMock.mockResolvedValue(complete);
  });

  it("registers a single application as Inscrito with the score and the SPEC-007 result, and audits it", async () => {
    const result = await applyToJob("cand", "job-1");
    expect(result).toMatchObject({ ok: true, application: { stage: "INSCRITO", stageLabel: "Inscrito", score: 84 } });
    expect(tx.application.create).toHaveBeenCalledWith({ data: { candidateUserId: "cand", jobId: "job-1", score: 84, compatibilityResultId: "result-1" } });
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ actorUserId: "cand", eventType: "APPLICATION_SUBMITTED", metadata: { jobId: "job-1", stage: "INSCRITO" } });
  });

  it.each([
    ["closed or paused job", () => availabilityMock.mockResolvedValue({ code: "CLOSED", label: "Encerrada", message: "Esta vaga foi encerrada." }), "JOB_UNAVAILABLE"],
    ["active application", () => prismaMock.application.findFirst.mockResolvedValue({ appliedAt: new Date(), stage: "TRIAGEM", score: 70 }), "DUPLICATE"],
    ["critical barrier", () => analyzeMock.mockResolvedValue({ ...complete, status: "INCOMPATIBLE", score: null }), "INCOMPATIBLE"]
  ])("refuses a %s and creates nothing", async (_name, arrange, code) => {
    arrange();
    const result = await applyToJob("cand", "job-1");
    expect(result).toMatchObject({ ok: false, code });
    expect(tx.application.create).not.toHaveBeenCalled();
  });

  it("lets a candidate apply with missing data, keeping the score empty (decision of 31/10/2026)", async () => {
    analyzeMock.mockResolvedValue({ ...complete, status: "INSUFFICIENT_DATA", score: null, missing: [{ responsible: "COMPANY" }], critical: { applied: false, barriers: [], pending: [{ needName: "Rampa" }] } });
    const result = await applyToJob("cand", "job-1");
    expect(result).toMatchObject({ ok: true, application: { stage: "INSCRITO", score: null } });
    expect(tx.application.create).toHaveBeenCalledWith({ data: expect.objectContaining({ score: null, compatibilityResultId: "result-1" }) });
  });

  it("refuses when the job closes between the checks and the record, leaving nothing behind", async () => {
    tx.job.findFirst.mockResolvedValue(null);
    expect(await applyToJob("cand", "job-1")).toMatchObject({ ok: false, code: "JOB_UNAVAILABLE" });
    expect(tx.application.create).not.toHaveBeenCalled();
  });

  it("turns a concurrent duplicate into a duplicate refusal", async () => {
    tx.application.create.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "P2002" }));
    expect(await applyToJob("cand", "job-1")).toMatchObject({ ok: false, code: "DUPLICATE" });
  });

  it("returns not found for drafts and unknown jobs", async () => {
    availabilityMock.mockResolvedValue(null);
    expect(await applyToJob("cand", "x")).toMatchObject({ ok: false, code: "JOB_NOT_FOUND", status: 404 });
  });
});
