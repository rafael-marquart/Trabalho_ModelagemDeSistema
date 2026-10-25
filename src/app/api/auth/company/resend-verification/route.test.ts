import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const { prismaMock, sendEmailMock, createTokenMock, rejectOriginMock, getPublicBaseUrlMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn() },
    $transaction: vi.fn()
  },
  sendEmailMock: vi.fn(),
  createTokenMock: vi.fn(),
  rejectOriginMock: vi.fn(),
  getPublicBaseUrlMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("@/lib/auth/tokens", () => ({ createOneTimeToken: createTokenMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: rejectOriginMock }));
vi.mock("@/lib/security/public-base-url", () => ({ getPublicBaseUrl: getPublicBaseUrlMock }));

import { POST } from "./route";

describe("resend company email verification", () => {
  const pendingCompanyUser = {
    id: "company-user-1",
    email: "company@example.com",
    company: { id: "company-1", emailConfirmedAt: null }
  };
  const tx = {
    $executeRaw: vi.fn(),
    recoveryBlock: { findFirst: vi.fn(), upsert: vi.fn() },
    recoveryAttempt: { count: vi.fn(), create: vi.fn() },
    company: { findFirst: vi.fn() },
    companyEmailVerificationToken: { deleteMany: vi.fn(), create: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue(pendingCompanyUser);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.$executeRaw.mockResolvedValue([]);
    tx.recoveryBlock.findFirst.mockResolvedValue(null);
    tx.recoveryBlock.upsert.mockResolvedValue({ scopeKey: "scope", blockedUntil: new Date(Date.now() + 60_000) });
    tx.recoveryAttempt.count.mockResolvedValue(0);
    tx.recoveryAttempt.create.mockResolvedValue({ id: "attempt-1" });
    tx.company.findFirst.mockResolvedValue({ id: "company-1" });
    tx.companyEmailVerificationToken.deleteMany.mockResolvedValue({ count: 1 });
    tx.companyEmailVerificationToken.create.mockResolvedValue({ id: "verification-2" });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
    createTokenMock.mockReturnValue({ token: "one-time-company-token", tokenHash: "hashed-company-token" });
    sendEmailMock.mockResolvedValue(undefined);
    rejectOriginMock.mockReturnValue(null);
    getPublicBaseUrlMock.mockReturnValue("https://acessavagas.example");
  });

  const makeRequest = (body: unknown = { email: " COMPANY@EXAMPLE.COM " }) =>
    new Request("https://acessavagas.example/api/auth/company/resend-verification", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify(body)
    });

  it("replaces the previous token, stores only its hash, sends the link, and returns a generic message", async () => {
    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(prismaMock.user.findFirst).toHaveBeenCalledWith({
      where: { email: "company@example.com", role: "COMPANY", isActive: false },
      select: { id: true, email: true, company: { select: { id: true, emailConfirmedAt: true } } }
    });
    expect(tx.$executeRaw).toHaveBeenCalledTimes(2);
    expect(tx.recoveryAttempt.create).toHaveBeenCalledWith({
      data: {
        identifierKey: createHash("sha256").update("company-verification:user:company-user-1").digest("hex"),
        ipKey: createHash("sha256").update("company-verification:ip:192.0.2.10").digest("hex")
      }
    });
    expect(tx.companyEmailVerificationToken.deleteMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", usedAt: null }
    });
    expect(tx.companyEmailVerificationToken.create).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        tokenHash: "hashed-company-token",
        expiresAt: expect.any(Date)
      }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorUserId: null,
        eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_RESEND_REQUESTED",
        subjectType: "User",
        subjectId: "company-user-1"
      }
    });
    expect(sendEmailMock).toHaveBeenCalledWith({
      to: "company@example.com",
      subject: "Novo link de confirmação — Acessa Vagas",
      text: expect.stringContaining("https://acessavagas.example/empresa/confirmar-email?token=one-time-company-token")
    });
    expect(await response.json()).toEqual({
      message: "Se houver uma conta empresarial pendente com esse e-mail, enviaremos um novo link de confirmação."
    });
  });

  it("uses the same public response for an unknown email and does not send mail", async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);

    const response = await POST(makeRequest({ email: "unknown@example.com" }) as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Se houver uma conta empresarial pendente com esse e-mail, enviaremos um novo link de confirmação."
    });
    expect(tx.recoveryAttempt.create).toHaveBeenCalled();
    expect(tx.companyEmailVerificationToken.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("does not reveal account state or send mail when a cooldown is active", async () => {
    tx.recoveryBlock.findFirst.mockResolvedValueOnce({
      scopeKey: "company-verification:ip:blocked",
      blockedUntil: new Date(Date.now() + 60_000)
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Se houver uma conta empresarial pendente com esse e-mail, enviaremos um novo link de confirmação."
    });
    expect(tx.recoveryAttempt.count).not.toHaveBeenCalled();
    expect(tx.recoveryAttempt.create).not.toHaveBeenCalled();
    expect(tx.companyEmailVerificationToken.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("applies the cooldown when the request quota is exhausted", async () => {
    tx.recoveryAttempt.count.mockResolvedValueOnce(3).mockResolvedValueOnce(0);

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Se houver uma conta empresarial pendente com esse e-mail, enviaremos um novo link de confirmação."
    });
    expect(tx.recoveryBlock.upsert).toHaveBeenCalledWith({
      where: { scopeKey: expect.stringMatching(/^company-verification:identifier:/) },
      create: { scopeKey: expect.stringMatching(/^company-verification:identifier:/), blockedUntil: expect.any(Date) },
      update: { blockedUntil: expect.any(Date) }
    });
    expect(tx.companyEmailVerificationToken.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("does not issue a token if the company becomes ineligible before the transaction", async () => {
    tx.company.findFirst.mockResolvedValueOnce(null);

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(tx.companyEmailVerificationToken.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("invalidates the newly issued token and audits a delivery failure", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(tx.companyEmailVerificationToken.deleteMany).toHaveBeenNthCalledWith(2, {
      where: { companyId: "company-1", tokenHash: "hashed-company-token", usedAt: null }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorUserId: "company-user-1",
        eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_DELIVERY_FAILED",
        subjectType: "User",
        subjectId: "company-user-1"
      }
    });
  });

  it("rejects cross-origin requests before querying the account", async () => {
    rejectOriginMock.mockReturnValueOnce(new Response("blocked", { status: 403 }));

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(403);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("keeps malformed input generic and does not query the account", async () => {
    const response = await POST(makeRequest({ email: "not-an-email" }) as never);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      message: "Se houver uma conta empresarial pendente com esse e-mail, enviaremos um novo link de confirmação."
    });
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
