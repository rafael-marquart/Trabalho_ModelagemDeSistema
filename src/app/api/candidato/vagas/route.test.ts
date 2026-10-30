// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { userMock, searchMock } = vi.hoisted(() => ({ userMock: vi.fn(), searchMock: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: userMock }));
vi.mock("@/lib/jobs/search-service", () => ({ searchJobsForCandidate: searchMock }));
import { GET } from "./route";

const get = (query = "") => GET(new Request(`https://example.test/api/candidato/vagas${query}`));

describe("GET /api/candidato/vagas", () => {
  beforeEach(() => { vi.clearAllMocks(); searchMock.mockResolvedValue({ jobs: [] }); });
  it("is restricted to active candidates", async () => {
    userMock.mockResolvedValue(null);
    expect((await get()).status).toBe(401);
    userMock.mockResolvedValue({ id: "co", role: "COMPANY", isActive: true });
    expect((await get()).status).toBe(401);
    expect(searchMock).not.toHaveBeenCalled();
  });
  it("searches for the session candidate and rejects invalid filters", async () => {
    userMock.mockResolvedValue({ id: "cand", role: "CANDIDATE", isActive: true });
    expect((await get("?q=dados&modalidade=REMOTO")).status).toBe(200);
    expect(searchMock).toHaveBeenCalledWith("cand", expect.objectContaining({ q: "dados", modalidade: ["REMOTO"], pagina: 1 }));
    expect((await get("?modalidade=QUALQUER")).status).toBe(400);
    expect((await get("?candidateUserId=outro")).status).toBe(400);
  });
});
