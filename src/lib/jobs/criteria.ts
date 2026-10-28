import { z } from "zod";
import { educationLevels, languageLevels } from "@/lib/candidate-profile/options";

// Technical criteria defined by the company for a job (SPEC-007, dimension T). Only criteria the recruiter fills in are applicable.
export const rankedEducationLevels = educationLevels.filter((level) => level !== "Curso livre" && level !== "Outro");

export type TechnicalCriteria = {
  skills: string[];
  experience: string[];
  educationMinLevel: (typeof rankedEducationLevels)[number] | "";
  languages: { language: string; level: (typeof languageLevels)[number] }[];
};
export const emptyCriteria: TechnicalCriteria = { skills: [], experience: [], educationMinLevel: "", languages: [] };

const term = z.string().trim().min(1).max(80);
const termList = (limit: number) => z.array(term).max(limit, `Use até ${limit} itens.`)
  .refine((values) => new Set(values.map((value) => value.toLocaleLowerCase("pt-BR"))).size === values.length, "Não repita itens.");

export const technicalCriteriaSchema = z.object({
  skills: termList(30).default([]),
  experience: termList(15).default([]),
  educationMinLevel: z.enum([...rankedEducationLevels, ""] as const).default(""),
  languages: z.array(z.object({ language: term, level: z.enum(languageLevels) }).strict()).max(8, "Use até 8 idiomas.")
    .refine((values) => new Set(values.map((value) => value.language.toLocaleLowerCase("pt-BR"))).size === values.length, "Não repita idiomas.").default([])
}).strict();

/** Reads stored JSON defensively so older rows and hand-edited data never break the calculation. */
export function normalizeCriteria(stored: unknown): TechnicalCriteria {
  const parsed = technicalCriteriaSchema.safeParse(stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {});
  return parsed.success ? parsed.data : { ...emptyCriteria };
}

export function hasCriteria(criteria: TechnicalCriteria) {
  return criteria.skills.length > 0 || criteria.experience.length > 0 || criteria.educationMinLevel !== "" || criteria.languages.length > 0;
}
