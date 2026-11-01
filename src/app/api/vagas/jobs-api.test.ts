import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, hasApplicationsMock } = vi.hoisted(() => ({
  prismaMock: {
    company: { findUnique: vi.fn() }, recruiterLink: { findFirst: vi.fn() },
    job: { findFirst: vi.fn(), findMany: vi.fn(), groupBy: vi.fn() }, $transaction: vi.fn()
  },
  getCurrentUserMock: vi.fn(),
  hasApplicationsMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/jobs/applications", () => ({ jobHasApplications: hasApplicationsMock, ACTIVE_STAGES: ["INSCRITO", "TRIAGEM", "ENTREVISTA", "FINALISTA"] }));
vi.mock("@/lib/notifications/service", () => ({ enqueueJobClosed: vi.fn(), kickNotificationDelivery: vi.fn() }));
import { GET, POST } from "./route";
import { GET as GET_ONE, PUT } from "./[id]/route";
import { POST as ACTION } from "./[id]/acao/route";
import { infrastructureItems } from "@/lib/company-infrastructure/items";

const accessibility = Object.fromEntries(infrastructureItems.map((item) => [item.code, "PRESENT"]));
const future = "2999-12-31";
const row = (over: Record<string, unknown> = {}) => ({
  id: "job-1", companyId: "company-1", createdByUserId: "user-1", status: "DRAFT", origin: "OWN", title: "Analista", description: "d", requirements: "r",
  modality: "REMOTO", locationCity: "", locationState: "", locationAddress: "", deadline: new Date(`${future}T00:00:00.000Z`),
  salaryMin: null, salaryMax: null, accessibility, publishedAt: null, closedAt: null, createdAt: new Date(), updatedAt: new Date(), ...over
});
const req = (method: string, body?: unknown) => new Request("https://example.test/api/vagas", {
  method, headers: { "content-type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body)
});
const ctx = { params: Promise.resolve({ id: "job-1" }) };

describe("jobs API", () => {
  const tx = { job: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() }, auditEvent: { create: vi.fn() }, application: { findMany: vi.fn().mockResolvedValue([]) }, company: { findUnique: vi.fn().mockResolvedValue({ tradeName: "Empresa", legalName: "Empresa Ltda" }) } };
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "user-1", role: "COMPANY", isActive: true });
    prismaMock.company.findUnique.mockResolvedValue({ id: "company-1" });
    prismaMock.job.findFirst.mockResolvedValue(row());
    prismaMock.$transaction.mockImplementation(async (cb: (t: typeof tx) => unknown) => cb(tx));
    tx.job.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => row(data));
    tx.job.update.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => row(data));
    let lastData: Record<string, unknown> = {};
    tx.job.updateMany.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => { lastData = data; return { count: 1 }; });
    tx.job.findUnique.mockImplementation(async () => row(lastData));
    hasApplicationsMock.mockResolvedValue(false);
  });

  it("denies anonymous callers and candidates", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);
    expect((await GET(req("GET"))).status).toBe(401);
    getCurrentUserMock.mockResolvedValueOnce({ id: "c", role: "CANDIDATE", isActive: true });
    expect((await POST(req("POST", {}))).status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("resolves the company of a recruiter from the active link, and refuses an unlinked recruiter", async () => {
    getCurrentUserMock.mockResolvedValue({ id: "rec-1", role: "RECRUITER", isActive: true });
    prismaMock.recruiterLink.findFirst.mockResolvedValueOnce({ companyId: "company-9" });
    prismaMock.job.findMany.mockResolvedValue([]); prismaMock.job.groupBy.mockResolvedValue([]);
    expect((await GET(req("GET"))).status).toBe(200);
    expect(prismaMock.job.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: "company-9" } }));
    prismaMock.recruiterLink.findFirst.mockResolvedValueOnce(null);
    expect((await GET(req("GET"))).status).toBe(403);
  });

  it("creates incomplete drafts, using the company of the session and auditing without content", async () => {
    const response = await POST(req("POST", { title: "Segredo" }));
    expect(response.status).toBe(201);
    expect(tx.job.create).toHaveBeenCalledWith({ data: expect.objectContaining({ companyId: "company-1", status: "DRAFT", origin: "OWN" }) });
    const audit = tx.auditEvent.create.mock.calls[0][0].data;
    expect(audit.eventType).toBe("JOB_CREATED");
    expect(JSON.stringify(audit)).not.toContain("Segredo");
    expect((await POST(req("POST", { companyId: "company-2" }))).status).toBe(400);
  });

  it("lists counts per status", async () => {
    prismaMock.job.findMany.mockResolvedValue([row()]);
    prismaMock.job.groupBy.mockResolvedValue([{ status: "OPEN", _count: { _all: 2 } }]);
    const body = await (await GET(new Request("https://example.test/api/vagas?status=DRAFT"))).json();
    expect(body.counts).toEqual({ DRAFT: 0, OPEN: 2, PAUSED: 0, CLOSED: 0 });
    expect(prismaMock.job.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: "company-1", status: "DRAFT" } }));
  });

  it("treats a job of another company as not found", async () => {
    prismaMock.job.findFirst.mockResolvedValue(null);
    expect((await GET_ONE(req("GET"), ctx)).status).toBe(404);
    expect((await PUT(req("PUT", {}), ctx)).status).toBe(404);
    expect((await ACTION(req("POST", { action: "close" }), ctx)).status).toBe(404);
    expect(prismaMock.job.findFirst).toHaveBeenCalledWith({ where: { id: "job-1", companyId: "company-1" } });
  });

  it("refuses to edit a closed job", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "CLOSED" }));
    expect((await PUT(req("PUT", {}), ctx)).status).toBe(409);
  });

  it("audits only the names of changed fields on update", async () => {
    const response = await PUT(req("PUT", { title: "Novo título secreto", description: "d", requirements: "r", modality: "REMOTO", deadline: future, accessibility }), ctx);
    expect(response.status).toBe(200);
    const audit = tx.auditEvent.create.mock.calls[0][0].data;
    expect(audit.metadata.changedFields).toEqual(["title"]);
    expect(JSON.stringify(audit)).not.toContain("secreto");
  });

  it("keeps published jobs publishable and locks conditions once applications exist", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "OPEN" }));
    const body = { title: "", description: "d", requirements: "r", modality: "REMOTO", deadline: future, accessibility };
    const invalid = await PUT(req("PUT", body), ctx);
    expect(invalid.status).toBe(400);
    expect((await invalid.json()).issues).toHaveProperty("title");
    hasApplicationsMock.mockResolvedValue(true);
    const locked = await PUT(req("PUT", { ...body, title: "Outro" }), ctx);
    expect(locked.status).toBe(409);
    expect((await locked.json()).locked).toEqual(["title"]);
  });

  it("publishes a complete draft and blocks an incomplete one", async () => {
    expect((await ACTION(req("POST", { action: "publish" }), ctx)).status).toBe(200);
    expect(tx.job.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "OPEN", publishedAt: expect.any(Date) }) }));
    expect(tx.auditEvent.create.mock.calls[0][0].data.eventType).toBe("JOB_PUBLISHED");
    prismaMock.job.findFirst.mockResolvedValue(row({ accessibility: {} }));
    const blocked = await ACTION(req("POST", { action: "publish" }), ctx);
    expect(blocked.status).toBe(400);
    expect(Object.keys((await blocked.json()).issues)).toContain("accessibility.RAMPS");
  });

  it("enforces the state machine", async () => {
    expect((await ACTION(req("POST", { action: "pause" }), ctx)).status).toBe(409);
    expect((await ACTION(req("POST", { action: "close" }), ctx)).status).toBe(409);
    expect((await ACTION(req("POST", { action: "explode" }), ctx)).status).toBe(400);
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "OPEN" }));
    expect((await ACTION(req("POST", { action: "pause" }), ctx)).status).toBe(200);
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "PAUSED" }));
    expect((await ACTION(req("POST", { action: "reopen" }), ctx)).status).toBe(200);
    expect((await ACTION(req("POST", { action: "close" }), ctx)).status).toBe(200);
    expect(tx.job.updateMany).toHaveBeenLastCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "CLOSED", closedAt: expect.any(Date) }) }));
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "CLOSED" }));
    expect((await ACTION(req("POST", { action: "reopen" }), ctx)).status).toBe(409);
  });

  // SPEC-009 (OPEN-041)
  it("refuses status changes by candidates and platform administrators", async () => {
    for (const role of ["CANDIDATE", "ADMIN"]) {
      getCurrentUserMock.mockResolvedValueOnce({ id: "x", role, isActive: true });
      expect((await ACTION(req("POST", { action: "close" }), ctx)).status).toBe(401);
    }
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
  it("refuses a change when the status moved in the meantime, without auditing it", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "OPEN" }));
    tx.job.updateMany.mockResolvedValueOnce({ count: 0 });
    const response = await ACTION(req("POST", { action: "pause" }), ctx);
    expect(response.status).toBe(409);
    expect(tx.job.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "job-1", status: "OPEN" } }));
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });
  it("records the previous and resulting status, the actor and the candidates to notify on closing", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "OPEN" }));
    const response = await ACTION(req("POST", { action: "close" }), ctx);
    expect(response.status).toBe(200);
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ actorUserId: "user-1", eventType: "JOB_CLOSED", metadata: { fromStatus: "OPEN", toStatus: "CLOSED", activeCandidatesToNotify: 0 } });
  });
});
