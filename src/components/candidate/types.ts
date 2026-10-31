// Shapes returned by /api/candidato/vagas (SPEC-008) and consumed by the candidate area.
export type CompatDimension = { status: "EVALUATED" | "INSUFFICIENT" | "NOT_APPLICABLE"; score: number | null; components: { label: string; score: number | null; detail: string }[] };
export type Compatibility = {
  id: string; status: "COMPLETE" | "INCOMPATIBLE" | "INSUFFICIENT_DATA"; score: number | null; executedAt: string;
  factors: string[]; missing: { dimension: string; item: string; action: string; responsible?: "CANDIDATE" | "COMPANY" | "PLATFORM" }[];
  dimensions: Record<"A" | "T" | "D", CompatDimension>; appliedWeights: Partial<Record<"A" | "T" | "D", number>> | null;
  critical?: { applied: boolean; barriers: { needCode: string; needName: string; jobItem: string }[]; pending?: { needCode: string; needName: string; jobItem: string }[] };
};
export type SearchJob = {
  id: string; title: string; companyName: string; modality: string; professionalArea: string; location: string; publishedAt: string | null;
  accessibility: { code: string; label: string; status: string; statusLabel: string }[];
  compatibility: Compatibility;
};
export type Facets = { cargo: string[]; area: string[]; modalidade: string[]; local: string[] };
export type SearchResult = { jobs: SearchJob[]; page: number; pages: number; total: number; hiddenIncompatible: number; facets: Facets };
