import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, cookieSet, cookieGet, cookieDelete } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(),
    session: {
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn()
    },
    auditEvent: { create: vi.fn() }
  },
  cookieSet: vi.fn(),
  cookieGet: vi.fn(),
  cookieDelete: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: cookieSet,
    delete: cookieDelete,
    get: cookieGet
  }))
}));

import { createSession, getCurrentUser, revokeCurrentSession } from "./session";

describe("createSession", () => {
  const passwordChangedAt = new Date("2026-01-01T00:00:00.000Z");
  const queryRaw = vi.fn();
  const sessionCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.auditEvent.create.mockResolvedValue({ id: "audit-1" });
    prismaMock.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        $queryRaw: queryRaw,
        session: { create: sessionCreate, findUnique: prismaMock.session.findUnique, deleteMany: prismaMock.session.deleteMany },
        auditEvent: { create: prismaMock.auditEvent.create }
      })
    );
    queryRaw.mockResolvedValue([{ id: "user-1" }]);
    sessionCreate.mockResolvedValue({ id: "session-1" });
  });

  it("does not create a session or set a cookie when the password changed after verification", async () => {
    queryRaw.mockResolvedValueOnce([]);

    const result = await createSession("user-1", false, passwordChangedAt);

    expect(result).toBe(false);
    expect(sessionCreate).not.toHaveBeenCalled();
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("creates a session with a hashed token and sets an HttpOnly cookie when credentials remain current", async () => {
    const result = await createSession("user-1", false, passwordChangedAt);

    expect(result).toBe(true);
    expect(sessionCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "user-1",
        rememberMe: false,
        tokenHash: expect.stringMatching(/^[a-f0-9]{64}$/)
      })
    });
    expect(cookieSet).toHaveBeenCalledWith(
      "acessa_session",
      expect.any(String),
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        path: "/"
      })
    );
    const rawToken = cookieSet.mock.calls[0][1] as string;
    const storedHash = sessionCreate.mock.calls[0][0].data.tokenHash as string;
    expect(storedHash).toBe(createHash("sha256").update(rawToken).digest("hex"));
    expect(storedHash).not.toBe(rawToken);
  });

  it("does not issue a session cookie when successful-login auditing fails", async () => {
    const auditCreate = vi.fn().mockRejectedValue(new Error("audit database unavailable"));
    prismaMock.$transaction.mockImplementationOnce(async (callback: (tx: unknown) => unknown) =>
      callback({ $queryRaw: queryRaw, session: { create: sessionCreate }, auditEvent: { create: auditCreate } })
    );

    await expect(createSession("user-1", false, passwordChangedAt)).rejects.toThrow("audit database unavailable");
    expect(sessionCreate).toHaveBeenCalled();
    expect(auditCreate).toHaveBeenCalledWith({
      data: {
        actorUserId: "user-1",
        eventType: "AUTH_LOGIN_SUCCEEDED",
        subjectType: "User",
        subjectId: "user-1"
      }
    });
    expect(cookieSet).not.toHaveBeenCalled();
  });

  it("sets an expiration on the persistent cookie for the remember-me option", async () => {
    await createSession("user-1", true, passwordChangedAt);

    expect(cookieSet).toHaveBeenCalledWith(
      "acessa_session",
      expect.any(String),
      expect.objectContaining({ expires: expect.any(Date) })
    );
  });
});

describe("getCurrentUser", () => {
  const currentUser = { id: "user-1", isActive: true, role: "CANDIDATE" };
  const validSession = () => ({
    id: "session-1",
    userId: "user-1",
    user: currentUser,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    absoluteExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockReturnValue({ value: "raw-session-token" });
    prismaMock.session.findUnique.mockResolvedValue(validSession());
    prismaMock.session.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });
  });

  it("returns the user when the session is refreshed successfully", async () => {
    await expect(getCurrentUser()).resolves.toEqual(currentUser);
    expect(prismaMock.session.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        id: "session-1",
        expiresAt: expect.objectContaining({ gt: expect.any(Date) }),
        absoluteExpiresAt: expect.objectContaining({ gt: expect.any(Date) })
      })
    }));
  });

  it("returns null when the session is revoked between lookup and refresh", async () => {
    prismaMock.session.updateMany.mockResolvedValueOnce({ count: 0 });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("deletes an expired session and does not refresh it", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      ...validSession(),
      expiresAt: new Date(Date.now() - 1000)
    });

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { id: "session-1" } });
    expect(prismaMock.session.updateMany).not.toHaveBeenCalled();
  });

  it("deletes a session whose absolute lifetime has ended", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      ...validSession(),
      absoluteExpiresAt: new Date(Date.now() - 1000)
    });

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { id: "session-1" } });
    expect(prismaMock.session.updateMany).not.toHaveBeenCalled();
  });

  it("does not refresh a session belonging to an inactive user", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce({
      ...validSession(),
      user: { ...currentUser, isActive: false }
    });

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({ where: { id: "session-1" } });
    expect(prismaMock.session.updateMany).not.toHaveBeenCalled();
  });

  it("returns null when no session cookie is present", async () => {
    cookieGet.mockReturnValueOnce(undefined);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(prismaMock.session.findUnique).not.toHaveBeenCalled();
  });
});

describe("revokeCurrentSession", () => {
  const tokenHash = createHash("sha256").update("raw-session-token").digest("hex");

  beforeEach(() => {
    vi.clearAllMocks();
    cookieGet.mockReturnValue({ value: "raw-session-token" });
    prismaMock.session.findUnique.mockResolvedValue({ id: "session-1", userId: "user-1" });
    prismaMock.session.deleteMany.mockResolvedValue({ count: 1 });
    prismaMock.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  it("revokes the session and audits logout in one transaction before clearing the cookie", async () => {
    await revokeCurrentSession();

    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function));
    expect(prismaMock.session.findUnique).toHaveBeenCalledWith({
      where: { tokenHash },
      select: { id: true, userId: true }
    });
    expect(prismaMock.session.deleteMany).toHaveBeenCalledWith({
      where: { id: "session-1", tokenHash }
    });
    expect(prismaMock.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorUserId: "user-1",
        eventType: "AUTH_LOGOUT",
        subjectType: "User",
        subjectId: "user-1"
      }
    });
    expect(cookieDelete).toHaveBeenCalledWith("acessa_session");
  });

  it("does not create a logout audit when the session no longer exists", async () => {
    prismaMock.session.findUnique.mockResolvedValueOnce(null);

    await revokeCurrentSession();

    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.auditEvent.create).not.toHaveBeenCalled();
    expect(cookieDelete).toHaveBeenCalledWith("acessa_session");
  });

  it("does not audit logout if the conditional revocation loses a race", async () => {
    prismaMock.session.deleteMany.mockResolvedValueOnce({ count: 0 });

    await revokeCurrentSession();

    expect(prismaMock.auditEvent.create).not.toHaveBeenCalled();
    expect(cookieDelete).toHaveBeenCalledWith("acessa_session");
  });

  it("still clears the cookie when no session token is present", async () => {
    cookieGet.mockReturnValueOnce(undefined);

    await revokeCurrentSession();

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(prismaMock.session.deleteMany).not.toHaveBeenCalled();
    expect(cookieDelete).toHaveBeenCalledWith("acessa_session");
  });
});
