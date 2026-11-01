import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock } = vi.hoisted(() => ({
  prismaMock: { company: { findUnique: vi.fn() }, companyInfrastructure: { findUnique: vi.fn() }, $transaction: vi.fn() },
  getCurrentUserMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
import { GET, PUT } from "./route";
import { infrastructureItems } from "@/lib/company-infrastructure/items";

const complete = () => Object.fromEntries(infrastructureItems.map((item) => [item.code, { status: "PRESENT", note: "" }]));
const put = (body: unknown, headers: Record<string, string> = {}) => PUT(new Request("https://example.test/api/company/infraestrutura", {
  method: "PUT", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body)
}));

describe("company infrastructure API", () => {
  const company = { id: "company-1", role: "COMPANY", isActive: true };
  const tx = { companyInfrastructure: { findUnique: vi.fn(), upsert: vi.fn() }, auditEvent: { create: vi.fn() } };
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "user-1", role: "COMPANY", isActive: true });
    prismaMock.company.findUnique.mockResolvedValue({ id: company.id });
    prismaMock.companyInfrastructure.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.companyInfrastructure.findUnique.mockResolvedValue(null);
    tx.companyInfrastructure.upsert.mockImplementation(async ({ create }: { create: { answers: unknown } }) => ({ answers: create.answers, updatedAt: new Date("2026-10-27T00:00:00.000Z") }));
    tx.auditEvent.create.mockResolvedValue({});
  });

  it("denies anonymous callers, candidates and recruiters without touching the database", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
    getCurrentUserMock.mockResolvedValueOnce({ id: "u", role: "CANDIDATE", isActive: true });
    expect((await put({ answers: complete() })).status).toBe(401);
    getCurrentUserMock.mockResolvedValueOnce({ id: "u", role: "RECRUITER", isActive: true });
    expect((await GET()).status).toBe(401);
    expect(prismaMock.company.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("refuses inactive accounts and accounts without a company", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "user-1", role: "COMPANY", isActive: false });
    expect((await GET()).status).toBe(403);
    prismaMock.company.findUnique.mockResolvedValueOnce(null);
    expect((await put({ answers: complete() })).status).toBe(403);
  });

  it("returns every item as NOT_INFORMED when nothing was registered", async () => {
    const body = await (await GET()).json();
    expect(body.updatedAt).toBeNull();
    expect(Object.values(body.answers as Record<string, { status: string }>).every((answer) => answer.status === "NOT_INFORMED")).toBe(true);
    expect(body.catalog.items).toHaveLength(infrastructureItems.length);
  });

  it("scopes reads and writes to the company of the session, ignoring any company in the body", async () => {
    expect((await put({ answers: complete(), companyId: "company-2" })).status).toBe(400);
    expect((await put({ answers: complete() })).status).toBe(200);
    expect(prismaMock.company.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { accountUserId: "user-1" } }));
    expect(tx.companyInfrastructure.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { companyId: "company-1" } }));
  });

  it("blocks saving with pending required items and reports them by item", async () => {
    const answers = complete() as Record<string, unknown>;
    delete answers.SIGNAGE;
    const response = await put({ answers });
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(Object.keys(body.issues)).toEqual(["SIGNAGE"]);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects cross-origin writes", async () => {
    expect((await put({ answers: complete() }, { origin: "https://evil.example" })).status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("audits creation by item and type, never by value or note", async () => {
    const answers = { ...complete(), RAMPS: { status: "PRESENT", note: "observação privada" } };
    expect((await put({ answers })).status).toBe(200);
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ eventType: "COMPANY_INFRASTRUCTURE_CREATED", subjectId: "company-1" })
    }));
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain("observação privada");
  });

  it("audits updates and skips the audit event when nothing changed", async () => {
    const stored = complete();
    tx.companyInfrastructure.findUnique.mockResolvedValue({ answers: stored });
    tx.companyInfrastructure.upsert.mockImplementation(async ({ update }: { update: { answers: unknown } }) => ({ answers: update.answers, updatedAt: new Date() }));
    expect((await put({ answers: stored })).status).toBe(200);
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
    expect((await put({ answers: { ...stored, ELEVATORS: { status: "ABSENT", note: "" } } })).status).toBe(200);
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        eventType: "COMPANY_INFRASTRUCTURE_UPDATED", metadata: { changes: [{ item: "ELEVATORS", type: "CHANGED" }], changeCount: 1 }
      })
    }));
  });
});
