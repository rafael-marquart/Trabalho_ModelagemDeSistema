import { z } from "zod";

import { educationLevels, educationStatuses, languageLevels, type EducationEntry, type LanguageEntry } from "@/lib/candidate-profile/options";

export type { EducationEntry, LanguageEntry };

const educationEntrySchema = z.object({
  level: z.enum(educationLevels),
  course: z.string().trim().min(1, "Informe o curso ou a área.").max(160),
  institution: z.string().trim().max(160).default(""),
  status: z.enum([...educationStatuses, ""] as const).default("")
}).strict();
const languageEntrySchema = z.object({
  language: z.string().trim().min(1, "Informe o idioma.").max(80),
  level: z.enum([...languageLevels, ""] as const).default("")
}).strict();

export const profileListSchema = z.array(z.string().trim().min(1)).default([]);
const optionCodeListSchema = z.array(z.string().trim().min(1)).default([])
  .refine((codes) => new Set(codes).size === codes.length, "Não repita opções do catálogo.");
const professionalLinksSchema = z.array(z.string().trim().url("Informe um endereço de link válido.")
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol;
      return protocol === "https:" || protocol === "http:";
    } catch {
      return false;
    }
  }, "Use um link iniciado por http:// ou https://")).default([]);

export const candidateProfileInputSchema = z.object({
  education: z.array(educationEntrySchema).default([]),
  skills: profileListSchema,
  languages: z.array(languageEntrySchema).default([]),
  professionalExperience: profileListSchema,
  courses: profileListSchema,
  certifications: profileListSchema,
  professionalLinks: professionalLinksSchema,
  accessibilityDeclaration: z.enum(["NOT_INFORMED", "NO_NEEDS_DECLARED", "NEEDS_DECLARED"]),
  accessibilityNeeds: profileListSchema,
  accessibilityNeedOptionCodes: optionCodeListSchema,
  essentialAccessibilityResources: profileListSchema
}).strict().superRefine((profile, context) => {
  const hasAccessibilityNeed = profile.accessibilityNeedOptionCodes.length > 0 || profile.accessibilityNeeds.length > 0;
  if (profile.accessibilityDeclaration === "NEEDS_DECLARED" && !hasAccessibilityNeed) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["accessibilityNeeds"],
      message: "Selecione ao menos uma opção do catálogo ou descreva uma necessidade não contemplada."
    });
  }
  if (profile.accessibilityDeclaration === "NO_NEEDS_DECLARED" && hasAccessibilityNeed) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["accessibilityNeeds"],
      message: "Remova as necessidades informadas ou altere a declaração."
    });
  }
  if (profile.accessibilityDeclaration === "NOT_INFORMED" && hasAccessibilityNeed) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["accessibilityNeeds"],
      message: "Altere a declaração para indicar as necessidades informadas."
    });
  }
});

export function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

// Profiles saved before education/languages were structured stored "campo — campo" text.
// Read them best-effort so no saved information is lost; new saves always write objects.
function legacyEducation(text: string): EducationEntry {
  const parts = text.replace("Ensino superior — graduação", "Ensino superior (graduação)")
    .split(" — ").map((part) => part.trim()).filter(Boolean);
  const level = educationLevels.find((candidate) => candidate === parts[0]);
  if (!level || parts.length < 2) return { level: "Outro", course: text.trim().slice(0, 160), institution: "", status: "" };
  const lastIsStatus = parts.length >= 3 ? educationStatuses.find((candidate) => candidate === parts[parts.length - 1]) : undefined;
  const middle = parts.slice(1, lastIsStatus ? -1 : undefined);
  return {
    level, course: middle[0].slice(0, 160), institution: middle.slice(1).join(" - ").slice(0, 160), status: lastIsStatus ?? ""
  };
}

function legacyLanguage(text: string): LanguageEntry {
  const separator = text.lastIndexOf(" — ");
  if (separator > 0) {
    const level = languageLevels.find((candidate) => candidate === text.slice(separator + 3).trim());
    if (level) return { language: text.slice(0, separator).trim().slice(0, 80), level };
  }
  return { language: text.trim().slice(0, 80), level: "" };
}

export function toEducationList(value: unknown): EducationEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): EducationEntry[] => {
    if (typeof item === "string") return item.trim() ? [legacyEducation(item)] : [];
    const parsed = educationEntrySchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

export function toLanguageList(value: unknown): LanguageEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): LanguageEntry[] => {
    if (typeof item === "string") return item.trim() ? [legacyLanguage(item)] : [];
    const parsed = languageEntrySchema.safeParse(item);
    return parsed.success ? [parsed.data] : [];
  });
}

// jsonb does not preserve key order, so compare stored and submitted values with sorted keys.
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, nested) => nested && typeof nested === "object" && !Array.isArray(nested)
    ? Object.fromEntries(Object.entries(nested as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)))
    : nested);
}

export function toProfileResponse(profile: {
  education: unknown; skills: unknown; languages: unknown; professionalExperience: unknown;
  courses: unknown; certifications: unknown; professionalLinks: unknown;
  accessibilityDeclaration: "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
  accessibilityNeeds: unknown; accessibilityNeedOptionCodes: unknown;
  essentialAccessibilityResources: unknown; updatedAt: Date;
}) {
  return {
    education: toEducationList(profile.education), skills: toStringList(profile.skills),
    languages: toLanguageList(profile.languages), professionalExperience: toStringList(profile.professionalExperience),
    courses: toStringList(profile.courses), certifications: toStringList(profile.certifications),
    professionalLinks: toStringList(profile.professionalLinks),
    accessibilityDeclaration: profile.accessibilityDeclaration,
    accessibilityNeeds: toStringList(profile.accessibilityNeeds),
    accessibilityNeedOptionCodes: toStringList(profile.accessibilityNeedOptionCodes),
    essentialAccessibilityResources: toStringList(profile.essentialAccessibilityResources),
    updatedAt: profile.updatedAt.toISOString()
  };
}
