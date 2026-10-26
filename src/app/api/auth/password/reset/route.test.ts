import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, hashPasswordMock } = vi.hoisted(() => ({
  prismaMock: {
    passwordResetToken: { findUnique: vi.fn() },
    $transaction: vi.fn(),
    auditEvent: { create: vi.fn() }
  },
  hashPasswordMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/password", () => ({ hashPassword: hashPasswordMock }));

import { POST } from "./route";

describe("password reset", () => {
  const tokenRecord = {
    id: "reset-token-1",
    userId: "user-1",
    usedAt: null,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    user: { id: "user-1", isActive: true }
  };
  const tx = {
    $queryRaw: vi.fn(),
    passwordResetToken: { updateMany: vi.fn(), deleteMany: vi.fn() },
    user: { update: vi.fn() },
    session: { deleteMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.passwordResetToken.findUnique.mockResolvedValue(tokenRecord);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.$queryRaw.mockResolvedValue([{ id: "user-1" }]);
    tx.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
    tx.passwordResetToken.deleteMany.mockResolvedValue({ count: 1 });
    tx.user.update.mockResolvedValue({ id: "user-1" });
    tx.session.deleteMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
    hashPasswordMock.mockResolvedValue("new-password-hash");
  });

  const makeRequest = (token = "one-time-reset-token-value", password = "NewPassword123") =>
    new Request("https://acessavagas.example/api/auth/password/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token, password, confirmPassword: password })
    });

  it("changes the password, invalidates sessions and audits a successful reset", async () => {
    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.passwordResetToken.updateMany).toHaveBeenCalledWith({
      where: { id: "reset-token-1", usedAt: null, expiresAt: expect.objectContaining({ gt: expect.any(Date) }) },
      data: { usedAt: expect.any(Date) }
    });
    expect(tx.user.update).toHaveBeenCalledWith({
      where: { id: "user-1" },
      data: expect.objectContaining({
        passwordHash: "new-password-hash",
        passwordChangedAt: expect.any(Date),
        failedLoginCount: 0,
        lockedUntil: null
      })
    });
    expect(tx.session.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1" } });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ eventType: "AUTH_PASSWORD_RESET_SUCCEEDED", subjectId: "user-1" })
    });
  });

  it("does not report a successful reset if the audit write fails inside the transaction", async () => {
    tx.auditEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest() as never)).rejects.toThrow("audit database unavailable");
    expect(tx.passwordResetToken.updateMany).toHaveBeenCalled();
    expect(tx.user.update).toHaveBeenCalled();
    expect(tx.session.deleteMany).toHaveBeenCalled();
  });

  it("rejects an already-claimed token without changing the password", async () => {
    tx.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.session.deleteMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects an expired token before hashing or opening a transaction", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValueOnce({
      ...tokenRecord,
      expiresAt: new Date(Date.now() - 1000)
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a token belonging to an inactive account", async () => {
    prismaMock.passwordResetToken.findUnique.mockResolvedValueOnce({
      ...tokenRecord,
      user: { id: "user-1", isActive: false }
    });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a token that another concurrent request has already claimed", async () => {
    tx.passwordResetToken.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(tx.passwordResetToken.deleteMany).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.session.deleteMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a reset if the account becomes inactive before the transaction locks it", async () => {
    tx.$queryRaw.mockResolvedValueOnce([]);

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(400);
    expect(tx.passwordResetToken.updateMany).not.toHaveBeenCalled();
    expect(tx.user.update).not.toHaveBeenCalled();
    expect(tx.session.deleteMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects malformed input without querying the token", async () => {
    const response = await POST(new Request("https://acessavagas.example/api/auth/password/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ token: "short", password: "weak", confirmPassword: "different" })
    }) as never);

    expect(response.status).toBe(400);
    expect(prismaMock.passwordResetToken.findUnique).not.toHaveBeenCalled();
  });
  it("rejects malformed JSON before querying or consuming a reset token", async () => {
    const response = await POST(new Request("https://acessavagas.example/api/auth/password/reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{"
    }) as never);

    expect(response.status).toBe(400);
    expect(prismaMock.passwordResetToken.findUnique).not.toHaveBeenCalled();
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

});
