import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx } = vi.hoisted(() => {
  const tx = { application: { updateMany: vi.fn() }, applicationStageEvent: { create: vi.fn() }, auditEvent: { create: vi.fn() } };
  return { tx, prismaMock: {
    job: { findFirst: vi.fn() }, application: { findMany: vi.fn(), findFirst: vi.fn() }, candidateProfile: { findUnique: vi.fn() },
    accessibilityNeedOption: { findMany: vi.fn() }, user: { findMany: vi.fn() }, $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx))
  } };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { changeApplicationStage, getApplicationForCompany, listJobApplications } from "./company-service";

describe("company side of applications (SPEC-013)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    tx.application.updateMany.mockResolvedValue({ count: 1 });
  });

  it("lists applications only for a job of the actor's company, with counts per stage", async () => {
    prismaMock.job.findFirst.mockResolvedValueOnce(null);
    expect(await listJobApplications("company-1", "job-x")).toBeNull();
    expect(prismaMock.job.findFirst.mock.calls[0][0].where).toEqual({ id: "job-x", companyId: "company-1" });
    prismaMock.job.findFirst.mockResolvedValueOnce({ id: "job-1", title: "Analista", status: "OPEN" });
    prismaMock.application.findMany.mockResolvedValueOnce([
      { id: "a1", appliedAt: new Date(), stage: "INSCRITO", score: 80, candidate: { fullName: "Ana" } },
      { id: "a2", appliedAt: new Date(), stage: "TRIAGEM", score: null, candidate: { fullName: "Bia" } }
    ]);
    const list = await listJobApplications("company-1", "job-1");
    expect(list?.counts).toMatchObject({ INSCRITO: 1, TRIAGEM: 1, ENTREVISTA: 0 });
    expect(list?.applications.map(item => item.candidateName)).toEqual(["Ana", "Bia"]);
  });

  it("returns only the data the process needs, never free-text accessibility notes or documents", async () => {
    prismaMock.application.findFirst.mockResolvedValue({
      id: "a1", stage: "TRIAGEM", score: 80, appliedAt: new Date(), candidateUserId: "cand",
      job: { id: "job-1", title: "Analista" }, candidate: { id: "cand", fullName: "Ana", email: "ana@example.com" },
      compatibilityResult: { outcome: { dimensions: { A: { status: "EVALUATED", score: 100 }, T: { status: "EVALUATED", score: 60 }, D: { status: "INSUFFICIENT", score: null } } } },
      stageEvents: [{ createdAt: new Date(), fromStage: null, toStage: "INSCRITO", kind: "SUBMITTED", actorUserId: "cand", note: null }]
    });
    prismaMock.candidateProfile.findUnique.mockResolvedValue({ accessibilityDeclaration: "NEEDS_DECLARED", accessibilityNeedOptionCodes: ["A01"], accessibilityNeeds: ["descrição livre sensível"], essentialAccessibilityResources: ["mesa adaptada"], education: [], professionalExperience: [], languages: [], courses: [], certifications: [], professionalLinks: [] });
    prismaMock.accessibilityNeedOption.findMany.mockResolvedValue([{ name: "Rampa" }]);
    prismaMock.user.findMany.mockResolvedValue([{ id: "cand", fullName: "Ana", role: "CANDIDATE" }]);
    const detail = await getApplicationForCompany("company-1", "a1");
    expect(prismaMock.application.findFirst.mock.calls[0][0].where).toEqual({ id: "a1", job: { companyId: "company-1" } });
    expect(detail?.accessibility).toEqual({ declaration: "NEEDS_DECLARED", needs: ["Rampa"], essentialResources: ["mesa adaptada"] });
    expect(JSON.stringify(detail)).not.toContain("descrição livre sensível");
    expect(detail?.nextStages.map(item => item.stage)).toEqual(["ENTREVISTA", "RECUSADA"]);
    expect(detail?.history[0]).toMatchObject({ to: "Inscrito", kind: "Candidatura registrada", actor: "Ana (candidato)" });
  });

  it("moves along RB-39, writing stage, history and audit together", async () => {
    prismaMock.application.findFirst.mockResolvedValue({ id: "a1", stage: "INSCRITO", jobId: "job-1" });
    const result = await changeApplicationStage({ companyId: "company-1", actorUserId: "rec", applicationId: "a1", toStage: "TRIAGEM", note: " ok " });
    expect(result).toEqual({ ok: true, stage: "TRIAGEM" });
    expect(tx.application.updateMany).toHaveBeenCalledWith({ where: { id: "a1", stage: "INSCRITO" }, data: { stage: "TRIAGEM" } });
    expect(tx.applicationStageEvent.create).toHaveBeenCalledWith({ data: { applicationId: "a1", fromStage: "INSCRITO", toStage: "TRIAGEM", kind: "ADVANCED", actorUserId: "rec", note: "ok" } });
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "APPLICATION_STAGE_CHANGED", metadata: { fromStage: "INSCRITO", toStage: "TRIAGEM" } });
  });

  it("refuses moves outside RB-39, other companies' applications and concurrent changes without writing anything", async () => {
    prismaMock.application.findFirst.mockResolvedValueOnce({ id: "a1", stage: "INSCRITO", jobId: "job-1" });
    expect(await changeApplicationStage({ companyId: "c", actorUserId: "r", applicationId: "a1", toStage: "CONTRATADO" })).toMatchObject({ ok: false, status: 409 });
    prismaMock.application.findFirst.mockResolvedValueOnce(null);
    expect(await changeApplicationStage({ companyId: "other", actorUserId: "r", applicationId: "a1", toStage: "TRIAGEM" })).toMatchObject({ ok: false, status: 404 });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    prismaMock.application.findFirst.mockResolvedValueOnce({ id: "a1", stage: "INSCRITO", jobId: "job-1" });
    tx.application.updateMany.mockResolvedValueOnce({ count: 0 });
    expect(await changeApplicationStage({ companyId: "c", actorUserId: "r", applicationId: "a1", toStage: "TRIAGEM" })).toMatchObject({ ok: false, status: 409 });
    expect(tx.applicationStageEvent.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });
});
