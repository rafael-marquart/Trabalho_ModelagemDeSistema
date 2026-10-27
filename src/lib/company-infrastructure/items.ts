// Structured, extensible questionnaire (OPEN-017/OPEN-018). New items are added here with a stable code;
// stored answers are keyed by code, so no schema change is needed to extend the questionnaire.
export const infrastructureCategories = [
  { code: "PHYSICAL_ACCESS", label: "Acesso físico e circulação" },
  { code: "FACILITIES", label: "Instalações" },
  { code: "COMMUNICATION", label: "Comunicação e orientação" },
  { code: "TECHNOLOGY", label: "Recursos tecnológicos" },
  { code: "POLICIES", label: "Políticas e práticas inclusivas" }
] as const;

export type InfrastructureCategoryCode = (typeof infrastructureCategories)[number]["code"];

export type InfrastructureItem = {
  code: string;
  category: InfrastructureCategoryCode;
  label: string;
  description: string;
  // Required items block saving while unanswered (UC-07). Decision of 27/10/2026: the six UC-07 items are required.
  required: boolean;
};

export const infrastructureItems: readonly InfrastructureItem[] = [
  { code: "RAMPS", category: "PHYSICAL_ACCESS", label: "Rampas de acesso", description: "Rampas que permitem entrar e circular nos ambientes de trabalho sem degraus.", required: true },
  { code: "ELEVATORS", category: "PHYSICAL_ACCESS", label: "Elevadores", description: "Elevadores acessíveis para os andares usados pela equipe e por visitantes.", required: true },
  { code: "ADAPTED_RESTROOMS", category: "FACILITIES", label: "Banheiros adaptados", description: "Banheiros com espaço e barras de apoio para pessoas com deficiência.", required: true },
  { code: "SIGNAGE", category: "COMMUNICATION", label: "Sinalização acessível", description: "Placas e indicações que podem ser percebidas por pessoas com diferentes deficiências.", required: true },
  { code: "SCREEN_READERS", category: "TECHNOLOGY", label: "Leitores de tela", description: "Leitores de tela instalados ou permitidos nos computadores e sistemas de trabalho.", required: true },
  { code: "INCLUSIVE_POLICIES", category: "POLICIES", label: "Políticas inclusivas", description: "Políticas ou práticas formais de inclusão e de adaptação do trabalho.", required: true }
];

export const infrastructureStatuses = ["PRESENT", "ABSENT", "NOT_INFORMED"] as const;
export type InfrastructureStatus = (typeof infrastructureStatuses)[number];
export const statusLabels: Record<InfrastructureStatus, string> = {
  PRESENT: "Presente",
  ABSENT: "Ausente",
  NOT_INFORMED: "Não informado"
};
export const NOTE_MAX_LENGTH = 300;
