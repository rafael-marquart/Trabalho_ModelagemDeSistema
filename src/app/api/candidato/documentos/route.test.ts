// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock } = vi.hoisted(() => ({
  prismaMock: {
    $transaction: vi.fn(), auditEvent: { create: vi.fn() },
    candidateProfile: { upsert: vi.fn(), findUnique: vi.fn() },
    candidateProfileDocument: { create: vi.fn(), findMany: vi.fn() }
  },
  getCurrentUserMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));

import { GET, POST } from "./route";
import { MAX_DOCUMENT_BYTES } from "@/lib/candidate-profile/documents";

describe("candidate documents collection API", () => {
  const candidate = { id: "candidate-1", role: "CANDIDATE" };
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue(candidate);
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<unknown>) => callback(prismaMock));
    prismaMock.auditEvent.create.mockResolvedValue({});
    prismaMock.candidateProfile.upsert.mockResolvedValue({ id: "profile-1" });
    prismaMock.candidateProfileDocument.findMany.mockResolvedValue([]);
    prismaMock.candidateProfileDocument.create.mockResolvedValue({
      id: "document-1", category: "COURSE", displayName: "Currículo", originalName: "curriculo.pdf",
      mimeType: "application/pdf", sizeBytes: 5, createdAt: new Date("2026-01-01T00:00:00.000Z")
    });
  });

  it("denies unauthenticated and non-candidate list access", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
    getCurrentUserMock.mockResolvedValueOnce({ id: "recruiter-1", role: "RECRUITER" });
    expect((await GET()).status).toBe(401);
    expect(prismaMock.candidateProfileDocument.findMany).not.toHaveBeenCalled();
  });

  it("rejects invalid metadata and unsupported file extensions", async () => {
    const invalidMetadata = new FormData();
    invalidMetadata.set("category", "COURSE");
    invalidMetadata.set("displayName", "");
    invalidMetadata.set("file", new File(["%PDF-"], "valid.pdf", { type: "application/pdf" }));
    expect((await POST(new Request("https://example.test/api/candidato/documentos", { method: "POST", body: invalidMetadata }))).status).toBe(400);

    const invalidExtension = new FormData();
    invalidExtension.set("category", "COURSE");
    invalidExtension.set("displayName", "Arquivo");
    invalidExtension.set("file", new File(["%PDF-"], "arquivo.exe", { type: "application/pdf" }));
    expect((await POST(new Request("https://example.test/api/candidato/documentos", { method: "POST", body: invalidExtension }))).status).toBe(400);
    expect(prismaMock.candidateProfileDocument.create).not.toHaveBeenCalled();
  });

  it("rejects a file whose extension does not match its content", async () => {
    const form = new FormData();
    form.set("category", "COURSE");
    form.set("displayName", "Documento");
    form.set("file", new File(["not a PDF"], "documento.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("https://example.test/api/candidato/documentos", { method: "POST", body: form }));
    expect(response.status).toBe(400);
    expect(prismaMock.candidateProfileDocument.create).not.toHaveBeenCalled();
  });

  it("rejects uploads larger than 4 MB (serverless request limit) before writing anything", async () => {
    expect(MAX_DOCUMENT_BYTES).toBe(4 * 1024 * 1024);
    const form = new FormData();
    form.set("category", "COURSE");
    form.set("displayName", "Documento");
    form.set("file", new File([new Uint8Array(4 * 1024 * 1024 + 1)], "documento.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("https://example.test/api/candidato/documentos", { method: "POST", body: form }));
    expect(response.status).toBe(400);
    expect(prismaMock.candidateProfileDocument.create).not.toHaveBeenCalled();
  });

  it("rejects cross-origin upload requests before reading the form or writing files", async () => {
    const form = new FormData();
    form.set("category", "COURSE");
    form.set("displayName", "Documento");
    form.set("file", new File(["%PDF-"], "documento.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("https://example.test/api/candidato/documentos", {
      method: "POST", headers: { origin: "https://attacker.example" }, body: form
    }));
    expect(response.status).toBe(403);
    expect(prismaMock.candidateProfileDocument.create).not.toHaveBeenCalled();
  });

  it("stores a valid PDF in the database, in the same transaction as its metadata, and returns only metadata", async () => {
    const form = new FormData();
    form.set("category", "COURSE");
    form.set("displayName", "Certificado de curso");
    form.set("file", new File(["%PDF-"], "certificado.pdf", { type: "application/pdf" }));
    const response = await POST(new Request("https://example.test/api/candidato/documentos", { method: "POST", body: form }));
    expect(response.status).toBe(201);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    const data = prismaMock.candidateProfileDocument.create.mock.calls[0][0].data;
    expect(data).toMatchObject({ candidateProfileId: "profile-1", category: "COURSE", sizeBytes: 5, mimeType: "application/pdf" });
    expect(Buffer.from(data.content.create.bytes).toString()).toBe("%PDF-");
    const body = await response.json();
    expect(body.document).toMatchObject({ id: "document-1", mimeType: "application/pdf" });
    expect(JSON.stringify(body)).not.toContain("storedName");
    expect(prismaMock.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorUserId: "candidate-1", eventType: "CANDIDATE_PROFILE_DOCUMENT_ADDED", metadata: { category: "COURSE" }
      })
    });
    expect(JSON.stringify(prismaMock.auditEvent.create.mock.calls)).not.toContain("Certificado de curso");
  });
});
