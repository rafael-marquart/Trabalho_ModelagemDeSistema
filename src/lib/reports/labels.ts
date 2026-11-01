// SPEC-019/020 wording shown to people.
export const categoryLabels = {
  ACCESSIBILITY_INCOMPATIBILITY: "Possível incompatibilidade de acessibilidade",
  FALSE_INCLUSION: "Possível falsa inclusão"
} as const;
export const categoryHints = {
  ACCESSIBILITY_INCOMPATIBILITY: "A vaga ou o processo não oferecem a acessibilidade declarada ou necessária.",
  FALSE_INCLUSION: "A vaga se apresenta como inclusiva, mas a prática indica o contrário."
} as const;
// OPEN-077: the simple states shown to the reporter (and used internally).
export const reportStatusLabels = { RECEBIDA: "Recebida", EM_ANALISE: "Em análise", AGUARDANDO_INFORMACOES: "Aguardando informações", CONCLUIDA: "Concluída" } as const;
export const decisionLabels = { PROCEDENTE: "Procedente", PARCIALMENTE_PROCEDENTE: "Parcialmente procedente", IMPROCEDENTE: "Improcedente", INCONCLUSIVA: "Inconclusiva" } as const;
export type ReportCategoryCode = keyof typeof categoryLabels;
export type ReportStatusCode = keyof typeof reportStatusLabels;
export type DecisionCode = keyof typeof decisionLabels;
export const reportPill: Record<string, string> = { RECEBIDA: "status-pending", EM_ANALISE: "status-pending", AGUARDANDO_INFORMACOES: "status-pending", CONCLUIDA: "status-active" };
