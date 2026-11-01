import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/password-policy";
import { isValidCpf, normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const schema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  cpf: z.string().trim().min(11).max(18),
  password: passwordSchema
});

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Confira os dados informados.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;
  const email = normalizeIdentifier(input.email);
  const cpf = normalizeCpf(input.cpf);
  if (!isValidCpf(cpf)) return NextResponse.json({ message: "Informe um CPF válido." }, { status: 400 });

  const passwordHash = await hashPassword(input.password);
  try {
    await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { fullName: input.fullName, email, cpf, passwordHash, role: "CANDIDATE" },
        select: { id: true }
      });
      await tx.auditEvent.create({
        data: { actorUserId: created.id, eventType: "AUTH_CANDIDATE_REGISTERED", subjectType: "User", subjectId: created.id }
      });
    });
    return NextResponse.json({ ok: true, message: "Conta criada. Você já pode entrar." }, { status: 201 });
  } catch (error) {
    // Unique constraints also protect against simultaneous registrations.
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      const target = "meta" in error && typeof error.meta === "object" && error.meta !== null && "target" in error.meta
        ? error.meta.target
        : undefined;
      const fields = Array.isArray(target) ? target.map(String) : typeof target === "string" ? [target] : [];
      const message = fields.some((field) => field.toLowerCase().includes("email"))
        ? "Este e-mail já está cadastrado. Entre na conta existente ou use outro e-mail."
        : fields.some((field) => field.toLowerCase().includes("cpf"))
          ? "Este CPF já está associado a uma conta. Confira os dados ou entre na conta existente."
          : "Já existe uma conta com um dos dados informados. Confira o e-mail e o CPF.";
      return NextResponse.json({ message }, { status: 409 });
    }
    throw error;
  }
}
