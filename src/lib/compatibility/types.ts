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
  | { status: "UNAVAILABLE"; reason: string; transient?: boolean; responsible?: Responsible };

export type AnalysisInput = { candidate: CandidateInput; job: JobInput; travel: TravelInput };

export type DimensionCode = "A" | "T" | "D";
// responsible: who can supply the missing data (the candidate in the profile, the company in the job, or the platform/service).
export type Responsible = "CANDIDATE" | "COMPANY" | "PLATFORM";
export type MissingItem = { dimension: DimensionCode; item: string; action: string; responsible?: Responsible };
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
  // pending: indispensable needs whose resource the job did not inform; eligibility is not concluded (OPEN-046). Absent in older results.
  critical: { applied: boolean; barriers: Barrier[]; pending?: Barrier[] };
  dimensions: Record<DimensionCode, Dimension>;
  appliedWeights: Partial<Record<DimensionCode, number>> | null;
  missing: MissingItem[];
  factors: string[];
};
