import { z } from "zod";

import {
  brazilianStates, educationLevels, educationStatuses, emptyWorkPreferences, languageLevels, transportModes, workModalities,
  type EducationEntry, type ExperienceEntry, type LanguageEntry, type WorkPreferences
} from "@/lib/candidate-profile/options";

export type { EducationEntry, ExperienceEntry, LanguageEntry, WorkPreferences };

const educationEntrySchema = z.object({
  level: z.enum(educationLevels),
  course: z.string().trim().min(1, "Informe o curso ou a área.").max(160),
  institution: z.string().trim().max(160).default(""),
  status: z.enum([...educationStatuses, ""] as const).default("")
}).strict();
const experienceEntrySchema = z.object({
  role: z.string().trim().min(1, "Informe o cargo.").max(120),
  company: z.string().trim().min(1, "Informe a empresa.").max(120),
  period: z.string().trim().max(80).default("")
}).strict();
const workPreferencesSchema = z.object({
  modalities: z.array(z.enum(workModalities)).default([])
    .refine((values) => new Set(values).size === values.length, "Não repita modalidades."),
  city: z.string().trim().max(120).default(""),
  state: z.enum([...brazilianStates, ""] as const).default(""),
  address: z.string().trim().max(200).default(""),
  transportMode: z.enum([...transportModes, ""] as const).default("")
}).strict().superRefine((value, context) => {
  if ((value.state || value.address) && !value.city) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["city"], message: "Informe a cidade para registrar estado ou endereço." });
  }
});
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
  languages: z.array(languageEntrySchema).default([]),
  professionalExperience: z.array(experienceEntrySchema).default([]),
  courses: profileListSchema,
  certifications: profileListSchema,
  professionalLinks: professionalLinksSchema,
  workPreferences: workPreferencesSchema.default(emptyWorkPreferences),
  accessibilityDeclaration: z.enum(["NOT_INFORMED", "NO_NEEDS_DECLARED", "NEEDS_DECLARED"]),
  accessibilityNeeds: profileListSchema,
  accessibilityNeedOptionCodes: optionCodeListSchema,
  // Subset of the selected catalog needs that the candidate marks as indispensable (critical lock, SPEC-007).
  mandatoryNeedOptionCodes: optionCodeListSchema,
  essentialAccessibilityResources: profileListSchema
}).strict().superRefine((profile, context) => {
  if (profile.mandatoryNeedOptionCodes.some((code) => !profile.accessibilityNeedOptionCodes.includes(code))) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mandatoryNeedOptionCodes"],
      message: "Só é possível marcar como indispensável uma necessidade selecionada."
    });
  }
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

// Experiences saved as free text before this structure keep their text as the role.
export function toExperienceList(value: unknown): ExperienceEntry[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item): ExperienceEntry[] => {
    if (typeof item === "string") return item.trim() ? [{ role: item.trim().slice(0, 120), company: "", period: "" }] : [];
    const parsed = experienceEntrySchema.safeParse(item);
    if (parsed.success) return [parsed.data];
    const loose = item as { role?: unknown; company?: unknown; period?: unknown } | null;
    return typeof loose?.role === "string" && loose.role.trim()
      ? [{ role: loose.role.trim().slice(0, 120), company: typeof loose.company === "string" ? loose.company.trim().slice(0, 120) : "", period: typeof loose.period === "string" ? loose.period.trim().slice(0, 80) : "" }]
      : [];
  });
}

export function toWorkPreferences(value: unknown): WorkPreferences {
  const parsed = workPreferencesSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : { ...emptyWorkPreferences };
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
  education: unknown; languages: unknown; professionalExperience: unknown;
  courses: unknown; certifications: unknown; professionalLinks: unknown; workPreferences: unknown;
  accessibilityDeclaration: "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
  accessibilityNeeds: unknown; accessibilityNeedOptionCodes: unknown; mandatoryNeedOptionCodes?: unknown;
  essentialAccessibilityResources: unknown; updatedAt: Date;
}) {
  return {
    education: toEducationList(profile.education), languages: toLanguageList(profile.languages), professionalExperience: toExperienceList(profile.professionalExperience),
    courses: toStringList(profile.courses), certifications: toStringList(profile.certifications),
    professionalLinks: toStringList(profile.professionalLinks),
    workPreferences: toWorkPreferences(profile.workPreferences),
    accessibilityDeclaration: profile.accessibilityDeclaration,
    accessibilityNeeds: toStringList(profile.accessibilityNeeds),
    accessibilityNeedOptionCodes: toStringList(profile.accessibilityNeedOptionCodes),
    mandatoryNeedOptionCodes: toStringList(profile.mandatoryNeedOptionCodes),
    essentialAccessibilityResources: toStringList(profile.essentialAccessibilityResources),
    updatedAt: profile.updatedAt.toISOString()
  };
}
