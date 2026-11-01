// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";

const { actorMock, changeMock } = vi.hoisted(() => ({ actorMock: vi.fn(), changeMock: vi.fn() }));
vi.mock("@/lib/jobs/access", () => ({ resolveJobActor: actorMock }));
vi.mock("@/lib/applications/company-service", () => ({ changeApplicationStage: changeMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: () => null }));
import { POST } from "./route";

const post = (body: unknown) => POST(new Request("https://example.test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), { params: Promise.resolve({ id: "a1" }) });

describe("POST /api/candidaturas/[id]/etapa", () => {
  beforeEach(() => { vi.clearAllMocks(); actorMock.mockResolvedValue({ user: { id: "rec" }, companyId: "company-1" }); });
  it("refuses callers that are not the company or a linked recruiter", async () => {
    actorMock.mockResolvedValueOnce({ error: NextResponse.json({}, { status: 401 }) });
    expect((await post({ toStage: "TRIAGEM" })).status).toBe(401);
    expect(changeMock).not.toHaveBeenCalled();
  });
  it("accepts only the destination and a note, and uses the company from the session", async () => {
    expect((await post({ toStage: "TRIAGEM", companyId: "other" })).status).toBe(400);
    expect((await post({ toStage: "QUALQUER" })).status).toBe(400);
    changeMock.mockResolvedValue({ ok: true, stage: "TRIAGEM" });
    expect((await post({ toStage: "TRIAGEM", note: "ok" })).status).toBe(200);
    expect(changeMock).toHaveBeenCalledWith({ companyId: "company-1", actorUserId: "rec", applicationId: "a1", toStage: "TRIAGEM", note: "ok" });
  });
  it("passes on refusals", async () => {
    changeMock.mockResolvedValue({ ok: false, status: 409, message: "Não é possível." });
    expect((await post({ toStage: "CONTRATADO" })).status).toBe(409);
  });
});
