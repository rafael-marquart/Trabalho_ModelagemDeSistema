import type { EducationEntry, ExperienceEntry, LanguageEntry, WorkPreferences } from "@/lib/candidate-profile/options";
import type { TechnicalCriteria } from "@/lib/jobs/criteria";

export type CandidateNeed = { code: string; name: string; mandatory: boolean };
export type CandidateInput = {
  accessibilityDeclaration: "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
  needs: CandidateNeed[];
  hasFreeTextNeeds: boolean;
  education: EducationEntry[];
  languages: LanguageEntry[];
  experience: ExperienceEntry[];
  courses: string[];
  certifications: string[];
  skills: string[];
  workPreferences: WorkPreferences;
};
export type JobInput = {
  modality: "PRESENCIAL" | "HIBRIDO" | "REMOTO" | "";
  accessibility: Record<string, string>;
  criteria: TechnicalCriteria;
};
// Travel is resolved outside the pure engine (HERE adapter); the engine only reads its outcome.
export type TravelInput =
  | { status: "NOT_REQUESTED" }
  // departure: reference trip used (peak hour); absent in results computed before that rule.
  | { status: "OK"; minutes: number; mode: string; method: string; departure?: string }
  // transient: the provider failed (quota, outage); the same inputs may succeed later, so the result is not reused.
  | { status: "UNAVAILABLE"; reason: string; transient?: boolean };

export type AnalysisInput = { candidate: CandidateInput; job: JobInput; travel: TravelInput };

export type DimensionCode = "A" | "T" | "D";
export type MissingItem = { dimension: DimensionCode; item: string; action: string };
export type Component = { label: string; score: number | null; detail: string };
export type Dimension = {
  status: "EVALUATED" | "INSUFFICIENT" | "NOT_APPLICABLE";
  score: number | null;
  components: Component[];
};
export type Barrier = { needCode: string; needName: string; jobItem: string };

export type AnalysisOutcome = {
  status: "INCOMPATIBLE" | "INSUFFICIENT_DATA" | "COMPLETE";
  score: number | null;
  critical: { applied: boolean; barriers: Barrier[] };
  dimensions: Record<DimensionCode, Dimension>;
  appliedWeights: Partial<Record<DimensionCode, number>> | null;
  missing: MissingItem[];
  factors: string[];
};
