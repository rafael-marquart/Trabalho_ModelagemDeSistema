import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx, notify } = vi.hoisted(() => {
  const tx = { interview: { create: vi.fn(), updateMany: vi.fn() }, auditEvent: { create: vi.fn() } };
  return {
    tx,
    notify: { enqueueInterviewNotice: vi.fn(), kickNotificationDelivery: vi.fn() },
    prismaMock: { application: { findFirst: vi.fn() }, interview: { findFirst: vi.fn(), findMany: vi.fn() }, $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)) }
  };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/notifications/service", () => notify);
import { finishInterview, fromLocalInput, interviewInputSchema, scheduleInterview, updateInterview } from "./service";

const now = new Date("2026-11-01T12:00:00Z");
const app = (stage = "ENTREVISTA") => ({ id: "a1", stage, jobId: "j1", candidateUserId: "cand", job: { title: "Analista", company: { tradeName: "Loja", legalName: "Loja Ltda" } } });
const input = interviewInputSchema.parse({ scheduledAt: "2026-11-10T14:30", modality: "ONLINE", locationOrLink: "https://meet.example/abc", accessibilityResources: "Intérprete de Libras" });
const scheduled = (over = {}) => ({ id: "i1", applicationId: "a1", scheduledAt: new Date("2026-11-10T17:30:00Z"), modality: "ONLINE", locationOrLink: "https://meet.example/abc", accessibilityResources: "", status: "SCHEDULED", ...over });

describe("interviews (SPEC-018)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.application.findFirst.mockResolvedValue(app());
    tx.interview.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: "i1", ...data }));
    tx.interview.updateMany.mockResolvedValue({ count: 1 });
  });

  it("reads the typed date as Brasília time and validates the form", () => {
    expect(fromLocalInput("2026-11-10T14:30")?.toISOString()).toBe("2026-11-10T17:30:00.000Z");
    expect(fromLocalInput("10/11/2026 14:30")).toBeNull();
    expect(interviewInputSchema.safeParse({ scheduledAt: "2026-11-10T14:30", modality: "ONLINE", locationOrLink: "sala virtual" }).success).toBe(false);
    expect(interviewInputSchema.safeParse({ scheduledAt: "2026-11-10T14:30", modality: "PRESENCIAL", locationOrLink: "Av. Paulista, 1000" }).success).toBe(true);
  });

  it("schedules only for the company's own application in the Entrevista stage, auditing and telling the candidate", async () => {
    expect(await scheduleInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", input, now })).toEqual({ ok: true, interviewId: "i1" });
    expect(prismaMock.application.findFirst.mock.calls[0][0].where).toEqual({ id: "a1", job: { companyId: "c1" } });
    expect(tx.interview.create.mock.calls[0][0].data).toMatchObject({ applicationId: "a1", scheduledAt: new Date("2026-11-10T17:30:00Z"), modality: "ONLINE", createdByUserId: "rec" });
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "INTERVIEW_SCHEDULED", subjectId: "i1" });
    expect(notify.enqueueInterviewNotice).toHaveBeenCalledWith(tx, "INTERVIEW_SCHEDULED", expect.objectContaining({ candidateUserId: "cand", scheduledAt: "2026-11-10T17:30:00.000Z", accessibilityResources: "Intérprete de Libras" }));
    expect(notify.kickNotificationDelivery).toHaveBeenCalled();
  });

  it("refuses other companies, other stages, past dates and a second scheduled interview without writing", async () => {
    prismaMock.application.findFirst.mockResolvedValueOnce(null);
    expect(await scheduleInterview({ companyId: "other", actorUserId: "rec", applicationId: "a1", input, now })).toMatchObject({ ok: false, status: 404 });
    prismaMock.application.findFirst.mockResolvedValueOnce(app("TRIAGEM"));
    expect(await scheduleInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", input, now })).toMatchObject({ ok: false, status: 409 });
    expect(await scheduleInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", input, now: new Date("2026-12-01T00:00:00Z") })).toMatchObject({ ok: false, status: 400 });
    expect(tx.interview.create).not.toHaveBeenCalled();
    tx.interview.create.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "P2002" }));
    expect(await scheduleInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", input, now })).toMatchObject({ ok: false, status: 409 });
    expect(notify.enqueueInterviewNotice).not.toHaveBeenCalled();
  });

  it("changes a scheduled interview and tells the candidate; a finished one cannot change", async () => {
    prismaMock.interview.findFirst.mockResolvedValueOnce(scheduled());
    expect(await updateInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", interviewId: "i1", input, now })).toEqual({ ok: true, interviewId: "i1" });
    expect(tx.interview.updateMany.mock.calls[0][0].where).toEqual({ id: "i1", status: "SCHEDULED" });
    expect(notify.enqueueInterviewNotice).toHaveBeenCalledWith(tx, "INTERVIEW_UPDATED", expect.anything());
    prismaMock.interview.findFirst.mockResolvedValueOnce(scheduled({ status: "COMPLETED" }));
    expect(await updateInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", interviewId: "i1", input, now })).toMatchObject({ ok: false, status: 409 });
  });

  it("cancels with a notice and completes only after the interview time", async () => {
    prismaMock.interview.findFirst.mockResolvedValue(scheduled());
    expect(await finishInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", interviewId: "i1", action: "complete", now })).toMatchObject({ ok: false, status: 409 });
    const later = new Date("2026-11-10T19:00:00Z");
    expect(await finishInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", interviewId: "i1", action: "complete", now: later })).toEqual({ ok: true, interviewId: "i1" });
    expect(tx.interview.updateMany.mock.calls[0][0].data).toEqual({ status: "COMPLETED", completedAt: later });
    expect(notify.enqueueInterviewNotice).not.toHaveBeenCalled();
    expect(await finishInterview({ companyId: "c1", actorUserId: "rec", applicationId: "a1", interviewId: "i1", action: "cancel", now })).toEqual({ ok: true, interviewId: "i1" });
    expect(notify.enqueueInterviewNotice).toHaveBeenCalledWith(tx, "INTERVIEW_CANCELLED", expect.anything());
    expect(tx.auditEvent.create.mock.calls.map((call) => call[0].data.eventType)).toEqual(["INTERVIEW_COMPLETED", "INTERVIEW_CANCELLED"]);
  });
});
