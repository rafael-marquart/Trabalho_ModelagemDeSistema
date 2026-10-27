import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, getCurrentUserMock } = vi.hoisted(() => ({
  prismaMock: { candidateProfile: { upsert: vi.fn(), findUnique: vi.fn() }, $transaction: vi.fn() },
  getCurrentUserMock: vi.fn()
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));
import { GET, PUT } from "./route";

const blank = {
  education: [], skills: [], languages: [], professionalExperience: [], courses: [], certifications: [],
  professionalLinks: [], accessibilityDeclaration: "NOT_INFORMED", accessibilityNeeds: [],
  essentialAccessibilityResources: [], updatedAt: new Date("2026-10-26T00:00:00.000Z")
};
describe("candidate profile API", () => {
  const candidate = { id: "candidate-1", role: "CANDIDATE", fullName: "Pessoa Candidata", email: "pessoa@example.com" };
  const tx = { candidateProfile: { findUnique: vi.fn(), upsert: vi.fn() }, auditEvent: { create: vi.fn() } };
  beforeEach(() => {
    vi.clearAllMocks(); getCurrentUserMock.mockResolvedValue(candidate);
    prismaMock.candidateProfile.findUnique.mockResolvedValue(null);
    prismaMock.$transaction.mockImplementation(async (callback: (transaction: typeof tx) => unknown) => callback(tx));
    tx.candidateProfile.findUnique.mockResolvedValue(null); tx.candidateProfile.upsert.mockResolvedValue(blank);
    tx.auditEvent.create.mockResolvedValue({});
  });
  it("denies unauthenticated and non-candidate reads", async () => {
    getCurrentUserMock.mockResolvedValueOnce(null);
    expect((await GET()).status).toBe(401);
    getCurrentUserMock.mockResolvedValueOnce({ ...candidate, role: "RECRUITER" });
    expect((await GET()).status).toBe(401);
    expect(prismaMock.candidateProfile.findUnique).not.toHaveBeenCalled();
  });
  it("returns account identity without duplicate profile fields", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ profile: { fullName: candidate.fullName, email: candidate.email } });
  });
  it("rejects unsupported declaration values", async () => {
    const response = await PUT(new Request("https://example.test/api/candidato/perfil", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...blank, accessibilityDeclaration: "UNKNOWN" })
    }));
    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
  it("requires a selected catalog option or free-text need when needs are declared", async () => {
    const response = await PUT(new Request("https://example.test/api/candidato/perfil", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        education: [], skills: [], languages: [], professionalExperience: [], courses: [],
        certifications: [], professionalLinks: [], accessibilityDeclaration: "NEEDS_DECLARED",
        accessibilityNeeds: [], accessibilityNeedOptionCodes: [], essentialAccessibilityResources: []
      })
    }));
    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
  it("rejects a professional link without a valid HTTP or HTTPS URL", async () => {
    const response = await PUT(new Request("https://example.test/api/candidato/perfil", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        education: [], skills: [], languages: [], professionalExperience: [], courses: [],
        certifications: [], professionalLinks: ["javascript:alert(1)"],
        accessibilityDeclaration: "NOT_INFORMED", accessibilityNeeds: [],
        accessibilityNeedOptionCodes: [], essentialAccessibilityResources: []
      })
    }));
    expect(response.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
  it("rejects cross-origin writes before database access", async () => {
    const response = await PUT(new Request("https://example.test/api/candidato/perfil", {
      method: "PUT", headers: { "content-type": "application/json", origin: "https://attacker.example" },
      body: JSON.stringify({ ...blank, updatedAt: undefined })
    }));
    expect(response.status).toBe(403);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
  it("supports progressive saves and audits category names without sensitive values", async () => {
    tx.candidateProfile.upsert.mockResolvedValueOnce({ ...blank, skills: ["Comunicação"], accessibilityNeeds: ["sensível"] });
    const response = await PUT(new Request("https://example.test/api/candidato/perfil", {
      method: "PUT", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        education: [], skills: ["Comunicação"], languages: [], professionalExperience: [], courses: [],
        certifications: [], professionalLinks: [], accessibilityDeclaration: "NEEDS_DECLARED",
        accessibilityNeeds: ["sensível"], essentialAccessibilityResources: []
      })
    }));
    expect(response.status).toBe(200);
    expect(tx.auditEvent.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ eventType: "CANDIDATE_PROFILE_CREATED", metadata: expect.objectContaining({ changedCategories: expect.arrayContaining(["skills", "accessibilityNeeds"]) }) })
    }));
    expect(JSON.stringify(tx.auditEvent.create.mock.calls)).not.toContain("sensível");
  });
  const put = (body: Record<string, unknown>) => {
    const { updatedAt: _ignored, ...payload } = body;
    return PUT(new Request("https://example.test/api/candidato/perfil", {
      method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ accessibilityNeedOptionCodes: [], ...payload })
    }));
  };
  it("accepts structured education and languages and rejects unknown levels", async () => {
    const entry = { level: "Ensino médio", course: "Geral", institution: "Escola X", status: "Concluído" };
    expect((await put({ ...blank, education: [entry], languages: [{ language: "Inglês", level: "Avançado" }] })).status).toBe(200);
    expect((await put({ ...blank, education: [{ ...entry, level: "Pós-doc" }] })).status).toBe(400);
    expect((await put({ ...blank, education: ["Ensino médio — Geral"] })).status).toBe(400);
    expect((await put({ ...blank, languages: [{ language: "", level: "Básico" }] })).status).toBe(400);
  });
  it("reads legacy text entries as structured objects and does not flag them as changed when resaved", async () => {
    const stored = {
      ...blank, education: ["Ensino superior — graduação — Sistemas — IF — Concluído"], languages: ["Inglês — Avançado"],
      accessibilityNeedOptionCodes: []
    };
    prismaMock.candidateProfile.findUnique.mockResolvedValueOnce(stored);
    const read = await (await GET()).json();
    expect(read.profile.education).toEqual([{ level: "Ensino superior (graduação)", course: "Sistemas", institution: "IF", status: "Concluído" }]);
    expect(read.profile.languages).toEqual([{ language: "Inglês", level: "Avançado" }]);
    tx.candidateProfile.findUnique.mockResolvedValueOnce(stored);
    tx.candidateProfile.upsert.mockResolvedValueOnce(stored);
    await put({ ...blank, education: read.profile.education, languages: read.profile.languages, accessibilityNeedOptionCodes: [] });
    const events = tx.auditEvent.create.mock.calls.map((call) => JSON.stringify(call[0]));
    expect(events.join()).not.toContain('"education"');
    expect(events.join()).not.toContain('"languages"');
  });
});
