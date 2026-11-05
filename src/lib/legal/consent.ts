import { z } from "zod";
import type { Prisma, PrismaClient } from "@prisma/client";

/**
 * Terms of Use, Privacy Policy and the specific consent for accessibility data (OPEN-100, LGPD arts. 7, 8, 9 and 11).
 * The version identifies the text a person accepted; a new version of a text means a new date here.
 */
export const LEGAL_VERSION = "2026-11-05";
export const LEGAL_UPDATED_LABEL = "5 de novembro de 2026";

type Db = PrismaClient | Prisma.TransactionClient;

/** Signup and recruiter activation must carry an explicit "I read and agree" (never pre-checked, never implied). */
export const termsAcceptanceSchema = z.literal(true, { message: "Para criar a conta, leia e aceite os Termos de Uso e a Política de Privacidade." });

export async function recordTermsAcceptance(db: Db, userId: string) {
  await db.consentRecord.create({ data: { userId, kind: "TERMS_AND_PRIVACY", version: LEGAL_VERSION, granted: true } });
}

/** The latest decision about accessibility data: granted (with when) or not. Withdrawal is a newer row with granted=false. */
export async function accessibilityConsent(db: Db, userId: string): Promise<{ active: boolean; at: Date | null }> {
  const latest = await db.consentRecord.findFirst({
    where: { userId, kind: "ACCESSIBILITY_DATA" }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: { granted: true, createdAt: true }
  });
  return { active: Boolean(latest?.granted), at: latest?.granted ? latest.createdAt : null };
}

export async function grantAccessibilityConsent(db: Db, userId: string) {
  await db.consentRecord.create({ data: { userId, kind: "ACCESSIBILITY_DATA", version: LEGAL_VERSION, granted: true } });
  await db.auditEvent.create({ data: { actorUserId: userId, eventType: "CANDIDATE_ACCESSIBILITY_CONSENT_GRANTED", subjectType: "User", subjectId: userId, metadata: { version: LEGAL_VERSION } } });
}

/** Whether a profile carries accessibility data (needs or indispensable resources), which needs the specific consent. */
export function hasAccessibilityData(profile: { accessibilityDeclaration?: string | null; accessibilityNeedOptionCodes?: unknown; accessibilityNeeds?: unknown; essentialAccessibilityResources?: unknown } | null | undefined) {
  if (!profile) return false;
  const filled = (value: unknown) => Array.isArray(value) && value.length > 0;
  return profile.accessibilityDeclaration === "NEEDS_DECLARED" || filled(profile.accessibilityNeedOptionCodes)
    || filled(profile.accessibilityNeeds) || filled(profile.essentialAccessibilityResources);
}

/** Without an active consent, accessibility data is not used: no compatibility on it, nothing shown to companies. */
export const accessibilityFieldsWithoutConsent = {
  accessibilityDeclaration: "NOT_INFORMED" as const,
  accessibilityNeeds: [] as string[],
  accessibilityNeedOptionCodes: [] as string[],
  mandatoryNeedOptionCodes: [] as string[],
  essentialAccessibilityResources: [] as string[]
};

export const ACCESSIBILITY_CONSENT_TEXT =
  "Autorizo o AcessaVagas a usar as informações de acessibilidade que eu declarar (necessidades e recursos indispensáveis) " +
  "para calcular a compatibilidade com as vagas e para mostrá-las às empresas, e aos recrutadores delas, das vagas em que eu me " +
  "candidatar, para que preparem o processo seletivo. A descrição livre e os documentos não são mostrados às empresas. " +
  "Posso retirar esta autorização a qualquer momento.";
