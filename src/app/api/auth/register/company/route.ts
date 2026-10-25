import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/password-policy";
import { normalizeIdentifier } from "@/lib/auth/login-schema";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  legalName: z.string().trim().min(2).max(200),
  tradeName: z.string().trim().max(200).optional(),
  officialId: z.string().trim().min(8).max(30),
  contactEmail: z.string().trim().email().max(254),
  password: passwordSchema
});

export async function POST(request: Request) {
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
        select: { id: true }
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

  return NextResponse.json({
    ok: true,
    message: "Recebemos o cadastro. A conta organizacional permanecerá indisponível até a validação do identificador oficial e a confirmação do e-mail corporativo."
  }, { status: 201 });
}
