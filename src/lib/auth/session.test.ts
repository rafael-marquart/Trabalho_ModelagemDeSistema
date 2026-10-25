import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, cookieSet } = vi.hoisted(() => ({
  prismaMock: { $transaction: vi.fn() },
  cookieSet: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    set: cookieSet,
    delete: vi.fn(),
    get: vi.fn()
  }))
}));

import { createSession } from "./session";

describe("createSession", () => {
  const passwordChangedAt = new Date("2026-01-01T00:00:00.000Z");
  const queryRaw = vi.fn();
  const sessionCreate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.$transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({ $queryRaw: queryRaw, session: { create: sessionCreate } })
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
