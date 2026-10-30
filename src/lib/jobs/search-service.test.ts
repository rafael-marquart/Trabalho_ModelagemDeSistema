import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, analyzeMock } = vi.hoisted(() => ({ prismaMock: { job: { findMany: vi.fn() } }, analyzeMock: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/compatibility/service", () => ({ loadCandidateContext: vi.fn().mockResolvedValue({}), analyzeWithContext: analyzeMock }));
import { searchJobsForCandidate } from "./search-service";
import { searchQuerySchema } from "./search";

const row = (id: string, over: Record<string, unknown> = {}) => ({
  id, title: `Vaga ${id}`, description: "d", modality: "REMOTO", professionalArea: "", locationCity: "", locationState: "", publishedAt: new Date("2026-10-01T00:00:00Z"),
  accessibility: { RAMPS: "PRESENT" }, company: { tradeName: "", legalName: "Empresa X" }, ...over
});
const view = (status: string, score: number | null) => ({ status, score, id: "r", executedAt: "", rulesVersion: "SPEC-007/1", jobId: "", dimensions: {}, missing: [], factors: [] });

describe("candidate job search", () => {
  beforeEach(() => vi.clearAllMocks());
  it("lists only open own jobs within the deadline", async () => {
    prismaMock.job.findMany.mockResolvedValue([]);
    await searchJobsForCandidate("c1", searchQuerySchema.parse({}), { now: new Date("2026-10-29T12:00:00Z") });
    expect(prismaMock.job.findMany.mock.calls[0][0].where).toEqual({ status: "OPEN", origin: "OWN", OR: [{ deadline: null }, { deadline: { gte: new Date("2026-10-29T00:00:00.000Z") } }] });
  });
  it("hides critical-barrier jobs, orders by score and keeps insufficient analyses after scored ones", async () => {
    prismaMock.job.findMany.mockResolvedValue([row("a"), row("b"), row("c"), row("d")]);
    analyzeMock.mockImplementation(async (_u: string, _c: unknown, job: { id: string }) => ({ a: view("COMPLETE", 60), b: view("INCOMPATIBLE", null), c: view("INSUFFICIENT_DATA", null), d: view("COMPLETE", 90) })[job.id]);
    const result = await searchJobsForCandidate("c1", searchQuerySchema.parse({}));
    expect(result.jobs.map(job => job.id)).toEqual(["d", "a", "c"]);
    expect(result.hiddenIncompatible).toBe(1);
    expect(result.jobs[0].companyName).toBe("Empresa X");
    expect(result.jobs[0].accessibility.find(item => item.code === "RAMPS")?.statusLabel).toBeTruthy();
    expect(result.jobs[0].accessibility.find(item => item.code === "ELEVATORS")?.status).toBe("NOT_INFORMED");
  });
  it("analyzes only the jobs that match the search and filters", async () => {
    prismaMock.job.findMany.mockResolvedValue([row("a", { title: "Analista" }), row("b", { title: "Recepcionista", modality: "PRESENCIAL" })]);
    analyzeMock.mockResolvedValue(view("COMPLETE", 70));
    const result = await searchJobsForCandidate("c1", searchQuerySchema.parse({ q: "analista" }));
    expect(analyzeMock).toHaveBeenCalledTimes(1);
    expect(result.jobs.map(job => job.id)).toEqual(["a"]);
    expect(result.facets.modalidade).toEqual(["PRESENCIAL", "REMOTO"]);
  });
});
