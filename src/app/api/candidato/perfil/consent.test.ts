// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

// OPEN-100: accessibility data needs the candidate's specific consent (LGPD art. 11, I); withdrawing it erases the data.
const { prismaMock, tx, getCurrentUserMock } = vi.hoisted(() => {
  const tx = {
    candidateProfile: { findUnique: vi.fn(), upsert: vi.fn(), updateMany: vi.fn() },
    accessibilityNeedOption: { findMany: vi.fn() },
    consentRecord: { findFirst: vi.fn(), create: vi.fn() },
    auditEvent: { create: vi.fn() }
  };
  return { tx, getCurrentUserMock: vi.fn(), prismaMock: { ...tx, $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx)) } };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: getCurrentUserMock }));

import { PUT, GET } from "./route";
import { DELETE } from "./consentimento-acessibilidade/route";

const blank = {
  education: [], languages: [], professionalExperience: [], courses: [], certifications: [], professionalLinks: [],
  accessibilityDeclaration: "NOT_INFORMED", accessibilityNeeds: [], accessibilityNeedOptionCodes: [], mandatoryNeedOptionCodes: [],
  essentialAccessibilityResources: []
};
const withNeeds = { ...blank, accessibilityDeclaration: "NEEDS_DECLARED", accessibilityNeedOptionCodes: ["A01"] };
const put = (body: Record<string, unknown>) => PUT(new Request("https://example.test/api/candidato/perfil", {
  method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body)
}));
const granted = { granted: true, createdAt: new Date("2026-11-05T12:00:00Z") };

describe("consent for accessibility data", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentUserMock.mockResolvedValue({ id: "cand", role: "CANDIDATE", fullName: "Ana", email: "ana@example.com" });
    tx.candidateProfile.findUnique.mockResolvedValue(null);
    tx.candidateProfile.upsert.mockImplementation(async ({ create }: { create: Record<string, unknown> }) => ({ ...blank, ...create, updatedAt: new Date() }));
    tx.accessibilityNeedOption.findMany.mockResolvedValue([{ code: "A01", isActive: true }]);
    tx.consentRecord.findFirst.mockResolvedValue(null);
  });

  it("refuses to save accessibility needs or resources without the authorization, saving nothing", async () => {
    for (const body of [withNeeds, { ...blank, essentialAccessibilityResources: ["Rampa"] }, { ...withNeeds, accessibilityConsent: false }]) {
      const response = await put(body);
      expect(response.status).toBe(400);
      expect((await response.json()).issues.accessibilityConsent[0]).toContain("autorização");
    }
    expect(tx.candidateProfile.upsert).not.toHaveBeenCalled();
    expect(tx.consentRecord.create).not.toHaveBeenCalled();
  });

  it("records the consent, with the text version, in the same transaction that saves the needs", async () => {
    tx.consentRecord.findFirst.mockResolvedValueOnce(null).mockResolvedValue(granted);
    const response = await put({ ...withNeeds, accessibilityConsent: true });
    expect(response.status).toBe(200);
    expect(tx.consentRecord.create).toHaveBeenCalledWith({ data: { userId: "cand", kind: "ACCESSIBILITY_DATA", version: "2026-11-09", granted: true } });
    expect(tx.auditEvent.create.mock.calls.map((call) => call[0].data.eventType)).toContain("CANDIDATE_ACCESSIBILITY_CONSENT_GRANTED");
    expect((await response.json()).accessibilityConsent).toEqual({ active: true, at: "2026-11-05T12:00:00.000Z" });
  });

  it("does not ask again while the consent is active, and needs none to save a profile without accessibility data", async () => {
    tx.consentRecord.findFirst.mockResolvedValue(granted);
    expect((await put(withNeeds)).status).toBe(200);
    tx.consentRecord.findFirst.mockResolvedValue(null);
    expect((await put({ ...blank, accessibilityDeclaration: "NO_NEEDS_DECLARED" })).status).toBe(200);
    expect(tx.consentRecord.create).not.toHaveBeenCalled();
  });

  it("tells the profile whether the consent is active", async () => {
    tx.consentRecord.findFirst.mockResolvedValue({ granted: false, createdAt: new Date() });
    expect((await (await GET()).json()).accessibilityConsent).toEqual({ active: false, at: null });
  });

  it("withdrawal erases the accessibility data and records it, in one transaction", async () => {
    const response = await DELETE(new Request("https://example.test/api/candidato/perfil/consentimento-acessibilidade", { method: "DELETE" }));
    expect(response.status).toBe(200);
    expect(tx.candidateProfile.updateMany).toHaveBeenCalledWith({ where: { userId: "cand" }, data: {
      accessibilityDeclaration: "NOT_INFORMED", accessibilityNeeds: [], accessibilityNeedOptionCodes: [], mandatoryNeedOptionCodes: [], essentialAccessibilityResources: []
    } });
    expect(tx.consentRecord.create).toHaveBeenCalledWith({ data: { userId: "cand", kind: "ACCESSIBILITY_DATA", version: "2026-11-09", granted: false } });
    expect(tx.auditEvent.create.mock.calls[0][0].data.eventType).toBe("CANDIDATE_ACCESSIBILITY_CONSENT_REVOKED");
  });

  it("withdrawal only by the candidate, from this site", async () => {
    getCurrentUserMock.mockResolvedValueOnce({ id: "co", role: "COMPANY" });
    expect((await DELETE(new Request("https://example.test/x", { method: "DELETE" }))).status).toBe(401);
    expect((await DELETE(new Request("https://example.test/x", { method: "DELETE", headers: { origin: "https://evil.example" } }))).status).toBe(403);
    expect(tx.candidateProfile.updateMany).not.toHaveBeenCalled();
  });
});
