import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, verifyPasswordMock, createSessionMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn() },
    $transaction: vi.fn(),
    auditEvent: { create: vi.fn() }
  },
  verifyPasswordMock: vi.fn(),
  createSessionMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/password", () => ({ verifyPassword: verifyPasswordMock }));
vi.mock("@/lib/auth/session", () => ({ createSession: createSessionMock }));

import { POST } from "./route";

describe("login", () => {
  const user = {
    id: "candidate-1",
    email: "person@example.com",
    cpf: "52998224725",
    role: "CANDIDATE",
    isActive: true,
    passwordHash: "stored-hash",
    failedLoginCount: 0,
    lockedUntil: null,
    passwordChangedAt: new Date("2026-01-01T00:00:00.000Z")
  };
  const tx = {
    $queryRaw: vi.fn(),
    user: { findUnique: vi.fn(), update: vi.fn() },
    loginAttempt: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue(user);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.$queryRaw.mockResolvedValue([]);
    tx.user.findUnique.mockResolvedValue(user);
    tx.user.update.mockResolvedValue(user);
    tx.loginAttempt.create.mockResolvedValue({ id: "attempt-1" });
    verifyPasswordMock.mockResolvedValue(true);
    createSessionMock.mockResolvedValue(true);
    prismaMock.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeRequest = (overrides: Record<string, unknown> = {}) =>
    new Request("https://acessavagas.example/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({
        profile: "candidate",
        identifier: "PERSON@example.com",
        password: "StrongPassword123",
        rememberMe: false,
        ...overrides
      })
    });

  it("serializes the credential check, resets failures, creates a session, and audits success", async () => {
    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.user.findUnique).toHaveBeenCalledWith({ where: { id: "candidate-1" } });
    expect(verifyPasswordMock).toHaveBeenCalledWith("stored-hash", "StrongPassword123");
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "candidate-1" },
      data: { failedLoginCount: 0, lockedUntil: null }
    });
    expect(createSessionMock).toHaveBeenCalledWith("candidate-1", false, user.passwordChangedAt);
    // Successful-login audit is written atomically inside createSession.
    expect(prismaMock.auditEvent.create).not.toHaveBeenCalled();
  });

  it("increments consecutive failures and never creates a session for a wrong password", async () => {
    verifyPasswordMock.mockResolvedValueOnce(false);
    tx.user.findUnique.mockResolvedValueOnce({ ...user, failedLoginCount: 4 });

    const response = await POST(makeRequest({ password: "WrongPassword123" }) as never);

    expect(response.status).toBe(401);
    expect(tx.loginAttempt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ succeeded: false })
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "candidate-1" },
      data: { failedLoginCount: 5 }
    });
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(prismaMock.auditEvent.create).not.toHaveBeenCalled();
  });

  it("locks the account for 15 minutes on the tenth consecutive failure", async () => {
    verifyPasswordMock.mockResolvedValueOnce(false);
    tx.user.findUnique.mockResolvedValueOnce({ ...user, failedLoginCount: 9 });

    const response = await POST(makeRequest({ password: "WrongPassword123" }) as never);

    expect(response.status).toBe(401);
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "candidate-1" },
      data: { failedLoginCount: 0, lockedUntil: expect.any(Date) }
    });
    const lock = tx.user.update.mock.calls[0][0].data.lockedUntil as Date;
    expect(lock.getTime()).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    expect(lock.getTime()).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000 + 1000);
  });

  it("does not verify credentials for a locked account", async () => {
    tx.user.findUnique.mockResolvedValueOnce({
      ...user,
      lockedUntil: new Date(Date.now() + 60_000)
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(401);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("rejects a valid password if session creation detects that the password changed concurrently", async () => {
    createSessionMock.mockResolvedValueOnce(false);

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(401);
    expect(prismaMock.auditEvent.create).not.toHaveBeenCalled();
  });

  it("does not verify a password for an inactive account", async () => {
    tx.user.findUnique.mockResolvedValueOnce({ ...user, isActive: false });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(401);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
  });

  it("does not authenticate a user whose role does not match the selected profile", async () => {
    tx.user.findUnique.mockResolvedValueOnce({ ...user, role: "COMPANY" });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(401);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("does not increment the failure counter again while the account is locked", async () => {
    tx.user.findUnique.mockResolvedValueOnce({
      ...user,
      failedLoginCount: 0,
      lockedUntil: new Date(Date.now() + 60_000)
    });

    const response = await POST(makeRequest({ password: "WrongPassword123" }) as never);

    expect(response.status).toBe(401);
    expect(verifyPasswordMock).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(createSessionMock).not.toHaveBeenCalled();
  });

  it("rejects malformed login input before database access", async () => {
    const response = await POST(makeRequest({ profile: "invalid-profile" }) as never);

    expect(response.status).toBe(400);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects cross-origin login before querying accounts", async () => {
    const response = await POST(new Request("https://acessavagas.example/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com", password: "StrongPassword123" })
    }) as never);

    expect(response.status).toBe(403);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });


  it("rejects a request from a different origin before querying accounts", async () => {
    const response = await POST(new Request("https://acessavagas.example/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://other-origin.example" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com", password: "StrongPassword123" })
    }) as never);

    expect(response.status).toBe(403);
    expect(prismaMock.user.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

});
