// Shared option lists and entry types for the candidate profile. Kept free of server and
// validation dependencies so the browser bundle can import it.
export const educationLevels = [
  "Ensino fundamental", "Ensino médio", "Ensino técnico", "Ensino superior (graduação)",
  "Pós-graduação", "Mestrado", "Doutorado", "Curso livre", "Outro"
] as const;
export const educationStatuses = ["Concluído", "Em andamento", "Trancado", "Incompleto"] as const;
export const languageLevels = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"] as const;
// Languages offered in the profile and in the job editor; "Outro" opens a free-text field.
export const languageChoices = ["Inglês", "Espanhol", "Francês", "Alemão", "Italiano", "Português", "Libras", "Outro"] as const;

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
export type ExperienceEntry = {
  role: string;
  company: string;
  period: string;
};

export const workModalities = ["Presencial", "Híbrido", "Remoto"] as const;
export const transportModes = ["Caminhada", "Bicicleta", "Carro", "Ônibus", "Metrô/trem"] as const;
export const brazilianStates = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
] as const;

// Candidate preferences used later by the compatibility calculation (SPEC-007); all fields are optional.
export type WorkPreferences = {
  modalities: (typeof workModalities)[number][];
  city: string;
  state: (typeof brazilianStates)[number] | "";
  address: string;
  transportMode: (typeof transportModes)[number] | "";
};
export const emptyWorkPreferences: WorkPreferences = { modalities: [], city: "", state: "", address: "", transportMode: "" };
