import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashPasswordMock, createTokenMock, sendEmailMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    auditEvent: { create: vi.fn() }
  },
  hashPasswordMock: vi.fn(),
  createTokenMock: vi.fn(),
  sendEmailMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/password", () => ({ hashPassword: hashPasswordMock }));
vi.mock("@/lib/auth/tokens", () => ({ createOneTimeToken: createTokenMock }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));

import { POST } from "./route";

describe("company registration", () => {
  const tx = {
    user: { create: vi.fn() },
    companyEmailVerificationToken: { create: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.APP_BASE_URL;
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.user.create.mockResolvedValue({ id: "company-user-1", company: { id: "company-1" } });
    tx.companyEmailVerificationToken.create.mockResolvedValue({ id: "verification-1" });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
    hashPasswordMock.mockResolvedValue("hashed-password");
    createTokenMock.mockReturnValue({ token: "company-verification-token", tokenHash: "hashed-verification-token" });
    sendEmailMock.mockResolvedValue(undefined);
  });

  const makeRequest = (overrides: Record<string, unknown> = {}) =>
    new Request("https://acessavagas.example/api/auth/register/company", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        legalName: "Empresa Exemplo Ltda",
        tradeName: "Exemplo",
        officialId: "12.345.678/0001-90",
        contactEmail: " CONTATO@EXEMPLO.COM ",
        password: "StrongPassword123",
        ...overrides
      })
    });

  it("creates an inactive company, stores only the verification token hash, and emails the link", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(201);
    expect(hashPasswordMock).toHaveBeenCalledWith("StrongPassword123");
    expect(tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "contato@exemplo.com",
        fullName: "Empresa Exemplo Ltda",
        passwordHash: "hashed-password",
        role: "COMPANY",
        isActive: false,
        company: {
          create: {
            legalName: "Empresa Exemplo Ltda",
            tradeName: "Exemplo",
            officialId: "12345678000190",
            contactEmail: "contato@exemplo.com"
          }
        }
      }),
      select: { id: true, company: { select: { id: true } } }
    });
    expect(tx.companyEmailVerificationToken.create).toHaveBeenCalledWith({
      data: {
        companyId: "company-1",
        tokenHash: "hashed-verification-token",
        expiresAt: expect.any(Date)
      }
    });
    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "contato@exemplo.com",
      text: expect.stringContaining("token=company-verification-token")
    }));
  });

  it("rejects an identifier that is too short after normalization", async () => {
    const response = await POST(makeRequest({ officialId: "12-34" }));

    expect(response.status).toBe(400);
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("maps unique constraint violations to a conflict", async () => {
    prismaMock.$transaction.mockRejectedValueOnce({ code: "P2002" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
  });

  it("does not send verification email if account creation transaction fails", async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("does not send verification email if account creation transaction fails", async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("audits delivery failure without activating the company", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));

    const response = await POST(makeRequest());

    expect(response.status).toBe(201);
    expect(prismaMock.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorUserId: "company-user-1",
        eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_DELIVERY_FAILED",
        subjectType: "User",
        subjectId: "company-user-1"
      }
    });
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toMatchObject({
      message: expect.stringContaining("A conta permanecerá indisponível")
    });
  });
});
