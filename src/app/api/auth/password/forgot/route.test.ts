import { beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";

const { prismaMock, sendEmailMock } = vi.hoisted(() => ({
  prismaMock: {
    user: { findFirst: vi.fn() },
    $transaction: vi.fn(),
    recoveryAttempt: { count: vi.fn(), create: vi.fn() },
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

  it("does not replace the token when the account or IP quota is exhausted", async () => {
    tx.recoveryAttempt.count.mockResolvedValueOnce(3).mockResolvedValueOnce(0);
    const request = new Request("https://acessavagas.example/api/auth/password/forgot", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.10" },
      body: JSON.stringify({ profile: "candidate", identifier: "person@example.com" })
    });

    const response = await POST(request as never);

    expect(response.status).toBe(429);
    expect(tx.passwordResetToken.create).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
