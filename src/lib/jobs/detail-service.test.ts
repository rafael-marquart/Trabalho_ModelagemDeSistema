import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, analyzeMock, infraMock } = vi.hoisted(() => ({ prismaMock: { job: { findFirst: vi.fn() } }, analyzeMock: vi.fn(), infraMock: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/compatibility/service", () => ({ loadCandidateContext: vi.fn().mockResolvedValue({}), analyzeWithContext: analyzeMock }));
const { appResultMock } = vi.hoisted(() => ({ appResultMock: vi.fn() }));
vi.mock("@/lib/applications/service", () => ({ findBlockingApplication: vi.fn().mockResolvedValue(null), findApplicationResult: appResultMock }));
vi.mock("@/lib/company-infrastructure/service", () => ({ getCompanyInfrastructure: infraMock, categoryLabel: (code: string) => code }));
vi.mock("@/lib/public-rating/service", () => ({ getPublicRating: vi.fn().mockResolvedValue({ available: false, total: 0 }) }));
import { getJobDetailForCandidate } from "./detail-service";

const row = (over: Record<string, unknown> = {}) => ({
  id: "job-1", companyId: "company-secret", createdByUserId: "creator-secret", status: "OPEN", origin: "OWN", title: "Analista", description: "Descrição", requirements: "",
  modality: "PRESENCIAL", professionalArea: "", locationCity: "", locationState: "", locationAddress: "", deadline: new Date("2999-12-31T00:00:00Z"),
  salaryMin: null, salaryMax: null, accessibility: { RAMPS: "PRESENT" }, technicalCriteria: {}, publishedAt: new Date(), closedAt: null, createdAt: new Date(), updatedAt: new Date(),
  company: { tradeName: "", legalName: "Empresa X" }, ...over
});

describe("job detail for a candidate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    infraMock.mockResolvedValue({ companyId: "company-secret", updatedAt: null, items: [{ code: "RAMPS", category: "PHYSICAL_ACCESS", label: "Rampas de acesso", status: "NOT_INFORMED", note: "" }] });
    analyzeMock.mockResolvedValue({ status: "COMPLETE", score: 80, missing: [] });
  });
  it("shows only published own jobs, never drafts", async () => {
    prismaMock.job.findFirst.mockResolvedValue(null);
    expect(await getJobDetailForCandidate("cand", "job-1")).toBeNull();
    expect(prismaMock.job.findFirst.mock.calls[0][0].where).toEqual({ id: "job-1", origin: "OWN", status: { in: ["OPEN", "PAUSED", "CLOSED"] } });
  });
  it("marks missing data as not informed and exposes no internal identifiers", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row());
    const detail = await getJobDetailForCandidate("cand", "job-1");
    expect(detail).toMatchObject({ requirements: "Não informados", salary: "Não informada", location: "Não informada", professionalArea: "Não informada", companyName: "Empresa X" });
    expect(detail?.jobAccessibility.find(item => item.label === "Elevadores")?.statusLabel).toBe("Não informado");
    expect(JSON.stringify(detail)).not.toMatch(/company-secret|creator-secret/);
    expect(detail?.action.allowed).toBe(true);
  });
  it("does not analyze closed or paused jobs and blocks the next step", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "CLOSED" }));
    const detail = await getJobDetailForCandidate("cand", "job-1");
    expect(analyzeMock).not.toHaveBeenCalled();
    expect(detail).toMatchObject({ compatibility: null, availability: { label: "Encerrada" }, action: { allowed: false } });
  });
  it("keeps showing the result registered with the application after the job closes, without recalculating", async () => {
    prismaMock.job.findFirst.mockResolvedValue(row({ status: "CLOSED" }));
    appResultMock.mockResolvedValueOnce({ appliedAt: "2026-10-31T15:00:00.000Z", result: { status: "COMPLETE", score: 77 } });
    const detail = await getJobDetailForCandidate("cand", "job-1");
    expect(analyzeMock).not.toHaveBeenCalled();
    expect(appResultMock).toHaveBeenCalledWith("cand", "job-1");
    expect(detail).toMatchObject({ compatibility: { score: 77 }, compatibilityFromApplication: "2026-10-31T15:00:00.000Z" });
  });
});
