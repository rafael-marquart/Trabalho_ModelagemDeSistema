import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock } = vi.hoisted(() => ({
  prismaMock: {
    company: { findUnique: vi.fn() },
    recruiterLink: { findMany: vi.fn() }
  },
  getCurrentUserMock: vi.fn()
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));

import { GET } from "./route";

describe("list active recruiter links", () => {
  const companyUser = { id: "company-user-1", role: "COMPANY", isActive: true };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(companyUser);
    prismaMock.company.findUnique.mockResolvedValue({ id: "company-1" });
    prismaMock.recruiterLink.findMany.mockResolvedValue([
      {
        id: "link-1",
        createdAt: new Date("2026-10-01T12:00:00.000Z"),
        recruiter: { fullName: "Ana Recruiter", email: "ana@example.com", isActive: true }
      }
    ]);
  });

  it("returns active links scoped to the authenticated company", async () => {
    const response = await GET();

    expect(response.status).toBe(200);
    expect(prismaMock.recruiterLink.findMany).toHaveBeenCalledWith({
      where: { companyId: "company-1", active: true },
      select: {
        id: true,
        createdAt: true,
        recruiter: { select: { fullName: true, email: true, isActive: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    await expect(response.json()).resolves.toMatchObject({
      links: [{ id: "link-1", recruiter: { fullName: "Ana Recruiter", email: "ana@example.com" } }]
    });
  });

  it("rejects users who are not companies", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "candidate-1", role: "CANDIDATE", isActive: true });

    const response = await GET();

    expect(response.status).toBe(401);
    expect(prismaMock.company.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.recruiterLink.findMany).not.toHaveBeenCalled();
  });

  it("rejects inactive companies or missing company records", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ ...companyUser, isActive: false });

    const response = await GET();

    expect(response.status).toBe(403);
    expect(prismaMock.recruiterLink.findMany).not.toHaveBeenCalled();
  });
  it("explicitly rejects POST mutations and runs the origin guard first", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://acessavagas.example/api/company/recruiter-links", {
      method: "POST",
      headers: { origin: "https://attacker.example" }
    });

    const response = await POST(request as never);

    expect(response.status).toBe(403);
    expect(getCurrentUserMock).not.toHaveBeenCalled();
    expect(prismaMock.recruiterLink.findMany).not.toHaveBeenCalled();
  });

  it("returns method-not-allowed for same-origin POST because the endpoint is read-only", async () => {
    const { POST } = await import("./route");
    const request = new Request("https://acessavagas.example/api/company/recruiter-links", {
      method: "POST",
      headers: { origin: "https://acessavagas.example" }
    });

    const response = await POST(request as never);

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET");
    expect(getCurrentUserMock).not.toHaveBeenCalled();
    expect(prismaMock.recruiterLink.findMany).not.toHaveBeenCalled();
  });

});
