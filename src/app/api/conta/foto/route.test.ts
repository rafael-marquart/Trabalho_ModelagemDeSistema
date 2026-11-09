// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// OPEN-101: profile photo of candidates and recruiters.
const { prismaMock, tx, getCurrentUserMock, resolveJobActorMock } = vi.hoisted(() => {
  const tx = { userPhoto: { upsert: vi.fn(), deleteMany: vi.fn() }, auditEvent: { create: vi.fn() } };
  return {
    tx, getCurrentUserMock: vi.fn(), resolveJobActorMock: vi.fn(),
    prismaMock: { userPhoto: { findUnique: vi.fn() }, application: { findFirst: vi.fn() }, $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)) }
  };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
vi.mock("@/lib/jobs/access", () => ({ resolveJobActor: resolveJobActorMock }));

import { DELETE, GET, HEAD, POST } from "./route";
import { GET as applicationPhoto } from "../../candidaturas/[id]/foto/route";
import { detectImageType, MAX_PHOTO_BYTES } from "@/lib/photos";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0]);
const WEBP = new TextEncoder().encode("RIFF\u0000\u0000\u0000\u0000WEBPVP8 ");
const upload = (bytes: Uint8Array<ArrayBuffer>, headers: Record<string, string> = {}) => {
  const body = new FormData();
  body.append("photo", new File([bytes], "foto.jpg", { type: "image/jpeg" }));
  return POST(new Request("https://example.test/api/conta/foto", { method: "POST", body, headers }));
};

describe("profile photo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "cand", role: "CANDIDATE" });
  });

  it("recognises JPEG, PNG and WebP by their bytes, not by the declared type", () => {
    expect([detectImageType(JPEG), detectImageType(PNG), detectImageType(WEBP)]).toEqual(["image/jpeg", "image/png", "image/webp"]);
    expect(detectImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("%PDF-1.7"))).toBeNull();
  });

  it("saves the photo of a candidate or recruiter, with the detected type, and records it", async () => {
    for (const role of ["CANDIDATE", "RECRUITER"]) {
      getCurrentUserMock.mockResolvedValueOnce({ id: "u1", role });
      expect((await upload(PNG)).status).toBe(200);
    }
    expect(tx.userPhoto.upsert.mock.calls[0][0]).toMatchObject({ where: { userId: "u1" }, create: { userId: "u1", mimeType: "image/png" } });
    expect(tx.auditEvent.create.mock.calls[0][0].data.eventType).toBe("PROFILE_PHOTO_UPDATED");
  });

  it("refuses other files, oversized images, other account types and other sites", async () => {
    const svg = await upload(new TextEncoder().encode("<svg></svg>"));
    expect([svg.status, (await svg.json()).message]).toEqual([400, "Use uma imagem JPG, PNG ou WebP."]);
    const big = new Uint8Array(MAX_PHOTO_BYTES + 1); big.set(JPEG);
    expect((await upload(big)).status).toBe(400);
    for (const role of ["COMPANY", "ADMIN"]) {
      getCurrentUserMock.mockResolvedValueOnce({ id: "x", role });
      expect((await upload(JPEG)).status).toBe(401);
    }
    expect((await upload(JPEG, { origin: "https://evil.example" })).status).toBe(403);
    expect(tx.userPhoto.upsert).not.toHaveBeenCalled();
  });

  it("serves the own photo privately, answers HEAD and 404 without one, and removes it", async () => {
    prismaMock.userPhoto.findUnique.mockResolvedValueOnce({ bytes: JPEG, mimeType: "image/jpeg" });
    const own = await GET();
    expect([own.status, own.headers.get("content-type"), own.headers.get("cache-control")]).toEqual([200, "image/jpeg", "private, no-cache"]);
    prismaMock.userPhoto.findUnique.mockResolvedValueOnce(null);
    expect((await HEAD()).status).toBe(404);
    tx.userPhoto.deleteMany.mockResolvedValueOnce({ count: 1 });
    expect((await DELETE(new Request("https://example.test/api/conta/foto", { method: "DELETE" }))).status).toBe(200);
    expect(tx.userPhoto.deleteMany).toHaveBeenCalledWith({ where: { userId: "cand" } });
    expect(tx.auditEvent.create.mock.calls[0][0].data.eventType).toBe("PROFILE_PHOTO_REMOVED");
  });

  it("the company sees a candidate's photo only through an application to one of its jobs", async () => {
    const context = { params: Promise.resolve({ id: "app-1" }) };
    resolveJobActorMock.mockResolvedValue({ companyId: "co-1", user: { id: "co-user" } });
    prismaMock.application.findFirst.mockResolvedValueOnce({ candidate: { photo: { bytes: JPEG, mimeType: "image/jpeg" } } });
    expect((await applicationPhoto(new Request("https://example.test"), context)).status).toBe(200);
    expect(prismaMock.application.findFirst.mock.calls[0][0].where).toEqual({ id: "app-1", job: { companyId: "co-1" } });
    prismaMock.application.findFirst.mockResolvedValueOnce(null);
    expect((await applicationPhoto(new Request("https://example.test"), context)).status).toBe(404);
    resolveJobActorMock.mockResolvedValueOnce({ error: new Response(null, { status: 401 }) });
    expect((await applicationPhoto(new Request("https://example.test"), context)).status).toBe(404);
  });
});
