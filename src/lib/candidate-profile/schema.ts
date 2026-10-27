import { z } from "zod";

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
  education: profileListSchema,
  skills: profileListSchema,
  languages: profileListSchema,
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

export function toProfileResponse(profile: {
  education: unknown; skills: unknown; languages: unknown; professionalExperience: unknown;
  courses: unknown; certifications: unknown; professionalLinks: unknown;
  accessibilityDeclaration: "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
  accessibilityNeeds: unknown; accessibilityNeedOptionCodes: unknown;
  essentialAccessibilityResources: unknown; updatedAt: Date;
}) {
  return {
    education: toStringList(profile.education), skills: toStringList(profile.skills),
    languages: toStringList(profile.languages), professionalExperience: toStringList(profile.professionalExperience),
    courses: toStringList(profile.courses), certifications: toStringList(profile.certifications),
    professionalLinks: toStringList(profile.professionalLinks),
    accessibilityDeclaration: profile.accessibilityDeclaration,
    accessibilityNeeds: toStringList(profile.accessibilityNeeds),
    accessibilityNeedOptionCodes: toStringList(profile.accessibilityNeedOptionCodes),
    essentialAccessibilityResources: toStringList(profile.essentialAccessibilityResources),
    updatedAt: profile.updatedAt.toISOString()
  };
}
