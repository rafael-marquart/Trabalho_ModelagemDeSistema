import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { accessibilityFieldsWithoutConsent, LEGAL_VERSION } from "@/lib/legal/consent";

/**
 * Withdrawal of the consent for accessibility data (OPEN-100, LGPD arts. 8 §5 and 18, IX). In one transaction: the
 * accessibility information is erased from the profile and the withdrawal is recorded. From then on it is neither used
 * in compatibility nor shown to companies; the candidate can declare it again later, with a new consent.
 */
export async function DELETE(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE") return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });

  await prisma.$transaction(async (tx) => {
    await tx.candidateProfile.updateMany({ where: { userId: user.id }, data: accessibilityFieldsWithoutConsent });
    await tx.consentRecord.create({ data: { userId: user.id, kind: "ACCESSIBILITY_DATA", version: LEGAL_VERSION, granted: false } });
    await tx.auditEvent.create({ data: { actorUserId: user.id, eventType: "CANDIDATE_ACCESSIBILITY_CONSENT_REVOKED", subjectType: "User", subjectId: user.id, metadata: { version: LEGAL_VERSION } } });
  });
  return NextResponse.json({ ok: true, message: "Autorização retirada. Suas informações de acessibilidade foram apagadas do perfil." });
}
