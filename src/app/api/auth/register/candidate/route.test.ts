import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashPasswordMock } = vi.hoisted(() => ({
  prismaMock: { $transaction: vi.fn() },
  hashPasswordMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/password", () => ({ hashPassword: hashPasswordMock }));

import { POST } from "./route";

describe("candidate registration", () => {
  const tx = { user: { create: vi.fn() }, auditEvent: { create: vi.fn() } };

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

  it("does not report registration success when the audit write fails", async () => {
    prismaMock.$transaction.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
  });

  it("maps duplicate account constraints to a conflict response", async () => {
    prismaMock.$transaction.mockRejectedValueOnce({ code: "P2002" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
  });
});
