import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { revokeCurrentSessionMock } = vi.hoisted(() => ({
  revokeCurrentSessionMock: vi.fn()
}));

vi.mock("@/lib/auth/session", () => ({
  revokeCurrentSession: revokeCurrentSessionMock
}));

import { POST } from "./route";

describe("logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    revokeCurrentSessionMock.mockResolvedValue(undefined);
    delete process.env.APP_BASE_URL;
    vi.stubEnv("NODE_ENV", "test");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("revokes the current session and redirects to the entry page", async () => {
    const request = new Request("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: { origin: "http://localhost:3000" }
    });

    const response = await POST(request as never);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost:3000/");
    expect(revokeCurrentSessionMock).toHaveBeenCalledTimes(1);
  });

  it("rejects a cross-origin logout without revoking the session", async () => {
    const request = new Request("http://localhost:3000/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://attacker.example" }
    });

    const response = await POST(request as never);

    expect(response.status).toBe(403);
    expect(revokeCurrentSessionMock).not.toHaveBeenCalled();
  });

  it("does not redirect or revoke the session when production origin is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.APP_BASE_URL;
    const request = new Request("https://acessavagas.example/api/auth/logout", {
      method: "POST",
      headers: { origin: "https://acessavagas.example" }
    });

    const response = await POST(request as never);

    expect(response.status).toBe(503);
    expect(revokeCurrentSessionMock).not.toHaveBeenCalled();
  });
});
