import { NextResponse } from "next/server";
import { z } from "zod";
import { hashOneTimeToken } from "@/lib/auth/tokens";
import { prisma } from "@/lib/prisma";

const schema = z.object({ token: z.string().min(20).max(200) });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ message: "O link é inválido ou expirou. Solicite uma nova confirmação." }, { status: 400 });
  }

  const now = new Date();
  const tokenRecord = await prisma.companyEmailVerificationToken.findUnique({
    where: { tokenHash: hashOneTimeToken(parsed.data.token) },
    include: { company: { select: { id: true, emailConfirmedAt: true, accountUserId: true } } }
  });

  if (!tokenRecord || tokenRecord.usedAt || tokenRecord.expiresAt <= now || tokenRecord.company.emailConfirmedAt) {
    return NextResponse.json({ message: "O link é inválido, expirou ou já foi utilizado." }, { status: 400 });
  }

  let confirmed = false;
  try {
    confirmed = await prisma.$transaction(async (tx) => {
    const claimed = await tx.companyEmailVerificationToken.updateMany({
      where: { id: tokenRecord.id, usedAt: null, expiresAt: { gt: now } },
      data: { usedAt: now }
    });
    if (claimed.count !== 1) return false;

    const updated = await tx.company.updateMany({
      where: { id: tokenRecord.company.id, emailConfirmedAt: null },
      data: { emailConfirmedAt: now }
    });
    // Throwing aborts the interactive transaction so the token claim is rolled
    // back if another request confirmed the company after the initial read.
    if (updated.count !== 1) throw new Error("COMPANY_EMAIL_ALREADY_CONFIRMED");

    await tx.companyEmailVerificationToken.deleteMany({
      where: { companyId: tokenRecord.company.id, id: { not: tokenRecord.id } }
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: tokenRecord.company.accountUserId,
        eventType: "AUTH_COMPANY_EMAIL_CONFIRMED",
        subjectType: "Company",
        subjectId: tokenRecord.company.id
      }
    });
      return true;
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "COMPANY_EMAIL_ALREADY_CONFIRMED") throw error;
  }

  if (!confirmed) {
    return NextResponse.json({ message: "O link é inválido, expirou ou já foi utilizado." }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "E-mail corporativo confirmado. A conta continuará indisponível até a validação do identificador oficial."
  });
}
