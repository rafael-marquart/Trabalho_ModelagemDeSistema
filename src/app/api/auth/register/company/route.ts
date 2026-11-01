import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/password-policy";
import { normalizeIdentifier } from "@/lib/auth/login-schema";
import { isValidCnpj, normalizeCnpj } from "@/lib/auth/cnpj";
import { createOneTimeToken } from "@/lib/auth/tokens";
import { emailFailureMetadata, sendEmail } from "@/lib/email";
import { emailTemplates } from "@/lib/email-templates";
import { prisma } from "@/lib/prisma";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const schema = z.object({
  legalName: z.string().trim().min(2).max(200),
  tradeName: z.string().trim().max(200).optional(),
  officialId: z.string().trim().max(30).optional(),
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
  const officialId = input.officialId ? normalizeCnpj(input.officialId) : null;
  if (officialId !== null && !isValidCnpj(officialId)) {
    return NextResponse.json({ message: "Informe um CNPJ válido. O cadastro inicial aceita apenas empresas brasileiras." }, { status: 400 });
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
      const target = "meta" in error && typeof error.meta === "object" && error.meta !== null && "target" in error.meta
        ? error.meta.target
        : undefined;
      const fields = Array.isArray(target) ? target.map(String) : typeof target === "string" ? [target] : [];
      const message = fields.some((field) => field.toLowerCase().includes("email"))
        ? "Este e-mail já está cadastrado. Entre na conta existente ou use outro e-mail."
        : fields.some((field) => field.toLowerCase().includes("officialid") || field.toLowerCase().includes("cnpj"))
          ? "Este CNPJ já está associado a uma conta. Confira os dados ou entre em contato com o suporte."
          : "Já existe uma conta com um dos dados informados. Confira o e-mail e o CNPJ.";
      return NextResponse.json({ message }, { status: 409 });
    }
    throw error;
  }

  const baseUrl = getPublicBaseUrl(request);
  try {
    if (!baseUrl) throw new Error("APP_BASE_URL is required to send production email links");
    await sendEmail({ to: email, ...emailTemplates.companyEmailVerification(`${baseUrl}/empresa/confirmar-email?token=${token}`) });
  } catch (error) {
    await prisma.auditEvent.create({
      data: {
        actorUserId: userId,
        eventType: "AUTH_COMPANY_EMAIL_VERIFICATION_DELIVERY_FAILED",
        subjectType: "User",
        subjectId: userId,
        metadata: emailFailureMetadata(error)
      }
    });
  }

  return NextResponse.json({
    ok: true,
    message: "Recebemos o cadastro. Se o envio estiver disponível, enviaremos um link de confirmação ao e-mail corporativo. A conta permanecerá indisponível até a confirmação do e-mail corporativo."
  }, { status: 201 });
}
