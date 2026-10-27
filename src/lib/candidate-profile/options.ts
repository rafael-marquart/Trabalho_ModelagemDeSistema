// Shared option lists and entry types for the candidate profile. Kept free of server and
// validation dependencies so the browser bundle can import it.
export const educationLevels = [
  "Ensino fundamental", "Ensino médio", "Ensino técnico", "Ensino superior (graduação)",
  "Pós-graduação", "Mestrado", "Doutorado", "Curso livre", "Outro"
] as const;
export const educationStatuses = ["Concluído", "Em andamento", "Trancado", "Incompleto"] as const;
export const languageLevels = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"] as const;

export type EducationEntry = {
  level: (typeof educationLevels)[number];
  course: string;
  institution: string;
  status: (typeof educationStatuses)[number] | "";
};
export type LanguageEntry = {
  language: string;
  level: (typeof languageLevels)[number] | "";
};
