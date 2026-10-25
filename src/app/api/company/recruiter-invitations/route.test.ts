import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, createTokenMock, sendEmailMock, rejectOriginMock } = vi.hoisted(() => ({
  prismaMock: {
    company: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    recruiterLink: { findFirst: vi.fn() },
    recruiterInvitation: { findMany: vi.fn() },
    $transaction: vi.fn()
  },
  getCurrentUserMock: vi.fn(),
  createTokenMock: vi.fn(),
  sendEmailMock: vi.fn(),
  rejectOriginMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/auth/tokens", () => ({ createOneTimeToken: createTokenMock }));
vi.mock("@/lib/email", () => ({ sendEmail: sendEmailMock }));
vi.mock("@/lib/security/request-origin", () => ({ rejectCrossOriginRequest: rejectOriginMock }));

import { GET, POST } from "./route";

describe("send recruiter invitation", () => {
  const companyUser = { id: "company-user-1", role: "COMPANY", isActive: true };
  const tx = {
    $queryRaw: vi.fn(),
    recruiterInvitation: {
      findMany: vi.fn(),
      updateMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn()
    },
    user: { create: vi.fn() },
    auditEvent: { create: vi.fn() }
  };
  let transactionCount = 0;

  beforeEach(() => {
    vi.clearAllMocks();
    transactionCount = 0;
    getCurrentUserMock.mockResolvedValue(companyUser);
    rejectOriginMock.mockReturnValue(null);
    createTokenMock.mockReturnValue({ token: "one-time-token-value", tokenHash: "token-hash" });
    sendEmailMock.mockResolvedValue(undefined);
    prismaMock.company.findUnique.mockResolvedValue({ id: "company-1", legalName: "Empresa Exemplo" });
    prismaMock.user.findUnique.mockResolvedValue({ id: "recruiter-1", email: "recruiter@example.com", role: "RECRUITER", isActive: true, pendingActivation: false });
    tx.user.create.mockResolvedValue({ id: "new-recruiter-1", email: "new@example.com", role: "RECRUITER", isActive: false, pendingActivation: true });
    prismaMock.recruiterLink.findFirst.mockResolvedValue(null);
    prismaMock.recruiterInvitation.findMany.mockResolvedValue([]);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => {
      transactionCount += 1;
      return callback(tx);
    });
    tx.$queryRaw.mockResolvedValue([]);
    tx.recruiterInvitation.findMany.mockResolvedValue([]);
    tx.recruiterInvitation.findFirst.mockResolvedValue(null);
    tx.recruiterInvitation.create.mockResolvedValue({ id: "invitation-1" });
    tx.recruiterInvitation.update.mockResolvedValue({ id: "invitation-1" });
    tx.recruiterInvitation.updateMany.mockResolvedValue({ count: 1 });
    tx.auditEvent.create.mockResolvedValue({ id: "audit-1" });
  });

  const makeRequest = (email = "Recruiter@example.com") =>
    new Request("https://acessavagas.example/api/company/recruiter-invitations", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ email, fullName: "Nome do Recrutador" })
    });

  it("lists expired pending invitations as expired without mutating state during GET", async () => {
    prismaMock.recruiterInvitation.findMany.mockResolvedValueOnce([
      {
        id: "expired-invitation-1",
        status: "PENDING",
        expiresAt: new Date(Date.now() - 60_000),
        createdAt: new Date("2026-10-01T12:00:00.000Z"),
        respondedAt: null
      }
    ]);

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      invitations: [{ id: "expired-invitation-1", status: "EXPIRED" }]
    });
    expect(prismaMock.recruiterInvitation.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(tx.recruiterInvitation.updateMany).not.toHaveBeenCalled();
    expect(tx.auditEvent.create).not.toHaveBeenCalled();
  });

  it("normalizes the recipient, serializes invitation creation, and sends a one-time link", async () => {
    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(201);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: "recruiter@example.com" },
      select: { id: true, email: true, role: true, isActive: true, pendingActivation: true }
    });
    expect(tx.$queryRaw).toHaveBeenCalled();
    expect(tx.recruiterInvitation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: "company-1",
        recipientUserId: "recruiter-1",
        sentByUserId: "company-user-1",
        tokenHash: "token-hash",
        expiresAt: expect.any(Date)
      }),
      select: { id: true }
    });
    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "recruiter@example.com",
      text: expect.stringContaining("token=one-time-token-value")
    }));
  });


  it("creates a pending recruiter account when the email is new", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce(null);

    const response = await POST(new Request("https://acessavagas.example/api/company/recruiter-invitations", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://acessavagas.example" },
      body: JSON.stringify({ email: "new@example.com", fullName: "Novo Recrutador" })
    }) as never);

    expect(response.status).toBe(201);
    expect(tx.user.create).toHaveBeenCalledTimes(1);
    expect(tx.user.create.mock.calls[0][0]).toMatchObject({
      data: expect.objectContaining({
        email: "new@example.com",
        fullName: "Novo Recrutador",
        role: "RECRUITER",
        isActive: false,
        pendingActivation: true,
        passwordHash: expect.any(String)
      })
    });
    expect(sendEmailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: "new@example.com",
      text: expect.stringContaining("definir sua senha antes de aceitar o vínculo")
    }));
  });

  it("resends an existing pending invitation by replacing its token", async () => {
    tx.recruiterInvitation.findFirst.mockResolvedValueOnce({ id: "invitation-1" });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(200);
    expect(tx.recruiterInvitation.update).toHaveBeenCalledWith({
      where: { id: "invitation-1" },
      data: expect.objectContaining({
        tokenHash: "token-hash",
        expiresAt: expect.any(Date),
        sentByUserId: "company-user-1",
        respondedAt: null
      }),
      select: { id: true }
    });
    expect(response.headers.get("content-type")).toContain("application/json");
    await expect(response.json()).resolves.toMatchObject({ message: "Convite reenviado; o link anterior foi invalidado." });
  });

  it("cancels the newly created pending invitation and audits a delivery failure", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(502);
    expect(tx.recruiterInvitation.updateMany).toHaveBeenCalledWith({
      where: { id: "invitation-1", tokenHash: "token-hash", status: "PENDING" },
      data: { status: "CANCELLED", respondedAt: expect.any(Date) }
    });
    expect(tx.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ eventType: "RECRUITER_INVITATION_DELIVERY_FAILED" })
    });
  });

  it("does not cancel a newer resend when an older email delivery fails", async () => {
    sendEmailMock.mockRejectedValueOnce(new Error("SMTP unavailable"));
    tx.recruiterInvitation.updateMany.mockResolvedValueOnce({ count: 0 });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(502);
    expect(tx.auditEvent.create).not.toHaveBeenCalledWith({
      data: expect.objectContaining({ eventType: "RECRUITER_INVITATION_DELIVERY_FAILED" })
    });
    await expect(response.json()).resolves.toMatchObject({
      message: "Não foi possível confirmar a entrega deste e-mail. Verifique a lista de convites antes de tentar novamente."
    });
  });

  it("rejects an email belonging to a non-recruiter account", async () => {
    prismaMock.user.findUnique.mockResolvedValueOnce({ id: "candidate-1", email: "recruiter@example.com", role: "CANDIDATE", isActive: true, pendingActivation: false });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(409);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects an inactive company account before sending or mutating invitations", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ ...companyUser, isActive: false });

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(403);
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("rejects invitation listing for an inactive company account", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ ...companyUser, isActive: false });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(prismaMock.recruiterInvitation.findMany).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects invitation listing when the company record is missing", async () => {
    prismaMock.company.findUnique.mockResolvedValueOnce(null);

    const response = await GET();

    expect(response.status).toBe(403);
    expect(prismaMock.recruiterInvitation.findMany).not.toHaveBeenCalled();
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("rejects cross-origin requests before authentication", async () => {
    rejectOriginMock.mockReturnValueOnce(new Response("blocked", { status: 403 }));

    const response = await POST(makeRequest() as never);

    expect(response.status).toBe(403);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
  });
});
