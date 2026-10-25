import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/password-policy";
import { normalizeIdentifier } from "@/lib/auth/login-schema";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const schema = z.object({
  legalName: z.string().trim().min(2).max(200),
  tradeName: z.string().trim().max(200).optional(),
  officialId: z.string().trim().min(8).max(30),
  contactEmail: z.string().trim().email().max(254),
  password: passwordSchema
});
const EMAIL_VERIFICATION_MS = 24 * 60 * 60 * 1000;

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Confira os dados informados.", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const input = parsed.data;
  const email = normalizeIdentifier(input.contactEmail);
  const officialId = input.officialId.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (officialId.length < 8) {
    return NextResponse.json({ message: "Confira os dados informados." }, { status: 400 });
  }

  const passwordHash = await hashPassword(input.password);
  const { token, tokenHash } = createOneTimeToken();
  const expiresAt = new Date(Date.now() + EMAIL_VERIFICATION_MS);
  let userId = "";
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          fullName: input.legalName,
          passwordHash,
          role: "COMPANY",
          isActive: false,
          company: {
            create: {
              legalName: input.legalName,
              tradeName: input.tradeName || null,
              officialId,
              contactEmail: email
            }
          }
        },
        select: { id: true, company: { select: { id: true } } }
      });
      userId = user.id;
      if (!user.company) throw new Error("COMPANY_CREATION_FAILED");
      await tx.companyEmailVerificationToken.create({
        data: { companyId: user.company.id, tokenHash, expiresAt }
      });
      await tx.auditEvent.create({
        data: {
          actorUserId: user.id,
          eventType: "AUTH_COMPANY_REGISTERED_PENDING_VALIDATION",
          subjectType: "User",
          subjectId: user.id
        }
      });
    });
  } catch (error) {
    // The database unique constraints are the final guard against concurrent duplicates.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      return NextResponse.json(
        { message: "Não foi possível criar a conta com os dados informados." },
        { status: 409 }
      );
    }
    throw error;
  }

  const baseUrl = getPublicBaseUrl(request);
  try {
    if (!baseUrl) throw new Error("APP_BASE_URL is required to send production email links");
    await sendEmail({
      to: email,
      subject: "Confirme o e-mail corporativo — Acessa Vagas",
      text: `Para confirmar o e-mail corporativo, acesse este link em até 24 horas e use-o apenas uma vez: ${baseUrl}/empresa/confirmar-email?token=${token}\n\nA confirmação do e-mail não libera a conta por si só; a validação do identificador oficial também é necessária. Se você não solicitou este cadastro, ignore esta mensagem.`
    });
  } catch {
    await prisma.auditEvent.create({
      data: {
        actorUserId: userId,
        eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_DELIVERY_FAILED",
        subjectType: "User",
        subjectId: userId
      }
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Recebemos o cadastro. Se o envio estiver disponível, enviaremos um link de confirmação ao e-mail corporativo. A conta permanecerá indisponível até a confirmação do e-mail e a validação do identificador oficial."
  }, { status: 201 });
}
