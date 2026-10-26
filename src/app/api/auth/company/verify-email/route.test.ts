import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashOneTimeToken } from "@/lib/auth/tokens";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    companyEmailVerificationToken: { findUnique: vi.fn() },
    $transaction: vi.fn()
  }
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { POST } from "./route";

describe("company email verification", () => {
  const tokenRecord = {
    id: "verification-1",
    companyId: "company-1",
    tokenHash: "hashed-token",
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    company: { id: "company-1", emailConfirmedAt: null, accountUserId: "company-user-1" }
  };
  const tx = {
    companyEmailVerificationToken: { updateMany: vi.fn(), deleteMany: vi.fn() },
    company: { updateMany: vi.fn() },
    user: { updateMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };
  let transactionRolledBack: boolean;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionRolledBack = false;
    prismaMock.companyEmailVerificationToken.findUnique.mockResolvedValue(tokenRecord);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => {
      try {
        return await callback(tx);
      } catch (error) {
        transactionRolledBack = true;
        throw error;
      }
    });
    tx.companyEmailVerificationToken.updateMany.mockResolvedValue({ count: 1 });
    tx.companyEmailVerificationToken.deleteMany.mockResolvedValue({ count: 1 });
    tx.company.updateMany.mockResolvedValue({ count: 1 });
    tx.user.updateMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeRequest = (token = "verification-token-long-enough") =>
    new Request("https://acessavagas.example/api/auth/company/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token })
    });

  it("claims a valid token once, activates the company, and audits email confirmation", async () => {
    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(prismaMock.companyEmailVerificationToken.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashOneTimeToken("verification-token-long-enough") },
      include: { company: { select: { id: true, emailConfirmedAt: true, accountUserId: true } } }
    });
    expect(tx.companyEmailVerificationToken.updateMany).toHaveBeenCalledWith({
      where: { id: "verification-1", usedAt: null, expiresAt: expect.objectContaining({ gt: expect.any(Date) }) },
      data: { usedAt: expect.any(Date) }
    });
    expect(tx.company.updateMany).toHaveBeenCalledWith({
      where: { id: "company-1", emailConfirmedAt: null },
      data: { emailConfirmedAt: expect.any(Date) }
    });
    expect(tx.user.updateMany).toHaveBeenCalledWith({
      where: { id: "company-user-1", role: "COMPANY", isActive: false },
      data: { isActive: true }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "company-user-1",
        eventType: "AUTH_COMPANY_EMAIL_CONFIRMED",
        subjectId: "company-1"
      })
    });
  });

  it("rolls back the token claim when another request already confirmed the company", async () => {
    tx.companyEmailVerificationToken.updateMany.mockResolvedValueOnce({ count: 1 });
    tx.company.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(transactionRolledBack).toBe(true);
    expect(tx.companyEmailVerificationToken.deleteMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rolls back token consumption when the company account cannot be activated", async () => {
    tx.user.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(transactionRolledBack).toBe(true);
    expect(tx.companyEmailVerificationToken.deleteMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rolls back confirmation and token consumption when audit persistence fails", async () => {
    tx.auditEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest() as never)).rejects.toThrow("audit database unavailable");
    expect(transactionRolledBack).toBe(true);
    expect(tx.company.updateMany).toHaveBeenCalled();
    expect(tx.companyEmailVerificationToken.deleteMany).toHaveBeenCalled();
  });

  it("rejects an already-confirmed company without consuming a token", async () => {
    prismaMock.companyEmailVerificationToken.findUnique.mockResolvedValueOnce({
      ...tokenRecord,
      company: { ...tokenRecord.company, emailConfirmedAt: new Date() }
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects expired tokens before starting a transaction", async () => {
    prismaMock.companyEmailVerificationToken.findUnique.mockResolvedValueOnce({
      ...tokenRecord,
      expiresAt: new Date(Date.now() - 1000)
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a token that another request already claimed", async () => {
    tx.companyEmailVerificationToken.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(tx.company.updateMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON before looking up or consuming a verification token", async () => {
    const request = new Request("https://acessavagas.example/api/auth/company/verify-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    });

    const response = await POST(request as never);

    expect(response.status).toBe(400);
    expect(prismaMock.companyEmailVerificationToken.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

});
