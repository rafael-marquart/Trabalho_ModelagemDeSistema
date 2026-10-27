import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  candidateProfileInputSchema, canonicalJson, toEducationList, toExperienceList, toLanguageList, toProfileResponse, toStringList
} from "@/lib/candidate-profile/schema";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });

  const profile = await prisma.candidateProfile.findUnique({
    where: { userId: user.id },
    select: {
      education: true, languages: true, professionalExperience: true,
      courses: true, certifications: true, professionalLinks: true,
      accessibilityDeclaration: true, accessibilityNeeds: true, accessibilityNeedOptionCodes: true,
      essentialAccessibilityResources: true, updatedAt: true
    }
  });
  const emptyProfile = {
    education: [], languages: [], professionalExperience: [], courses: [],
    certifications: [], professionalLinks: [], accessibilityDeclaration: "NOT_INFORMED" as const,
    accessibilityNeeds: [], accessibilityNeedOptionCodes: [], essentialAccessibilityResources: [], updatedAt: new Date(0)
  };
  return NextResponse.json({
    profile: { fullName: user.fullName, email: user.email, ...toProfileResponse(profile ?? emptyProfile) }
  });
}

export async function PUT(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });

  const parsed = candidateProfileInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({
    message: "Confira os dados informados.", issues: parsed.error.flatten().fieldErrors
  }, { status: 400 });

  const input = parsed.data;
  const fields = {
    education: input.education, languages: input.languages,
    professionalExperience: input.professionalExperience, courses: input.courses,
    certifications: input.certifications, professionalLinks: input.professionalLinks,
    accessibilityDeclaration: input.accessibilityDeclaration,
    accessibilityNeeds: input.accessibilityNeeds,
    accessibilityNeedOptionCodes: input.accessibilityNeedOptionCodes,
    essentialAccessibilityResources: input.essentialAccessibilityResources
  };

  try {
    const result = await prisma.$transaction(async (tx) => {
      const previous = await tx.candidateProfile.findUnique({
        where: { userId: user.id },
        select: {
          education: true, languages: true, professionalExperience: true,
          courses: true, certifications: true, professionalLinks: true,
          accessibilityDeclaration: true, accessibilityNeeds: true,
          accessibilityNeedOptionCodes: true, essentialAccessibilityResources: true
        }
      });
      if (input.accessibilityNeedOptionCodes.length) {
        const requestedOptions = await tx.accessibilityNeedOption.findMany({
          where: { code: { in: input.accessibilityNeedOptionCodes } },
          select: { code: true, isActive: true }
        });
        const previousCodes = toStringList(previous?.accessibilityNeedOptionCodes);
        const invalid = input.accessibilityNeedOptionCodes.filter((code) => {
          const option = requestedOptions.find((candidateOption) => candidateOption.code === code);
          return !option || (!option.isActive && !previousCodes.includes(code));
        });
        if (invalid.length) {
          throw new Error("INVALID_ACCESSIBILITY_OPTION");
        }
      }
      const profile = await tx.candidateProfile.upsert({
        where: { userId: user.id }, create: { userId: user.id, ...fields }, update: fields,
        select: {
          education: true, languages: true, professionalExperience: true,
          courses: true, certifications: true, professionalLinks: true,
          accessibilityDeclaration: true, accessibilityNeeds: true,
          accessibilityNeedOptionCodes: true, essentialAccessibilityResources: true, updatedAt: true
        }
      });
      const changedCategories = Object.keys(fields).filter((key) => {
        let before: unknown = previous ? (previous as Record<string, unknown>)[key] : null;
        // Compare structured categories after reading legacy text entries the same way the API returns them.
        if (key === "education") before = toEducationList(before);
        if (key === "languages") before = toLanguageList(before);
        if (key === "professionalExperience") before = toExperienceList(before);
        return canonicalJson(before) !== canonicalJson(fields[key as keyof typeof fields]);
      });
      if (!previous || changedCategories.length) {
        await tx.auditEvent.create({
          data: {
            actorUserId: user.id,
            eventType: previous ? "CANDIDATE_PROFILE_UPDATED" : "CANDIDATE_PROFILE_CREATED",
            subjectType: "CandidateProfile", subjectId: user.id,
            metadata: {
              changedCategories: previous ? changedCategories : Object.keys(fields),
              changeCount: previous ? changedCategories.length : Object.keys(fields).length
            }
          }
        });
      }
      return profile;
    });
    return NextResponse.json({ ok: true, profile: toProfileResponse(result) });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_ACCESSIBILITY_OPTION") {
      return NextResponse.json({ message: "Uma ou mais opções de acessibilidade não estão disponíveis para nova seleção." }, { status: 400 });
    }
    throw error;
  }
}
