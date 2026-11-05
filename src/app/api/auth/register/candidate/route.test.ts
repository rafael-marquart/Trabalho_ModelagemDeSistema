import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashPasswordMock } = vi.hoisted(() => ({
  prismaMock: { $transaction: vi.fn() },
  hashPasswordMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/password", () => ({ hashPassword: hashPasswordMock }));

import { POST } from "./route";

describe("candidate registration", () => {
  const tx = { user: { create: vi.fn() }, auditEvent: { create: vi.fn() }, consentRecord: { create: vi.fn() } };

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.user.create.mockResolvedValue({ id: "candidate-1" });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
    hashPasswordMock.mockResolvedValue("hashed-password");
  });

  const makeRequest = (overrides: Record<string, unknown> = {}) =>
    new Request("https://acessavagas.example/api/auth/register/candidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        fullName: "Pessoa Candidata",
        email: " Pessoa@Exemplo.com ",
        cpf: "529.982.247-25",
        password: "StrongPassword123",
        acceptTerms: true,
        ...overrides
      })
    });

  it("normalizes identity fields, hashes the password, and audits account creation", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(201);
    expect(hashPasswordMock).toHaveBeenCalledWith("StrongPassword123");
    expect(tx.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: "Pessoa Candidata",
        email: "pessoa@exemplo.com",
        cpf: "52998224725",
        passwordHash: "hashed-password",
        role: "CANDIDATE"
      }),
      select: { id: true }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "candidate-1",
        eventType: "AUTH_CANDIDATE_REGISTERED",
        subjectId: "candidate-1"
      })
    });
  });

  it("rejects malformed JSON before hashing or writing to the database", async () => {
    const request = new Request("https://acessavagas.example/api/auth/register/candidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin request before hashing or writing to the database", async () => {
    const request = new Request("https://acessavagas.example/api/auth/register/candidate", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "https://attacker.example"
      },
      body: JSON.stringify({
        fullName: "Pessoa Candidata",
        email: "pessoa@example.com",
        cpf: "529.982.247-25",
        password: "StrongPassword123"
      })
    });

    const response = await POST(request);

    expect(response.status).toBe(403);
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tx.user.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects an invalid CPF before hashing or writing to the database", async () => {
    const response = await POST(makeRequest({ cpf: "111.111.111-11" }));

    expect(response.status).toBe(400);
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("does not report registration success when the audit write fails", async () => {
    tx.auditEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
    expect(tx.user.create).toHaveBeenCalled();
  });

  it("propagates a transaction failure without reporting registration success", async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
  });

  it("maps duplicate account constraints to a conflict response", async () => {
    prismaMock.$transaction.mockRejectedValueOnce({ code: "P2002" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
  });

  it("refuses an account without the explicit acceptance of the Terms and Privacy Policy, creating nothing", async () => {
    for (const acceptTerms of [false, undefined, "true"]) {
      const response = await POST(makeRequest({ acceptTerms }));
      expect(response.status).toBe(400);
      expect((await response.json()).message).toBe("Para criar a conta, leia e aceite os Termos de Uso e a Política de Privacidade.");
    }
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it("records the acceptance with the text version in the same transaction as the account", async () => {
    await POST(makeRequest());
    expect(tx.consentRecord.create).toHaveBeenCalledWith({ data: { userId: "candidate-1", kind: "TERMS_AND_PRIVACY", version: "2026-11-05", granted: true } });
  });
});
