// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { userMock, applyMock } = vi.hoisted(() => ({ userMock: vi.fn(), applyMock: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: userMock }));
vi.mock("@/lib/applications/service", () => ({ applyToJob: applyMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: (request: Request) => request.headers.get("origin") === "https://evil.example" ? new Response(null, { status: 403 }) : null }));
import { POST } from "./route";

const post = (body: unknown, origin?: string) => POST(new Request("https://example.test/api/candidato/candidaturas", { method: "POST", headers: { "content-type": "application/json", ...(origin ? { origin } : {}) }, body: JSON.stringify(body) }));

describe("POST /api/candidato/candidaturas", () => {
  beforeEach(() => { vi.clearAllMocks(); userMock.mockResolvedValue({ id: "cand", role: "CANDIDATE", isActive: true }); });
  it("only lets a signed-in candidate apply, from the same origin", async () => {
    userMock.mockResolvedValueOnce(null);
    expect((await post({ jobId: "j" })).status).toBe(401);
    userMock.mockResolvedValueOnce({ id: "r", role: "RECRUITER", isActive: true });
    expect((await post({ jobId: "j" })).status).toBe(401);
    expect((await post({ jobId: "j" }, "https://evil.example")).status).toBe(403);
    expect(applyMock).not.toHaveBeenCalled();
  });
  it("takes the candidate from the session, never from the body", async () => {
    expect((await post({ jobId: "j", candidateUserId: "other" })).status).toBe(400);
    applyMock.mockResolvedValue({ ok: true, application: { stage: "INSCRITO" } });
    expect((await post({ jobId: "j" })).status).toBe(201);
    expect(applyMock).toHaveBeenCalledWith("cand", "j");
  });
  it("returns the refusal reason", async () => {
    applyMock.mockResolvedValue({ ok: false, code: "DUPLICATE", message: "Você já se candidatou a esta vaga.", status: 409 });
    const response = await post({ jobId: "j" });
    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: "DUPLICATE" });
  });
});
