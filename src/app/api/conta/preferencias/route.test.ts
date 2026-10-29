import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock } = vi.hoisted(() => ({
  prismaMock: { userPreference: { findUnique: vi.fn() }, $transaction: vi.fn() },
  getCurrentUserMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
import { GET, PUT } from "./route";

const put = (body: unknown, headers: Record<string, string> = {}) => PUT(new Request("https://example.test/api/conta/preferencias", {
  method: "PUT", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body)
}));

describe("account preferences API", () => {
  const tx = { userPreference: { findUnique: vi.fn(), upsert: vi.fn() }, auditEvent: { create: vi.fn() } };
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "user-1", role: "CANDIDATE", isActive: true });
    prismaMock.userPreference.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (cb: (t: typeof tx) => unknown) => cb(tx));
    tx.userPreference.findUnique.mockResolvedValue(null);
    tx.userPreference.upsert.mockImplementation(async ({ create }: { create: { preferences: unknown } }) => ({ preferences: create.preferences }));
    tx.auditEvent.create.mockResolvedValue({});
  });

  it("requires a session", async () => {
    getCurrentUserMock.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    expect((await put({ preferences: { HIGH_CONTRAST: "ON" } })).status).toBe(401);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("returns defaults when nothing was saved and the saved value afterwards", async () => {
    expect((await (await GET()).json()).preferences).toEqual({ HIGH_CONTRAST: "AUTO" });
    prismaMock.userPreference.findUnique.mockResolvedValue({ preferences: { HIGH_CONTRAST: "ON" } });
    expect((await (await GET()).json()).preferences).toEqual({ HIGH_CONTRAST: "ON" });
  });

  it("saves for the user of the session only and audits just the preference name", async () => {
    const response = await put({ preferences: { HIGH_CONTRAST: "ON" } });
    expect(response.status).toBe(200);
    expect(tx.userPreference.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: "user-1" } }));
    const audit = tx.auditEvent.create.mock.calls[0][0].data;
    expect(audit.eventType).toBe("ACCESSIBILITY_PREFERENCES_UPDATED");
    expect(audit.metadata).toEqual({ changedPreferences: ["HIGH_CONTRAST"] });
  });

  it("does not audit when nothing changes", async () => {
    tx.userPreference.findUnique.mockResolvedValue({ preferences: { HIGH_CONTRAST: "ON" } });
    await put({ preferences: { HIGH_CONTRAST: "ON" } });
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects invalid values, unknown preferences, other users and cross-origin writes", async () => {
    expect((await put({ preferences: { HIGH_CONTRAST: "MAYBE" } })).status).toBe(400);
    expect((await put({ preferences: { UNKNOWN: "ON" } })).status).toBe(400);
    expect((await put({ preferences: { HIGH_CONTRAST: "ON" }, userId: "user-2" })).status).toBe(400);
    expect((await put({ preferences: { HIGH_CONTRAST: "ON" } }, { origin: "https://evil.example" })).status).toBe(403);
  });
});
