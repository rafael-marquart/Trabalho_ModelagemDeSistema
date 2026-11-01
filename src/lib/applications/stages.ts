// Funnel stage names shown to people (docs/Fluxos e Estados/estados-trilha.md).
export const stageLabels: Record<string, string> = {
  INSCRITO: "Inscrito", TRIAGEM: "Triagem", ENTREVISTA: "Entrevista", FINALISTA: "Finalista",
  CONTRATADO: "Contratado", RECUSADA: "Recusada", CANCELADA: "Cancelada"
};

// How the candidate reads the stage of their own application (SPEC-012/016, OPEN-051): the same official stage, in words
// about "a candidatura"; "Status" events may use general terms such as "Em andamento", "Entrevista" or "Aprovado".
export const candidateStageLabels: Record<string, string> = {
  INSCRITO: "Inscrita", TRIAGEM: "Em triagem", ENTREVISTA: "Em entrevista", FINALISTA: "Finalista",
  CONTRATADO: "Aprovada", RECUSADA: "Recusada", CANCELADA: "Cancelada"
};
