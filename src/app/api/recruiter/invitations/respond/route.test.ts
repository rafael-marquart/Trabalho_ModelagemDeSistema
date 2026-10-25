import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashOneTimeToken } from "@/lib/auth/tokens";

const { prismaMock, getCurrentUserMock, rejectOriginMock } = vi.hoisted(() => ({
  prismaMock: {
    recruiterInvitation: { findUnique: vi.fn() },
    $transaction: vi.fn()
  },
  getCurrentUserMock: vi.fn(),
  rejectOriginMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: rejectOriginMock }));

import { POST } from "./route";

describe("recruiter invitation response", () => {
  const user = { id: "recruiter-1", role: "RECRUITER", isActive: true };
  const invitation = {
    id: "invitation-1",
    companyId: "company-1",
    recipientUserId: "recruiter-1",
    status: "PENDING",
    tokenHash: "stored-hash",
    expiresAt: new Date(Date.now() + 60_000)
  };
  const tx = {
    company: { findUnique: vi.fn() },
    recruiterLink: { findFirst: vi.fn(), create: vi.fn() },
    recruiterInvitation: { updateMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(user);
    rejectOriginMock.mockReturnValue(null);
    prismaMock.recruiterInvitation.findUnique.mockResolvedValue(invitation);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.company.findUnique.mockResolvedValue({ id: "company-1", accountUser: { isActive: true } });
    tx.recruiterLink.findFirst.mockResolvedValue(null);
    tx.recruiterLink.create.mockResolvedValue({ id: "link-1" });
    tx.recruiterInvitation.updateMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeRequest = (action: "accept" | "refuse" = "accept", token = "a-valid-invitation-token") =>
    new Request("https://acessavagas.example/api/recruiter/invitations/respond", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ token, action })
    });

  it("accepts a valid invitation and creates an active recruiter link in the transaction", async () => {
    const response = await POST(makeRequest());

    expect(response.status).toBe(200);
    expect(prismaMock.recruiterInvitation.findUnique).toHaveBeenCalledWith({
      where: { tokenHash: hashOneTimeToken("a-valid-invitation-token") }
    });
    expect(tx.recruiterInvitation.updateMany).toHaveBeenCalledWith({
      where: {
        id: "invitation-1",
        recipientUserId: "recruiter-1",
        status: "PENDING",
        expiresAt: expect.objectContaining({ gt: expect.any(Date) }),
        tokenHash: hashOneTimeToken("a-valid-invitation-token")
      },
      data: { status: "ACCEPTED", respondedAt: expect.any(Date) }
    });
    expect(tx.recruiterLink.create).toHaveBeenCalledWith({
      data: { companyId: "company-1", recruiterId: "recruiter-1" }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "recruiter-1",
        eventType: "RECRUITER_INVITATION_ACCEPTED",
        subjectId: "invitation-1"
      })
    });
  });

  it("uses serializable isolation when claiming and accepting an invitation", async () => {
    await POST(makeRequest());

    expect(prismaMock.$transaction).toHaveBeenCalledWith(
      expect.any(Function),
      { isolationLevel: "Serializable" }
    );
  });

  it("refuses an invitation without creating a recruiter link", async () => {
    const response = await POST(makeRequest("refuse"));

    expect(response.status).toBe(200);
    expect(tx.recruiterInvitation.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { status: "REFUSED", respondedAt: expect.any(Date) }
    }));
    expect(tx.recruiterLink.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ eventType: "RECRUITER_INVITATION_REFUSED" })
    });
  });

  it("rejects invitations addressed to another recruiter", async () => {
    prismaMock.recruiterInvitation.findUnique.mockResolvedValueOnce({
      ...invitation,
      recipientUserId: "different-recruiter"
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("does not create a link if another request already claimed the invitation", async () => {
    tx.recruiterInvitation.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    expect(tx.recruiterLink.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("rejects acceptance when the company is inactive", async () => {
    tx.company.findUnique.mockResolvedValueOnce({ id: "company-1", accountUser: { isActive: false } });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    expect(tx.recruiterInvitation.updateMany).not.toHaveBeenCalled();
    expect(tx.recruiterLink.create).not.toHaveBeenCalled();
  });

  it("rejects a cross-origin request before authentication", async () => {
    rejectOriginMock.mockReturnValueOnce(new Response("blocked", { status: 403 }));

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
  });
});
