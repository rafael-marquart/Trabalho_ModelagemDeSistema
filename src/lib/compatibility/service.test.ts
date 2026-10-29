import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    job: { findFirst: vi.fn() }, candidateProfile: { findUnique: vi.fn() },
    accessibilityNeedOption: { findMany: vi.fn() }, compatibilityResult: { create: vi.fn() }
  }
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
import { analyzeCandidateForJob, reproduce } from "./service";
import { analyze } from "./engine";

const accessibility = { RAMPS: "PRESENT", ELEVATORS: "ABSENT" };
const jobRow = (over: Record<string, unknown> = {}) => ({
  id: "job-1", companyId: "c", createdByUserId: "u", status: "OPEN", origin: "OWN", title: "t", description: "d", requirements: "r", modality: "PRESENCIAL",
  locationCity: "São Paulo", locationState: "SP", locationAddress: "Av. Paulista, 1000", deadline: new Date("2999-12-31T00:00:00.000Z"),
  salaryMin: null, salaryMax: null, accessibility, technicalCriteria: { skills: ["sql"] }, publishedAt: null, closedAt: null, createdAt: new Date(), updatedAt: new Date(), ...over
});
const profile = (over: Record<string, unknown> = {}) => ({
  accessibilityDeclaration: "NEEDS_DECLARED", accessibilityNeedOptionCodes: ["A01"], accessibilityNeeds: [], education: [], languages: [],
  professionalExperience: [], courses: ["Curso de SQL"], certifications: [],
  workPreferences: { modalities: ["Presencial"], city: "São Paulo", state: "SP", address: "Rua Secreta, 55", transportMode: "Ônibus" }, ...over
});

describe("compatibility service", () => {
  const estimator = { estimate: vi.fn() };
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.job.findFirst.mockResolvedValue(jobRow());
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile());
    prismaMock.accessibilityNeedOption.findMany.mockResolvedValue([{ code: "A01", name: "Rampa", isMandatory: false }]);
    prismaMock.compatibilityResult.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: "r1", executedAt: new Date("2026-10-28T00:00:00Z"), jobId: "job-1", ...data }));
    estimator.estimate.mockResolvedValue({ status: "OK", minutes: 25, mode: "Ônibus", method: "HERE" });
  });
  const run = (extra: Record<string, unknown> = {}) => analyzeCandidateForJob({ userId: "cand-1", jobId: "job-1", ...extra }, { estimator, now: new Date("2026-10-28T12:00:00Z") });

  it("only analyzes published jobs that are still open", async () => {
    prismaMock.job.findFirst.mockResolvedValue(null);
    expect(await run()).toEqual({ error: { status: 404, message: "Vaga não disponível para análise." } });
    prismaMock.job.findFirst.mockResolvedValue(jobRow({ deadline: new Date("2020-01-01T00:00:00Z") }));
    expect("error" in (await run())).toBe(true);
    expect(prismaMock.job.findFirst).toHaveBeenCalledWith({ where: { id: "job-1", status: "OPEN", origin: "OWN" } });
    expect(prismaMock.compatibilityResult.create).not.toHaveBeenCalled();
  });

  it("rejects an unknown transport mode", async () => {
    expect(await run({ transportMode: "Foguete" })).toEqual({ error: { status: 400, message: "Meio de transporte inválido." } });
  });

  it("estimates travel with the profile transport mode and stores the result without addresses", async () => {
    const result = await run();
    expect("view" in result && result.view.status).toBe("COMPLETE");
    expect(estimator.estimate).toHaveBeenCalledWith({ origin: "Rua Secreta, 55, São Paulo, SP, Brasil", destination: "Av. Paulista, 1000, São Paulo, SP, Brasil", mode: "Ônibus" });
    const data = prismaMock.compatibilityResult.create.mock.calls[0][0].data;
    expect(data.rulesVersion).toBe("SPEC-007/1");
    expect(JSON.stringify(data.snapshot)).not.toContain("Rua Secreta");
    expect(JSON.stringify(data.snapshot)).not.toContain("Paulista");
  });

  it("lets a specific job override the default transport mode without changing the profile", async () => {
    await run({ transportMode: "Carro" });
    expect(estimator.estimate).toHaveBeenCalledWith(expect.objectContaining({ mode: "Carro" }));
  });

  it("does not call the provider for remote jobs or when a critical barrier already decides", async () => {
    prismaMock.job.findFirst.mockResolvedValue(jobRow({ modality: "REMOTO" }));
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile({ workPreferences: { modalities: ["Remoto"] } }));
    await run();
    prismaMock.job.findFirst.mockResolvedValue(jobRow({ accessibility: { RAMPS: "ABSENT" } }));
    prismaMock.accessibilityNeedOption.findMany.mockResolvedValue([{ code: "A01", name: "Rampa", isMandatory: true }]);
    const locked = await run();
    expect("view" in locked && locked.view.status).toBe("INCOMPATIBLE");
    expect(estimator.estimate).not.toHaveBeenCalled();
  });

  it("reports insufficient data when addresses are missing, without calling the provider", async () => {
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile({ workPreferences: { modalities: ["Presencial"], city: "", state: "", address: "", transportMode: "Ônibus" } }));
    const result = await run();
    expect("view" in result && result.view.status).toBe("INSUFFICIENT_DATA");
    expect(estimator.estimate).not.toHaveBeenCalled();
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile());
    prismaMock.job.findFirst.mockResolvedValue(jobRow({ locationAddress: "" }));
    expect("view" in (await run()) && estimator.estimate.mock.calls.length).toBe(0);
  });

  it("treats a provider failure as insufficient data, never as zero travel", async () => {
    estimator.estimate.mockResolvedValue({ status: "UNAVAILABLE", reason: "O limite de uso do serviço de rotas foi atingido." });
    const result = await run();
    expect("view" in result && result.view.status).toBe("INSUFFICIENT_DATA");
    expect("view" in result && result.view.score).toBeNull();
  });

  it("reproduces the stored result from the snapshot with the same rules", async () => {
    await run();
    const data = prismaMock.compatibilityResult.create.mock.calls[0][0].data;
    expect(reproduce(data.snapshot)).toEqual(data.outcome);
    expect(analyze(data.snapshot)).toEqual(data.outcome);
  });

  it("creates a new record on every run instead of overwriting", async () => {
    await run(); await run();
    expect(prismaMock.compatibilityResult.create).toHaveBeenCalledTimes(2);
  });
});
