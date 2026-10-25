import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, rejectOriginMock } = vi.hoisted(() => ({
  prismaMock: {
    company: { findMany: vi.fn() },
    $transaction: vi.fn()
  },
  getCurrentUserMock: vi.fn(),
  rejectOriginMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: rejectOriginMock }));

import { GET, POST } from "./route";

describe("admin company verification", () => {
  const admin = { id: "admin-1", role: "ADMIN", isActive: true };
  const company = {
    id: "company-1",
    officialId: "11222333000181",
    emailConfirmedAt: new Date(),
    officialIdValidatedAt: null,
    accountUserId: "company-user-1"
  };
  const tx = {
    company: { findUnique: vi.fn(), updateMany: vi.fn() },
    user: { updateMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(admin);
    rejectOriginMock.mockReturnValue(null);
    prismaMock.company.findMany.mockResolvedValue([]);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.company.findUnique.mockResolvedValue(company);
    tx.company.updateMany.mockResolvedValue({ count: 1 });
    tx.user.updateMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  it("requires an active administrator to list pending companies", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "company-user", role: "COMPANY", isActive: true });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(prismaMock.company.findMany).not.toHaveBeenCalled();
  });

  it("lists only email-confirmed companies awaiting official-ID verification", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(prismaMock.company.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { emailConfirmedAt: { not: null }, officialIdValidatedAt: null }
    }));
  });

  it("validates the CNPJ and activates the company only after email confirmation", async () => {
    const response = await POST(new Request("https://acessavagas.example/api/admin/companies/validate", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ companyId: "company-1", decision: "approve" })
    }));

    expect(response.status).toBe(200);
    expect(tx.company.updateMany).toHaveBeenCalledWith({
      where: { id: "company-1", emailConfirmedAt: { not: null }, officialIdValidatedAt: null },
      data: { officialIdValidatedAt: expect.any(Date), officialIdValidatedBy: "admin-1" }
    });
    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: "company-user-1", role: "COMPANY", isActive: false },
      data: { isActive: true }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "admin-1",
        eventType: "ADMIN_COMPANY_OFFICIAL_ID_VALIDATED",
        subjectId: "company-1"
      })
    });
  });

  it("does not validate a company before its email is confirmed", async () => {
    tx.company.findUnique.mockResolvedValueOnce({ ...company, emailConfirmedAt: null });

    const response = await POST(new Request("https://acessavagas.example/api/admin/companies/validate", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ companyId: "company-1", decision: "approve" })
    }));

    expect(response.status).toBe(409);
    expect(tx.company.updateMany).not.toHaveBeenCalled();
    expect(tx.user.updateMany).not.toHaveBeenCalled();
  });
});
