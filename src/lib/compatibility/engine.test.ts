import { describe, expect, it } from "vitest";
import { emptyCriteria } from "@/lib/jobs/criteria";
import { analyze, roundHalfUp } from "./engine";
import type { AnalysisInput, CandidateInput, JobInput } from "./types";

const candidate = (over: Partial<CandidateInput> = {}): CandidateInput => ({
  accessibilityDeclaration: "NEEDS_DECLARED",
  needs: [{ code: "A01", name: "Rampa ou acesso sem escadas", mandatory: false }],
  hasFreeTextNeeds: false, education: [{ level: "Ensino superior (graduação)", course: "Análise de Sistemas", institution: "", status: "Concluído" }],
  languages: [{ language: "Inglês", level: "Avançado" }], experience: [{ role: "Desenvolvedora Java", company: "Acme", period: "" }],
  courses: ["Curso de SQL"], certifications: [], skills: [],
  workPreferences: { modalities: ["Remoto"], city: "São Paulo", state: "SP", address: "", transportMode: "Metrô/trem" }, ...over
});
const job = (over: Partial<JobInput> = {}): JobInput => ({
  modality: "REMOTO", accessibility: { RAMPS: "PRESENT" },
  criteria: { ...emptyCriteria, skills: ["java", "sql"], educationMinLevel: "Ensino superior (graduação)", languages: [{ language: "Inglês", level: "Intermediário" }] }, ...over
});
const run = (c: CandidateInput, j: JobInput, travel: AnalysisInput["travel"] = { status: "NOT_REQUESTED" }) => analyze({ candidate: c, job: j, travel });

describe("compatibility engine", () => {
  it("applies the critical lock before any score (T-007-01, T-007-03)", () => {
    const outcome = run(candidate({ needs: [{ code: "A01", name: "Rampa", mandatory: true }] }), job({ accessibility: { RAMPS: "ABSENT" } }));
    expect(outcome.status).toBe("INCOMPATIBLE");
    expect(outcome.score).toBeNull();
    expect(outcome.critical.barriers).toEqual([{ needCode: "A01", needName: "Rampa", jobItem: "RAMPS" }]);
  });
  it("does not lock on a missing declaration or on a non-mandatory need (T-007-04)", () => {
    expect(run(candidate({ needs: [{ code: "A01", name: "Rampa", mandatory: true }] }), job({ accessibility: { RAMPS: "NOT_INFORMED" } })).status).toBe("INSUFFICIENT_DATA");
    const nonMandatory = run(candidate(), job({ accessibility: { RAMPS: "ABSENT" } }));
    expect(nonMandatory.critical.applied).toBe(false);
    expect(nonMandatory.dimensions.A.score).toBe(0);
  });
  it("computes S = 0.5 A + 0.3 T + 0.2 D with rounding only at the end (T-007-02)", () => {
    // A=100, T=100 (all criteria met), D: remote and preferred = 100
    const outcome = run(candidate(), job());
    expect(outcome.status).toBe("COMPLETE");
    expect(outcome.score).toBe(100);
    expect(outcome.appliedWeights).toEqual({ A: 0.5, T: 0.3, D: 0.2 });
  });
  it("weights the dimensions 50/30/20 when they differ", () => {
    // A=0 (ramp absent, not mandatory), T=100, D=100 -> 0*0.5 + 30 + 20 = 50
    expect(run(candidate(), job({ accessibility: { RAMPS: "ABSENT" } })).score).toBe(50);
  });
  it("is deterministic (T-007-06)", () => {
    expect(run(candidate(), job())).toEqual(run(candidate(), job()));
  });
  it("explains the result with factors (T-007-07)", () => {
    const outcome = run(candidate(), job());
    expect(outcome.factors.join(" ")).toContain("Acessibilidade: 100/100");
    expect(outcome.dimensions.T.components.map((c) => c.label)).toEqual(["Competências e conhecimentos", "Formação e escolaridade", "Idiomas"]);
  });

  describe("insufficient data (OPEN-033)", () => {
    it("asks for the accessibility declaration instead of presuming compatibility", () => {
      const outcome = run(candidate({ accessibilityDeclaration: "NOT_INFORMED", needs: [] }), job());
      expect(outcome.status).toBe("INSUFFICIENT_DATA");
      expect(outcome.score).toBeNull();
      expect(outcome.missing[0]).toMatchObject({ dimension: "A" });
    });
    it("treats needs the job cannot declare as insufficient, never as compatible", () => {
      const outcome = run(candidate({ needs: [{ code: "C01", name: "Interpretação em Libras", mandatory: false }] }), job());
      expect(outcome.status).toBe("INSUFFICIENT_DATA");
      expect(outcome.dimensions.A.components[0].score).toBeNull();
    });
    it("reports missing profile data for technical criteria without scoring zero (T-007-05)", () => {
      const outcome = run(candidate({ education: [], courses: [], experience: [], languages: [] }), job());
      expect(outcome.status).toBe("INSUFFICIENT_DATA");
      expect(outcome.missing.filter((m) => m.dimension === "T").length).toBeGreaterThanOrEqual(2);
    });
    it("needs work preferences to evaluate modality", () => {
      const outcome = run(candidate({ workPreferences: { modalities: [], city: "", state: "", address: "", transportMode: "" } }), job());
      expect(outcome.status).toBe("INSUFFICIENT_DATA");
      expect(outcome.missing.some((m) => m.dimension === "D")).toBe(true);
    });
  });

  describe("technical profile", () => {
    it("normalizes the internal weights over the applicable criteria only", () => {
      const outcome = run(candidate(), job({ criteria: { ...emptyCriteria, skills: ["java", "python"] } }));
      expect(outcome.dimensions.T.score).toBe(50); // only skills apply: 1 of 2
    });
    it("matches whole words, ignoring accents and case", () => {
      const o = run(candidate({ courses: ["Programação em Javascript"], experience: [], education: [] }), job({ criteria: { ...emptyCriteria, skills: ["Java"] } }));
      expect(o.dimensions.T.components[0].score).toBe(0);
    });
    it("scores education: meets 100, one level below 50, below that 0; in progress does not count", () => {
      const level = (status: "Concluído" | "Em andamento", l: "Ensino técnico" | "Ensino médio" | "Ensino superior (graduação)" = "Ensino superior (graduação)") => [{ level: l, course: "X", institution: "", status }];
      const criteria = { ...emptyCriteria, educationMinLevel: "Ensino superior (graduação)" as const };
      const score = (education: ReturnType<typeof level>) => run(candidate({ education }), job({ criteria })).dimensions.T.score;
      expect(score(level("Concluído"))).toBe(100);
      expect(score(level("Concluído", "Ensino técnico"))).toBe(50);
      expect(score(level("Concluído", "Ensino médio"))).toBe(0);
      expect(score(level("Em andamento"))).toBe(0);
    });
    it("scores languages by level and asks for a missing level", () => {
      const criteria = { ...emptyCriteria, languages: [{ language: "Inglês", level: "Fluente" as const }] };
      expect(run(candidate({ languages: [{ language: "Ingles", level: "Fluente" }] }), job({ criteria })).dimensions.T.score).toBe(100);
      expect(run(candidate({ languages: [{ language: "Inglês", level: "Avançado" }] }), job({ criteria })).dimensions.T.score).toBe(50);
      expect(run(candidate({ languages: [{ language: "Francês", level: "Fluente" }] }), job({ criteria })).dimensions.T.score).toBe(0);
      expect(run(candidate({ languages: [{ language: "Inglês", level: "" }] }), job({ criteria })).status).toBe("INSUFFICIENT_DATA");
    });
    it("derives competences from education, courses, certifications and experience", () => {
      const o = run(candidate({ education: [], courses: [], certifications: ["Certificação AWS"], experience: [{ role: "Analista de dados", company: "X", period: "" }] }),
        job({ criteria: { ...emptyCriteria, skills: ["aws", "dados"] } }));
      expect(o.dimensions.T.score).toBe(100);
    });
  });

  describe("distance and modality", () => {
    const onsite = job({ modality: "PRESENCIAL" });
    const onsiteCandidate = candidate({ workPreferences: { modalities: ["Presencial"], city: "São Paulo", state: "SP", address: "x", transportMode: "Ônibus" } });
    it.each([[20, 100], [30, 100], [31, 75], [60, 75], [61, 50], [90, 50], [91, 25], [200, 25]])("travel of %i min scores %i (T-007-09 to T-007-12)", (minutes, band) => {
      const outcome = run(onsiteCandidate, onsite, { status: "OK", minutes, mode: "Ônibus", method: "HERE" });
      expect(outcome.dimensions.D.score).toBeCloseTo(0.6 * 100 + 0.4 * band);
    });
    it("excludes travel for remote jobs and uses only the modality (T-007-13)", () => {
      const outcome = run(candidate(), job());
      expect(outcome.dimensions.D.score).toBe(100);
      expect(outcome.dimensions.D.components.map((c) => c.label)).toEqual(["Modalidade", "Deslocamento"]);
      expect(outcome.dimensions.D.components[1].score).toBeNull();
    });
    it("does not invent travel time when the estimate is unavailable (OPEN-033)", () => {
      const outcome = run(onsiteCandidate, onsite, { status: "UNAVAILABLE", reason: "Endereço da vaga não informado." });
      expect(outcome.status).toBe("INSUFFICIENT_DATA");
      expect(outcome.dimensions.D.score).toBeNull();
    });
    it("gives half credit when the modality only partly matches", () => {
      const o = run(candidate({ workPreferences: { modalities: ["Híbrido"], city: "", state: "", address: "", transportMode: "" } }), job());
      expect(o.dimensions.D.score).toBe(50);
      const none = run(candidate({ workPreferences: { modalities: ["Presencial"], city: "", state: "", address: "", transportMode: "" } }), job());
      expect(none.dimensions.D.score).toBe(0);
    });
  });

  describe("dimensions without applicable criteria", () => {
    it("excludes them and normalizes the remaining weights, saying so", () => {
      const outcome = run(candidate({ accessibilityDeclaration: "NO_NEEDS_DECLARED", needs: [] }), job({ criteria: emptyCriteria }));
      expect(outcome.status).toBe("COMPLETE");
      expect(outcome.appliedWeights).toEqual({ D: 1 });
      expect(outcome.score).toBe(100);
      expect(outcome.factors.join(" ")).toContain("normalizados");
    });
  });

  it("rounds half up", () => {
    expect(roundHalfUp(72.5)).toBe(73);
    expect(roundHalfUp(72.49)).toBe(72);
    expect(roundHalfUp(0.5)).toBe(1);
  });
});
