import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const { prismaMock, sendEmailMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn() },
    $transaction: vi.fn(),
    recoveryAttempt: { count: vi.fn(), create: vi.fn() },
    recoveryBlock: { findFirst: vi.fn(), upsert: vi.fn() },
    passwordResetToken: { deleteMany: vi.fn(), create: vi.fn() },
    auditEvent: { create: vi.fn() }
  },
  sendEmailMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));

import { POST } from "./route";

describe("password recovery request", () => {
  const user = { id: "user-1", email: "person@example.com" };
  const tx = {
    $queryRaw: vi.fn(),
    recoveryAttempt: { count: vi.fn(), create: vi.fn() },
    passwordResetToken: { deleteMany: vi.fn(), create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.user.findFirst.mockResolvedValue(user);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.$queryRaw.mockResolvedValue([]);
    tx.recoveryAttempt.count.mockResolvedValue(0);
    tx.recoveryAttempt.create.mockResolvedValue({ id: "attempt-1" });
    tx.recoveryBlock.findFirst.mockResolvedValue(null);
    tx.recoveryBlock.upsert.mockResolvedValue({ scopeKey: "scope", blockedUntil: new Date(Date.now() + 15 * 60 * 1000) });
    tx.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
    tx.passwordResetToken.create.mockResolvedValue({ id: "token-1" });
    sendEmailMock.mockResolvedValue(undefined);
  });

  it("stores only a hash of the one-time token and emails the raw token", async () => {
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "PERSON@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(tx.passwordResetToken.deleteMany).toHaveBeenCalledWith({ where: { userId: "user-1", usedAt: null } });
    const stored = tx.passwordResetToken.create.mock.calls[0][0].data;
    expect(stored.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(stored.expiresAt).toBeInstanceOf(Date);

    const email = sendEmailMock.mock.calls[0][0];
    const rawToken = email.text.match(/token=([^\s]+)/)?.[1];
    expect(rawToken).toBeTruthy();
    expect(stored.tokenHash).toBe(createHash("sha256").update(rawToken).digest("hex"));
  });

  it("does not create or send a reset token for an unknown identifier", async () => {
    prismaMock.user.findFirst.mockResolvedValueOnce(null);
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile: "candidate", identifier: "unknown@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(tx.passwordResetToken.create).not.toHaveBeenCalled();
    expect(tx.passwordResetToken.deleteMany).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("keeps the public response generic and audits an email delivery failure", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      message: "Se os dados corresponderem a uma conta elegível, enviaremos instruções ao e-mail cadastrado."
    });
    expect(prismaMock.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorUserId: "user-1",
        eventType: "AUTH_PASSWORD_RECOVERY_EMAIL_FAILED",
        subjectType: "User",
        subjectId: "user-1"
      }
    });
  });

  it("blocks a request when the IP quota is exhausted even if the account quota remains", async () => {
    tx.recoveryAttempt.count.mockResolvedValueOnce(0).mockResolvedValueOnce(3);
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(429);
    expect(tx.recoveryAttempt.create).not.toHaveBeenCalled();
    expect(tx.recoveryBlock.upsert).toHaveBeenCalledWith({
      where: { scopeKey: expect.stringMatching(/^ip:/) },
      create: { scopeKey: expect.stringMatching(/^ip:/), blockedUntil: expect.any(Date) },
      update: { blockedUntil: expect.any(Date) }
    });
    expect(tx.passwordResetToken.deleteMany).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("does not replace the token when the account or IP quota is exhausted", async () => {
    tx.recoveryAttempt.count.mockResolvedValueOnce(3).mockResolvedValueOnce(0);
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(429);
    expect(tx.recoveryBlock.upsert).toHaveBeenCalledWith({
      where: { scopeKey: expect.stringMatching(/^identifier:/) },
      create: { scopeKey: expect.stringMatching(/^identifier:/), blockedUntil: expect.any(Date) },
      update: { blockedUntil: expect.any(Date) }
    });
    expect(tx.passwordResetToken.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("keeps rejecting recovery requests during the full cooldown", async () => {
    tx.recoveryBlock.findFirst.mockResolvedValueOnce({
      scopeKey: "ip:already-blocked",
      blockedUntil: new Date(Date.now() + 60_000)
    });
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(429);
    expect(tx.recoveryAttempt.count).not.toHaveBeenCalled();
    expect(tx.recoveryBlock.upsert).not.toHaveBeenCalled();
    expect(tx.passwordResetToken.deleteMany).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("starts the account cooldown after allowing the third request", async () => {
    tx.recoveryAttempt.count.mockResolvedValueOnce(2).mockResolvedValueOnce(0);
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(tx.recoveryAttempt.create).toHaveBeenCalled();
    expect(tx.recoveryBlock.upsert).toHaveBeenCalledWith({
      where: { scopeKey: expect.stringMatching(/^identifier:/) },
      create: { scopeKey: expect.stringMatching(/^identifier:/), blockedUntil: expect.any(Date) },
      update: { blockedUntil: expect.any(Date) }
    });
    expect(tx.passwordResetToken.create).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
  });

  it("starts the IP cooldown after allowing the third request from that IP", async () => {
    tx.recoveryAttempt.count.mockResolvedValueOnce(0).mockResolvedValueOnce(2);
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(200);
    expect(tx.recoveryBlock.upsert).toHaveBeenCalledWith({
      where: { scopeKey: expect.stringMatching(/^ip:/) },
      create: { scopeKey: expect.stringMatching(/^ip:/), blockedUntil: expect.any(Date) },
      update: { blockedUntil: expect.any(Date) }
    });
    expect(tx.passwordResetToken.create).toHaveBeenCalled();
    expect(sendEmailMock).toHaveBeenCalled();
  });

});
