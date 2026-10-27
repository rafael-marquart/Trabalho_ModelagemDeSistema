import { z } from "zod";

export const profileListSchema = z.array(z.string().trim().min(1)).default([]);

export const candidateProfileInputSchema = z.object({
  education: profileListSchema,
  skills: profileListSchema,
  languages: profileListSchema,
  professionalExperience: profileListSchema,
  courses: profileListSchema,
  certifications: profileListSchema,
  professionalLinks: profileListSchema,
  accessibilityDeclaration: z.enum(["NOT_INFORMED", "NO_NEEDS_DECLARED", "NEEDS_DECLARED"]),
  accessibilityNeeds: profileListSchema,
  essentialAccessibilityResources: profileListSchema
}).strict();

export function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function toProfileResponse(profile: {
  education: unknown; skills: unknown; languages: unknown; professionalExperience: unknown;
  courses: unknown; certifications: unknown; professionalLinks: unknown;
  accessibilityDeclaration: "NOT_INFORMED" | "NO_NEEDS_DECLARED" | "NEEDS_DECLARED";
  accessibilityNeeds: unknown; essentialAccessibilityResources: unknown; updatedAt: Date;
}) {
  return {
    education: toStringList(profile.education), skills: toStringList(profile.skills),
    languages: toStringList(profile.languages), professionalExperience: toStringList(profile.professionalExperience),
    courses: toStringList(profile.courses), certifications: toStringList(profile.certifications),
    professionalLinks: toStringList(profile.professionalLinks),
    accessibilityDeclaration: profile.accessibilityDeclaration,
    accessibilityNeeds: toStringList(profile.accessibilityNeeds),
    essentialAccessibilityResources: toStringList(profile.essentialAccessibilityResources),
    updatedAt: profile.updatedAt.toISOString()
  };
}
