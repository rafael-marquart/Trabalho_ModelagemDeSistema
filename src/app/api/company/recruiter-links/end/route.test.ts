import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, rejectOriginMock } = vi.hoisted(() => ({
  prismaMock: { company: { findUnique: vi.fn() }, $transaction: vi.fn() },
  getCurrentUserMock: vi.fn(),
  rejectOriginMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: rejectOriginMock }));

import { POST } from "./route";

describe("end recruiter link", () => {
  const companyUser = { id: "company-user-1", role: "COMPANY", isActive: true };
  const tx = {
    recruiterLink: { updateMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(companyUser);
    rejectOriginMock.mockReturnValue(null);
    prismaMock.company.findUnique.mockResolvedValue({ id: "company-1" });
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.recruiterLink.updateMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeRequest = (recruiterLinkId = "link-1") =>
    new Request("https://acessavagas.example/api/company/recruiter-links/end", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ recruiterLinkId })
    });

  it("ends only an active link owned by the requesting company and audits it", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(tx.recruiterLink.updateMany).toHaveBeenCalledWith({
      where: { id: "link-1", companyId: "company-1", active: true },
      data: { active: false, endedAt: expect.any(Date) }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: {
        actorUserId: "company-user-1",
        eventType: "RECRUITER_LINK_ENDED",
        subjectType: "RecruiterLink",
        subjectId: "link-1"
      }
    });
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });

  it("does not end or audit a link owned by another company", async () => {
    tx.recruiterLink.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest("foreign-link"));

    expect(response.status).toBe(409);
    expect(tx.recruiterLink.updateMany).toHaveBeenCalledWith({
      where: { id: "foreign-link", companyId: "company-1", active: true },
      data: { active: false, endedAt: expect.any(Date) }
    });
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("does not report success if audit persistence fails", async () => {
    tx.auditEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
    expect(tx.recruiterLink.updateMany).toHaveBeenCalled();
  });

  it("rejects users who are not companies", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "candidate-1", role: "CANDIDATE", isActive: true });

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(prismaMock.company.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects an inactive company or missing company record", async () => {
    prismaMock.company.findUnique.mockResolvedValueOnce(null);

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects cross-origin requests before authentication", async () => {
    rejectOriginMock.mockReturnValueOnce(new Response("blocked", { status: 403 }));

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
  });

  it("rejects malformed link identifiers", async () => {
    const response = await POST(makeRequest(""));

    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
