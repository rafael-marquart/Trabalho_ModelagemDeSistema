import { brazilianStates } from "@/lib/candidate-profile/options";

export const jobStatuses = ["DRAFT", "OPEN", "PAUSED", "CLOSED"] as const;
export type JobStatusValue = (typeof jobStatuses)[number];
export const jobStatusLabels: Record<JobStatusValue, string> = {
  DRAFT: "Rascunho", OPEN: "Publicada", PAUSED: "Pausada", CLOSED: "Encerrada"
};

export const jobModalities = ["PRESENCIAL", "HIBRIDO", "REMOTO"] as const;
export type JobModalityValue = (typeof jobModalities)[number];
export const jobModalityLabels: Record<JobModalityValue, string> = {
  PRESENCIAL: "Presencial", HIBRIDO: "Híbrido", REMOTO: "Remoto"
};

export { brazilianStates };

// Professional areas offered in the job editor and as a search filter (SPEC-008, OPEN-036; list pending confirmation, OPEN-091).
export const professionalAreas = [
  "Administração", "Atendimento ao cliente", "Comercial e vendas", "Comunicação e marketing", "Educação", "Engenharia",
  "Finanças e contabilidade", "Jurídico", "Logística e operações", "Recursos humanos", "Saúde", "Tecnologia da informação", "Outra"
] as const;
export type ProfessionalArea = (typeof professionalAreas)[number];

export const TEXT_LIMITS = { title: 160, description: 5000, requirements: 5000, city: 120, address: 200 } as const;

// Fields that define the conditions of the opportunity; locked once applications exist (OPEN-022).
export const conditionFields = [
  "title", "description", "requirements", "modality", "professionalArea", "locationCity", "locationState", "locationAddress",
  "accessibility", "technicalCriteria", "deadline", "salaryMin", "salaryMax"
] as const;

export type JobAction = "publish" | "pause" | "reopen" | "close";
export const jobActions: readonly JobAction[] = ["publish", "pause", "reopen", "close"];

// Allowed transitions between the four states of the baseline; closed is final.
export const transitions: Record<JobAction, { from: readonly JobStatusValue[]; to: JobStatusValue }> = {
  publish: { from: ["DRAFT"], to: "OPEN" },
  pause: { from: ["OPEN"], to: "PAUSED" },
  reopen: { from: ["PAUSED"], to: "OPEN" },
  close: { from: ["OPEN", "PAUSED"], to: "CLOSED" }
};
