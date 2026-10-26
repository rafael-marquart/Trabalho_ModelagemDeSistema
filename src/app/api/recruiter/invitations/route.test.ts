import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock } = vi.hoisted(() => ({
  prismaMock: {
    recruiterLink: { findFirst: vi.fn() },
    recruiterInvitation: { findMany: vi.fn() }
  },
  getCurrentUserMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));

import { GET } from "./route";

describe("recruiter invitation overview", () => {
  const recruiter = { id: "recruiter-1", role: "RECRUITER", isActive: true };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(recruiter);
    prismaMock.recruiterLink.findFirst.mockResolvedValue({
      id: "link-1",
      createdAt: new Date("2026-10-01T12:00:00.000Z"),
      company: { legalName: "Empresa Exemplo Ltda.", tradeName: "Empresa Exemplo" }
    });
    prismaMock.recruiterInvitation.findMany.mockResolvedValue([{
      id: "invitation-1",
      createdAt: new Date("2026-10-20T12:00:00.000Z"),
      expiresAt: new Date("2026-10-30T12:00:00.000Z"),
      company: { legalName: "Outra Empresa Ltda.", tradeName: null }
    }]);
  });

  it("returns only the current recruiter's active link and pending unexpired invitations", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(prismaMock.recruiterLink.findFirst).toHaveBeenCalledWith({
      where: { recruiterId: "recruiter-1", active: true },
      select: {
        id: true,
        createdAt: true,
        company: { select: { legalName: true, tradeName: true } }
      }
    });
    expect(prismaMock.recruiterInvitation.findMany).toHaveBeenCalledWith(expect.objectContaining({
      where: { recipientUserId: "recruiter-1", status: "PENDING", expiresAt: { gt: expect.any(Date) } },
      orderBy: { createdAt: "desc" }
    }));
    await expect(response.json()).resolves.toMatchObject({
      link: { id: "link-1", companyName: "Empresa Exemplo" },
      invitations: [{ id: "invitation-1", companyName: "Outra Empresa Ltda." }]
    });
  });

  it.each([
    { label: "anonymous", user: null },
    { label: "candidate", user: { id: "candidate-1", role: "CANDIDATE", isActive: true } },
    { label: "company", user: { id: "company-1", role: "COMPANY", isActive: true } },
    { label: "admin", user: { id: "admin-1", role: "ADMIN", isActive: true } }
  ])("rejects $label access without querying recruiter data", async ({ user }) => {
    getCurrentUserMock.mockResolvedValueOnce(user);

    const response = await GET();

    expect(response.status).toBe(401);
    expect(prismaMock.recruiterLink.findFirst).not.toHaveBeenCalled();
    expect(prismaMock.recruiterInvitation.findMany).not.toHaveBeenCalled();
  });
});
