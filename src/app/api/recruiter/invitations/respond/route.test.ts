import { beforeEach, describe, expect, it, vi } from "vitest";
import { hashOneTimeToken } from "@/lib/auth/tokens";

const { prismaMock, getCurrentUserMock, rejectOriginMock } = vi.hoisted(() => ({
  prismaMock: {
    recruiterInvitation: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
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
    user: { updateMany: vi.fn() },
    auditEvent: { create: vi.fn() }
  };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(user);
    rejectOriginMock.mockReturnValue(null);
    prismaMock.recruiterInvitation.findUnique.mockResolvedValue(invitation);
    prismaMock.user.findUnique.mockResolvedValue({ id: "recruiter-1", role: "RECRUITER", isActive: true, pendingActivation: false });
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.company.findUnique.mockResolvedValue({ id: "company-1", accountUser: { isActive: true } });
    tx.recruiterLink.findFirst.mockResolvedValue(null);
    tx.recruiterLink.create.mockResolvedValue({ id: "link-1" });
    tx.recruiterInvitation.updateMany.mockResolvedValue({ count: 1 });
    tx.user.updateMany.mockResolvedValue({ count: 1 });
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

  it("rejects non-recruiter users before looking up the invitation", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "candidate-1", role: "CANDIDATE", isActive: true });

    const response = await POST(makeRequest());

    expect(response.status).toBe(401);
    expect(prismaMock.recruiterInvitation.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("does not create a link if the recruiter becomes linked before acceptance", async () => {
    tx.recruiterLink.findFirst.mockResolvedValueOnce({ id: "existing-link" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    expect(tx.recruiterInvitation.updateMany).not.toHaveBeenCalled();
    expect(tx.recruiterLink.create).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("does not consume a valid token when a serializable transaction finds the company inactive", async () => {
    tx.company.findUnique.mockResolvedValueOnce({ id: "company-1", accountUser: { isActive: false } });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    expect(tx.recruiterInvitation.updateMany).not.toHaveBeenCalled();
    expect(tx.recruiterLink.create).not.toHaveBeenCalled();
  });

  it("expires an overdue invitation and audits only the winning state transition", async () => {
    prismaMock.recruiterInvitation.findUnique.mockResolvedValueOnce({
      ...invitation,
      expiresAt: new Date(Date.now() - 1000)
    });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(tx.recruiterInvitation.updateMany).toHaveBeenCalledTimes(1);
    const expirationUpdate = tx.recruiterInvitation.updateMany.mock.calls[0][0];
    expect(expirationUpdate.where).toMatchObject({
      id: "invitation-1",
      recipientUserId: "recruiter-1",
      tokenHash: hashOneTimeToken("a-valid-invitation-token"),
      status: "PENDING"
    });
    expect(expirationUpdate.where.expiresAt.lte).toBeInstanceOf(Date);
    expect(expirationUpdate.data).toMatchObject({ status: "EXPIRED" });
    expect(expirationUpdate.data.respondedAt).toBeInstanceOf(Date);
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        eventType: "RECRUITER_INVITATION_EXPIRED",
        subjectId: "invitation-1"
      })
    });
  });

  it("does not duplicate expiration audit when another request already changed the invitation", async () => {
    prismaMock.recruiterInvitation.findUnique.mockResolvedValueOnce({
      ...invitation,
      expiresAt: new Date(Date.now() - 1000)
    });
    tx.recruiterInvitation.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest());

    expect(response.status).toBe(400);
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
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

  it("maps a serializable transaction conflict to a retryable conflict response", async () => {
    prismaMock.$transaction.mockRejectedValueOnce({ code: "P2034" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      message: "Houve uma alteração simultânea no vínculo. Atualize a página e tente novamente."
    });
  });

  it("maps a unique active-link conflict to a conflict response", async () => {
    prismaMock.$transaction.mockRejectedValueOnce({ code: "P2002" });

    const response = await POST(makeRequest());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({
      message: "Você já possui vínculo ativo com outra empresa. Atualize a página e verifique seus vínculos."
    });
  });

  it("does not report acceptance if invitation audit persistence fails", async () => {
    tx.auditEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
    expect(tx.recruiterInvitation.updateMany).toHaveBeenCalled();
    expect(tx.recruiterLink.create).toHaveBeenCalled();
  });

  it("does not report expiration handling as successful if its audit write fails", async () => {
    prismaMock.recruiterInvitation.findUnique.mockResolvedValueOnce({
      ...invitation,
      expiresAt: new Date(Date.now() - 1000)
    });
    tx.auditEvent.create.mockRejectedValueOnce(new Error("audit database unavailable"));

    await expect(POST(makeRequest())).rejects.toThrow("audit database unavailable");
  });

  it("rejects a cross-origin request before authentication", async () => {
    rejectOriginMock.mockReturnValueOnce(new Response("blocked", { status: 403 }));

    const response = await POST(makeRequest());

    expect(response.status).toBe(403);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
  });
});
