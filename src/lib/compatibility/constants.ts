import { educationLevels, languageLevels } from "@/lib/candidate-profile/options";

export const RULES_VERSION = "SPEC-007/2";

// General weights (RB-03 to RB-05) and internal weights (SPEC-007 section 6.1).
export const WEIGHTS = { A: 0.5, T: 0.3, D: 0.2 } as const;
export const TECHNICAL_WEIGHTS = { skills: 0.4, experience: 0.3, education: 0.2, languages: 0.1 } as const;
export const DISPLACEMENT_WEIGHTS = { modality: 0.6, travel: 0.4 } as const;

// Fixed map between the candidate need catalog (OPEN-008) and the six items a job declares (SPEC-005/SPEC-004).
// Needs absent from this map cannot be compared and are reported as insufficient data (never presumed compatible).
export const NEED_TO_JOB_ITEM: Record<string, string> = {
  A01: "RAMPS", A02: "ELEVATORS", A04: "ADAPTED_RESTROOMS", A06: "SIGNAGE", T01: "SCREEN_READERS"
};

export const educationRank: Record<string, number> = Object.fromEntries(
  educationLevels.filter((level) => level !== "Curso livre" && level !== "Outro").map((level, index) => [level, index + 1])
);
export const languageRank: Record<string, number> = Object.fromEntries(languageLevels.map((level, index) => [level, index + 1]));

// Travel-time bands (OPEN-088).
export function travelBandScore(minutes: number): number {
  if (minutes <= 30) return 100;
  if (minutes <= 60) return 75;
  if (minutes <= 90) return 50;
  return 25;
}

export const dimensionLabels = { A: "Acessibilidade", T: "Perfil técnico", D: "Modalidade e deslocamento" } as const;
