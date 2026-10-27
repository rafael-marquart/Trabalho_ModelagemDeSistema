import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock, readFileMock, unlinkMock } = vi.hoisted(() => ({
  prismaMock: { candidateProfileDocument: { findFirst: vi.fn(), delete: vi.fn() } },
  getCurrentUserMock: vi.fn(),
  readFileMock: vi.fn(),
  unlinkMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("node:fs/promises", () => ({ readFile: readFileMock, unlink: unlinkMock }));

import { DELETE, GET } from "./route";

describe("candidate document item API", () => {
  const candidate = { id: "candidate-1", role: "CANDIDATE" };
  const document = {
    id: "document-1", candidateProfileId: "profile-1", storedName: "safe-random-id",
    originalName: "certificação.pdf", mimeType: "application/pdf", sizeBytes: 5,
    candidateProfile: { userId: "candidate-1" }
  };
  const context = { params: Promise.resolve({ id: "document-1" }) };

  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(candidate);
    prismaMock.candidateProfileDocument.findFirst.mockResolvedValue(document);
    prismaMock.candidateProfileDocument.delete.mockResolvedValue(document);
    readFileMock.mockResolvedValue(Buffer.from("%PDF-"));
    unlinkMock.mockResolvedValue(undefined);
  });

  it("denies unauthenticated and non-candidate downloads", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);
    expect((await GET(new Request("https://example.test"), context)).status).toBe(401);
    getCurrentUserMock.mockResolvedValueOnce({ id: "recruiter-1", role: "RECRUITER" });
    expect((await GET(new Request("https://example.test"), context)).status).toBe(401);
    expect(prismaMock.candidateProfileDocument.findFirst).not.toHaveBeenCalled();
  });

  it("returns not found when the document does not belong to the current candidate", async () => {
    prismaMock.candidateProfileDocument.findFirst.mockResolvedValueOnce(null);
    const response = await GET(new Request("https://example.test"), context);
    expect(response.status).toBe(404);
    expect(readFileMock).not.toHaveBeenCalled();
    expect(prismaMock.candidateProfileDocument.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "document-1", candidateProfile: { userId: "candidate-1" } }
    }));
  });

  it("serves downloads with private, no-sniff headers and an international filename", async () => {
    const response = await GET(new Request("https://example.test"), context);
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Content-Disposition")).toContain("filename*=UTF-8''certifica%C3%A7%C3%A3o.pdf");
  });

  it("does not delete documents belonging to another candidate", async () => {
    prismaMock.candidateProfileDocument.findFirst.mockResolvedValueOnce(null);
    const response = await DELETE(new Request("https://example.test", { method: "DELETE" }), context);
    expect(response.status).toBe(404);
    expect(prismaMock.candidateProfileDocument.delete).not.toHaveBeenCalled();
    expect(unlinkMock).not.toHaveBeenCalled();
  });

  it("rejects cross-origin deletion before database access", async () => {
    const response = await DELETE(new Request("https://example.test", {
      method: "DELETE", headers: { origin: "https://attacker.example" }
    }), context);
    expect(response.status).toBe(403);
    expect(prismaMock.candidateProfileDocument.findFirst).not.toHaveBeenCalled();
  });

  it("deletes metadata and then best-effort removes the private file", async () => {
    const response = await DELETE(new Request("https://example.test", { method: "DELETE" }), context);
    expect(response.status).toBe(200);
    expect(prismaMock.candidateProfileDocument.delete).toHaveBeenCalledWith({ where: { id: "document-1" } });
    expect(unlinkMock).toHaveBeenCalledWith(expect.stringContaining("safe-random-id"));
    await expect(response.json()).resolves.toEqual({ ok: true });
  });
});
