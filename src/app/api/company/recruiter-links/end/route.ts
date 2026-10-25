import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { prisma } from "@/lib/prisma";

const schema = z.object({ recruiterLinkId: z.string().min(1).max(100) });

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const user = await getCurrentUser();
  if (!user || user.role !== "COMPANY") {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Vínculo de recrutador inválido." }, { status: 400 });
  }

  const company = await prisma.company.findUnique({
    where: { accountUserId: user.id },
    select: { id: true }
  });
  if (!company || !user.isActive) {
    return NextResponse.json({ message: "A empresa não está habilitada para gerenciar recrutadores." }, { status: 403 });
  }

  const endedAt = new Date();
  const ended = await prisma.$transaction(async tx => {
    // Scope the transition to the requesting company's own active link. The
    // account and audit history remain intact; only the organizational link ends.
    const changed = await tx.recruiterLink.updateMany({
      where: {
        id: parsed.data.recruiterLinkId,
        companyId: company.id,
        active: true
      },
      data: { active: false, endedAt }
    });
    if (changed.count !== 1) return false;

    await tx.auditEvent.create({
      data: {
        actorUserId: user.id,
        eventType: "RECRUITER_LINK_ENDED",
        subjectType: "RecruiterLink",
        subjectId: parsed.data.recruiterLinkId
      }
    });
    return true;
  });

  if (!ended) {
    return NextResponse.json({ message: "Vínculo não encontrado ou já encerrado." }, { status: 409 });
  }

  return NextResponse.json({ ok: true, message: "Vínculo encerrado. A conta e o histórico do recrutador foram preservados." });
}
