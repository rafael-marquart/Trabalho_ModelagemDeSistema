import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, rejectOriginMock } = vi.hoisted(() => ({
  prismaMock: {
    company: { findUnique: vi.fn() },
    $transaction: vi.fn()
  },
  getCurrentUserMock: vi.fn(),
  rejectOriginMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: rejectOriginMock }));

import { POST } from "./route";

describe("cancel recruiter invitation", () => {
  const companyUser = { id: "company-user-1", role: "COMPANY", isActive: true };
  const tx = {
    recruiterInvitation: { updateMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(companyUser);
    rejectOriginMock.mockReturnValue(null);
    prismaMock.company.findUnique.mockResolvedValue({ id: "company-1" });
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.recruiterInvitation.updateMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeRequest = (invitationId = "invitation-1") =>
    new Request("https://acessavagas.example/api/company/recruiter-invitations/cancel", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ invitationId })
    });

  it("cancels only a pending, unexpired invitation owned by the company and audits it", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(tx.recruiterInvitation.updateMany).toHaveBeenCalledWith({
      where: {
        id: "invitation-1",
        companyId: "company-1",
        status: "PENDING",
        expiresAt: expect.objectContaining({ gt: expect.any(Date) })
      },
      data: { status: "CANCELLED", respondedAt: expect.any(Date) }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "company-user-1",
        eventType: "RECRUITER_INVITATION_CANCELLED",
        subjectType: "RecruiterInvitation",
        subjectId: "invitation-1"
      })
    });
  });

  it("returns conflict if the invitation was already answered or expired", async () => {
    tx.recruiterInvitation.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects a missing or inactive company", async () => {
    prismaMock.company.findUnique.mockResolvedValueOnce(null);

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects non-company users", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "candidate-1", role: "CANDIDATE", isActive: true });

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(prismaMock.company.findUnique).not.toHaveBeenCalled();
  });

  it("rejects cross-origin requests before authentication", async () => {
    rejectOriginMock.mockReturnValueOnce(new Response("blocked", { status: 403 }));

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
  });

  it("rejects malformed invitation identifiers", async () => {
    const response = await POST(makeRequest(""));

    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
