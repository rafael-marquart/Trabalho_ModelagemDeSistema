// RB-38/RB-39 (docs/Fluxos e Estados/estados-trilha.md): the only moves a recruiter may make in the selection funnel.
// Cancelling (to CANCELADA) is the candidate's own action and belongs to SPEC-012.
export type Stage = "INSCRITO" | "TRIAGEM" | "ENTREVISTA" | "FINALISTA" | "CONTRATADO" | "RECUSADA" | "CANCELADA";

export const RECRUITER_TRANSITIONS: Record<Stage, Stage[]> = {
  INSCRITO: ["TRIAGEM"],
  TRIAGEM: ["ENTREVISTA", "RECUSADA"],
  ENTREVISTA: ["FINALISTA", "RECUSADA"],
  FINALISTA: ["CONTRATADO", "RECUSADA"],
  CONTRATADO: [], RECUSADA: [], CANCELADA: []
};

export const FUNNEL_ORDER: Stage[] = ["INSCRITO", "TRIAGEM", "ENTREVISTA", "FINALISTA", "CONTRATADO", "RECUSADA", "CANCELADA"];

export const canMove = (from: Stage, to: Stage) => RECRUITER_TRANSITIONS[from]?.includes(to) ?? false;

/** Kind of decision recorded in the history (OPEN-056). */
export const moveKind = (to: Stage) => (to === "RECUSADA" ? "REJECTED" : to === "CONTRATADO" ? "HIRED" : "ADVANCED");

export const kindLabels: Record<string, string> = {
  SUBMITTED: "Candidatura registrada", ADVANCED: "Avanço de etapa", REJECTED: "Candidatura recusada", HIRED: "Contratação registrada", CANCELLED: "Cancelada pelo candidato"
};

/** Text on the recruiter's button for each destination. */
export const actionLabels: Partial<Record<Stage, string>> = {
  TRIAGEM: "Mover para Triagem", ENTREVISTA: "Mover para Entrevista", FINALISTA: "Mover para Finalista", CONTRATADO: "Registrar contratação", RECUSADA: "Recusar candidatura"
};

/**
 * OPEN-054: "known blocking issues" for a move. The baseline does not define any issue type yet, so none is reported;
 * this is the single place to add them (OPEN-092). No stage-specific criteria are invented.
 */
export function knownBlockingIssues(): string[] {
  return [];
}
