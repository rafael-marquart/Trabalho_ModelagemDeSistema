// Shared by the server pages and the client list of SPEC-012/016 (kept outside "use client" modules on purpose).

// Candidate-facing colours: in progress and approved in green, refused in red, cancelled in grey (prototypes of SPEC-012).
export const candidatePill: Record<string, string> = {
  INSCRITO: "status-active", TRIAGEM: "status-active", ENTREVISTA: "status-active", FINALISTA: "status-active",
  CONTRATADO: "status-accepted", RECUSADA: "status-danger", CANCELADA: "status-muted"
};
export const dateOnly = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });
export const initialsOf = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("") || "AV";
