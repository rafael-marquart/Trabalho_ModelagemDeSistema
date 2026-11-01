import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, analyzeMock } = vi.hoisted(() => ({
  prismaMock: { compatibilityResult: { findFirst: vi.fn() } }, getCurrentUserMock: vi.fn(), analyzeMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/compatibility/service", async (original) => ({ ...(await original<typeof import("@/lib/compatibility/service")>()), analyzeCandidateForJob: analyzeMock }));
import { GET, POST } from "./route";

const post = (body: unknown, headers: Record<string, string> = {}) => POST(new Request("https://example.test/api/candidato/compatibilidade", {
  method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body)
}));

describe("candidate compatibility API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "cand-1", role: "CANDIDATE", isActive: true });
    analyzeMock.mockResolvedValue({ view: { id: "r1", status: "COMPLETE", score: 80 } });
  });

  it("is private to signed-in candidates", async () => {
    for (const user of [null, { id: "c", role: "COMPANY", isActive: true }, { id: "r", role: "RECRUITER", isActive: true }]) {
      getCurrentUserMock.mockResolvedValueOnce(user);
      expect((await post({ jobId: "j" })).status).toBe(401);
    }
    getCurrentUserMock.mockResolvedValueOnce({ id: "c", role: "COMPANY", isActive: true });
    expect((await GET(new Request("https://example.test/api/candidato/compatibilidade?jobId=j"))).status).toBe(401);
    expect(analyzeMock).not.toHaveBeenCalled();
  });

  it("uses the candidate of the session, never one from the body", async () => {
    expect((await post({ jobId: "j", candidateUserId: "other" })).status).toBe(400);
    expect((await post({ jobId: "j", transportMode: "Carro" })).status).toBe(201);
    expect(analyzeMock).toHaveBeenCalledWith({ userId: "cand-1", jobId: "j", transportMode: "Carro" });
    expect((await post({ jobId: "j" }, { origin: "https://evil.example" })).status).toBe(403);
  });

  it("passes service errors through", async () => {
    analyzeMock.mockResolvedValue({ error: { status: 404, message: "Vaga não disponível para análise." } });
    const response = await post({ jobId: "j" });
    expect(response.status).toBe(404);
  });

  it("reads only the latest result of the candidate of the session", async () => {
    prismaMock.compatibilityResult.findFirst.mockResolvedValue(null);
    const response = await GET(new Request("https://example.test/api/candidato/compatibilidade?jobId=j"));
    expect((await response.json()).result).toBeNull();
    expect(prismaMock.compatibilityResult.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { candidateUserId: "cand-1", jobId: "j" } }));
    expect((await GET(new Request("https://example.test/api/candidato/compatibilidade"))).status).toBe(400);
  });
});
