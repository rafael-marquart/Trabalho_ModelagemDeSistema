import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    job: { findFirst: vi.fn() }, candidateProfile: { findUnique: vi.fn() },
    accessibilityNeedOption: { findMany: vi.fn() }, compatibilityResult: { create: vi.fn(), findFirst: vi.fn() },
    travelTimeCache: { findUnique: vi.fn(), upsert: vi.fn() }
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
    prismaMock.compatibilityResult.findFirst.mockResolvedValue(null);
    prismaMock.travelTimeCache.findUnique.mockResolvedValue(null);
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
    expect(estimator.estimate).toHaveBeenCalledWith(expect.objectContaining({ origin: "Rua Secreta, 55, São Paulo, SP, Brasil", destination: "Av. Paulista, 1000, São Paulo, SP, Brasil", mode: "Ônibus", departureTime: expect.stringMatching(/T07:00:00-03:00$/) }));
    const data = prismaMock.compatibilityResult.create.mock.calls[0][0].data;
    expect(data.rulesVersion).toBe("SPEC-007/2");
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

  // D-01: keep the history meaningful when results are computed automatically by the search.
  const stored = () => prismaMock.compatibilityResult.create.mock.calls.at(-1)![0].data;
  const asRow = (data: Record<string, unknown>) => ({ id: "r-prev", executedAt: new Date("2026-10-28T00:00:00Z"), jobId: "job-1", ...data });

  it("reuses the latest result without calling HERE or writing when the inputs are unchanged", async () => {
    await run();
    prismaMock.compatibilityResult.findFirst.mockResolvedValue(asRow(stored()));
    estimator.estimate.mockClear(); prismaMock.compatibilityResult.create.mockClear();
    const again = await run();
    expect("view" in again && again.view.id).toBe("r-prev");
    expect(estimator.estimate).not.toHaveBeenCalled();
    expect(prismaMock.compatibilityResult.create).not.toHaveBeenCalled();
  });

  it("writes a new record when the profile, the job or the transport mode changes", async () => {
    await run();
    prismaMock.compatibilityResult.findFirst.mockResolvedValue(asRow(stored()));
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile({ courses: ["Curso de Excel"] }));
    await run();
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile({ workPreferences: { ...profile().workPreferences, address: "Rua Nova, 1" } }));
    await run();
    await run({ transportMode: "Carro" });
    prismaMock.job.findFirst.mockResolvedValue(jobRow({ accessibility: { RAMPS: "ABSENT" } }));
    await run();
    expect(prismaMock.compatibilityResult.create).toHaveBeenCalledTimes(5);
    expect(new Set(prismaMock.compatibilityResult.create.mock.calls.map(call => call[0].data.inputHash)).size).toBe(5);
  });

  it("retries after a transient provider failure but does not duplicate an identical outcome", async () => {
    estimator.estimate.mockResolvedValue({ status: "UNAVAILABLE", reason: "O limite de uso do serviço de rotas foi atingido." });
    await run();
    expect(stored().snapshot.travel.transient).toBe(true);
    prismaMock.compatibilityResult.findFirst.mockResolvedValue(asRow(stored()));
    estimator.estimate.mockClear(); prismaMock.compatibilityResult.create.mockClear();
    await run();
    expect(estimator.estimate).toHaveBeenCalledTimes(1);
    expect(prismaMock.compatibilityResult.create).not.toHaveBeenCalled();
    estimator.estimate.mockResolvedValue({ status: "OK", minutes: 25, mode: "Ônibus", method: "HERE" });
    await run();
    expect(prismaMock.compatibilityResult.create).toHaveBeenCalledTimes(1);
  });

  it("does not retry a permanent travel problem such as an address that cannot be located", async () => {
    estimator.estimate.mockResolvedValue({ status: "UNAVAILABLE", reason: "Não foi possível localizar o endereço da vaga.", permanent: true });
    await run();
    expect(stored().snapshot.travel.transient).toBeUndefined();
    prismaMock.compatibilityResult.findFirst.mockResolvedValue(asRow(stored()));
    estimator.estimate.mockClear();
    await run();
    expect(estimator.estimate).not.toHaveBeenCalled();
  });

  it("estimates a trip once and reuses the saved time, without storing addresses in the saved entry", async () => {
    await run();
    const saved = prismaMock.travelTimeCache.upsert.mock.calls[0][0];
    expect(saved.create).toMatchObject({ minutes: 25, method: "HERE" });
    expect(JSON.stringify(saved)).not.toContain("Secreta");
    prismaMock.travelTimeCache.findUnique.mockResolvedValue({ key: saved.where.key, minutes: 25, method: "HERE" });
    prismaMock.candidateProfile.findUnique.mockResolvedValue(profile({ courses: ["Curso de SQL", "Curso de Excel"] }));
    estimator.estimate.mockClear();
    const again = await run();
    expect(estimator.estimate).not.toHaveBeenCalled();
    expect("view" in again && again.view.dimensions.D.components.find(c => c.label === "Deslocamento")?.detail).toContain("7h em dia útil");
  });

  it("does not save a failed estimate", async () => {
    estimator.estimate.mockResolvedValue({ status: "UNAVAILABLE", reason: "Indisponível." });
    await run();
    expect(prismaMock.travelTimeCache.upsert).not.toHaveBeenCalled();
  });
});
