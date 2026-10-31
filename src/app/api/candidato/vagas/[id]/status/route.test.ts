// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { userMock, prismaMock } = vi.hoisted(() => ({ userMock: vi.fn(), prismaMock: { job: { findFirst: vi.fn() } } }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: userMock }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { GET } from "./route";

const call = () => GET(new Request("https://example.test"), { params: Promise.resolve({ id: "job-1" }) });

describe("GET job status (SPEC-009)", () => {
  beforeEach(() => { vi.clearAllMocks(); userMock.mockResolvedValue({ id: "c", role: "CANDIDATE", isActive: true }); });
  it("is for signed-in candidates only", async () => {
    userMock.mockResolvedValueOnce(null);
    expect((await call()).status).toBe(401);
    userMock.mockResolvedValueOnce({ id: "e", role: "COMPANY", isActive: true });
    expect((await call()).status).toBe(401);
  });
  it("reads the current stored status and hides drafts", async () => {
    prismaMock.job.findFirst.mockResolvedValueOnce({ status: "PAUSED", deadline: null });
    expect((await (await call()).json()).availability).toMatchObject({ code: "UNAVAILABLE", label: "Indisponível" });
    expect(prismaMock.job.findFirst.mock.calls[0][0].where).toMatchObject({ status: { in: ["OPEN", "PAUSED", "CLOSED"] } });
    prismaMock.job.findFirst.mockResolvedValueOnce(null);
    expect((await call()).status).toBe(404);
  });
  it("never presumes availability when the record cannot be read", async () => {
    prismaMock.job.findFirst.mockRejectedValueOnce(new Error("db down"));
    const body = await (await call()).json();
    expect(body.availability.code).toBe("UNAVAILABLE");
  });
});
