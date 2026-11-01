import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx } = vi.hoisted(() => {
  const tx = { job: { findFirst: vi.fn() }, application: { updateMany: vi.fn() }, applicationStageEvent: { create: vi.fn() }, auditEvent: { create: vi.fn() } };
  return { tx, prismaMock: {
    application: { findMany: vi.fn(), findFirst: vi.fn() },
    $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx))
  } };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { cancelApplication, cancellationBlock, getCandidateApplication, listCandidateApplications, toTimeline } from "./candidate-service";

const day = (iso: string) => new Date(`${iso}T12:00:00Z`);
const company = { tradeName: "Empresa Exemplo", legalName: "Empresa Exemplo LTDA" };
const job = (status = "OPEN", closedAt: Date | null = null) => ({ id: "job-1", title: "Analista", status, closedAt, company });

describe("candidate side of applications (SPEC-012/016)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.job.findFirst.mockResolvedValue({ status: "OPEN" });
    tx.application.updateMany.mockResolvedValue({ count: 1 });
  });

  it("lists only the session candidate's applications and hides history 60 days after cancellation or closure", async () => {
    const now = day("2026-11-01");
    prismaMock.application.findMany.mockResolvedValue([
      { id: "a1", stage: "TRIAGEM", appliedAt: day("2026-10-01"), updatedAt: day("2026-10-02"), job: job(), stageEvents: [] },
      { id: "a2", stage: "CANCELADA", appliedAt: day("2026-08-01"), updatedAt: day("2026-08-02"), job: job(), stageEvents: [{ kind: "CANCELLED", createdAt: day("2026-08-02") }] },
      { id: "a3", stage: "CANCELADA", appliedAt: day("2026-10-01"), updatedAt: day("2026-10-10"), job: job(), stageEvents: [{ kind: "CANCELLED", createdAt: day("2026-10-10") }] },
      { id: "a4", stage: "ENTREVISTA", appliedAt: day("2026-07-01"), updatedAt: day("2026-07-02"), job: job("CLOSED", day("2026-08-15")), stageEvents: [] },
      { id: "a5", stage: "RECUSADA", appliedAt: day("2026-01-01"), updatedAt: day("2026-02-01"), job: job(), stageEvents: [] }
    ]);
    const list = await listCandidateApplications("cand-1", now);
    expect(prismaMock.application.findMany.mock.calls[0][0].where).toEqual({ candidateUserId: "cand-1" });
    expect(list.map((item) => item.id)).toEqual(["a1", "a3", "a5"]);
    expect(list[1]).toMatchObject({ stageLabel: "Cancelada", job: { title: "Analista", companyName: "Empresa Exemplo" } });
  });

  it("builds a timeline without actors or internal notes, most recent first", () => {
    const timeline = toTimeline([
      { createdAt: day("2026-10-01"), toStage: "INSCRITO", kind: "SUBMITTED" },
      { createdAt: day("2026-10-05"), toStage: "TRIAGEM", kind: "ADVANCED" },
      { createdAt: day("2026-10-09"), toStage: "CANCELADA", kind: "CANCELLED" }
    ]);
    expect(timeline.map((event) => event.title)).toEqual(["Candidatura cancelada", "Status: Em triagem", "Candidatura realizada"]);
    expect(timeline.map((event) => event.resultingStage)).toEqual(["Cancelada", "Em triagem", "Inscrita"]);
    expect(Object.keys(timeline[0]).sort()).toEqual(["date", "description", "resultingStage", "title", "type"]);
  });

  it("returns the detail only to its owner and offers cancellation only when allowed", async () => {
    prismaMock.application.findFirst.mockResolvedValueOnce(null);
    expect(await getCandidateApplication("intruder", "a1")).toBeNull();
    expect(prismaMock.application.findFirst.mock.calls[0][0].where).toEqual({ id: "a1", candidateUserId: "intruder" });

    prismaMock.application.findFirst.mockResolvedValueOnce({
      id: "a1", stage: "ENTREVISTA", appliedAt: day("2026-10-01"), updatedAt: day("2026-10-05"), job: job("CLOSED", day("2026-10-20")),
      stageEvents: [{ createdAt: day("2026-10-01"), toStage: "INSCRITO", kind: "SUBMITTED" }]
    });
    const detail = await getCandidateApplication("cand-1", "a1", day("2026-11-01"));
    expect(detail).toMatchObject({ stageLabel: "Em entrevista", canCancel: true, job: { status: "CLOSED" } });
    expect(detail?.historyVisibleUntil?.slice(0, 10)).toBe("2026-12-19");
    expect(JSON.stringify(detail)).not.toMatch(/actor|note|email/i);
  });

  it("states why an application cannot be cancelled", () => {
    expect(cancellationBlock("FINALISTA", "PAUSED")).toBeNull();
    expect(cancellationBlock("CONTRATADO", "OPEN")).toMatch(/aprovada não pode/);
    expect(cancellationBlock("RECUSADA", "OPEN")).toMatch(/recusada não pode/);
    expect(cancellationBlock("CANCELADA", "OPEN")).toMatch(/já foi cancelada/);
    expect(cancellationBlock("INSCRITO", "CLOSED")).toBeNull();
    expect(cancellationBlock("ENTREVISTA", "CLOSED")).toBeNull();
    expect(cancellationBlock("FINALISTA", "OPEN")).toBeNull();
    expect(cancellationBlock("FINALISTA", "CLOSED")).toMatch(/até a etapa de entrevista/);
  });

  it("cancels with a conditional update, a history event and an audit entry", async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: "a1", stage: "TRIAGEM", jobId: "job-1", job: { status: "OPEN" } });
    expect(await cancelApplication("cand-1", "a1")).toEqual({ ok: true, stage: "CANCELADA" });
    expect(tx.application.updateMany).toHaveBeenCalledWith({ where: { id: "a1", candidateUserId: "cand-1", stage: "TRIAGEM" }, data: { stage: "CANCELADA" } });
    expect(tx.applicationStageEvent.create).toHaveBeenCalledWith({ data: { applicationId: "a1", fromStage: "TRIAGEM", toStage: "CANCELADA", kind: "CANCELLED", actorUserId: "cand-1" } });
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "APPLICATION_CANCELLED", actorUserId: "cand-1", subjectId: "a1" });
  });

  it("still cancels up to the interview stage after the job is closed (decision of 01/11/2026)", async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: "a1", stage: "ENTREVISTA", jobId: "job-1", job: { status: "CLOSED" } });
    tx.job.findFirst.mockResolvedValueOnce({ status: "CLOSED" });
    expect(await cancelApplication("cand-1", "a1")).toEqual({ ok: true, stage: "CANCELADA" });
    expect(tx.applicationStageEvent.create).toHaveBeenCalledTimes(1);
  });

  it("refuses someone else's application, final stages, closed jobs and concurrent changes without writing", async () => {
    prismaMock.application.findFirst.mockResolvedValueOnce(null);
    expect(await cancelApplication("intruder", "a1")).toMatchObject({ ok: false, status: 404 });
    prismaMock.application.findFirst.mockResolvedValueOnce({ id: "a1", stage: "CONTRATADO", jobId: "job-1", job: { status: "OPEN" } });
    expect(await cancelApplication("cand-1", "a1")).toMatchObject({ ok: false, status: 409 });
    prismaMock.application.findFirst.mockResolvedValueOnce({ id: "a1", stage: "FINALISTA", jobId: "job-1", job: { status: "CLOSED" } });
    expect(await cancelApplication("cand-1", "a1")).toMatchObject({ ok: false, status: 409 });
    expect(tx.application.updateMany).not.toHaveBeenCalled();

    prismaMock.application.findFirst.mockResolvedValueOnce({ id: "a1", stage: "FINALISTA", jobId: "job-1", job: { status: "OPEN" } });
    tx.job.findFirst.mockResolvedValueOnce({ status: "CLOSED" });
    expect(await cancelApplication("cand-1", "a1")).toMatchObject({ ok: false, status: 409 });
    prismaMock.application.findFirst.mockResolvedValueOnce({ id: "a1", stage: "INSCRITO", jobId: "job-1", job: { status: "OPEN" } });
    tx.application.updateMany.mockResolvedValueOnce({ count: 0 });
    expect(await cancelApplication("cand-1", "a1")).toMatchObject({ ok: false, status: 409 });
    expect(tx.applicationStageEvent.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });
});
