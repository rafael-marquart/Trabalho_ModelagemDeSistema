import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { passwordSchema } from "@/lib/auth/password-policy";
import { normalizeCpf, normalizeIdentifier } from "@/lib/auth/login-schema";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  fullName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254),
  cpf: z.string().trim().min(11).max(18),
  password: passwordSchema
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Confira os dados informados.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  const input = parsed.data;
  const email = normalizeIdentifier(input.email);
  const cpf = normalizeCpf(input.cpf);
  if (cpf.length !== 11) return NextResponse.json({ message: "Informe um CPF válido." }, { status: 400 });

  const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { cpf }] }, select: { id: true } });
  if (existing) return NextResponse.json({ message: "Não foi possível criar a conta com os dados informados." }, { status: 409 });

  const user = await prisma.user.create({
    data: { fullName: input.fullName, email, cpf, passwordHash: await hashPassword(input.password), role: "CANDIDATE" },
    select: { id: true }
  });
  await prisma.auditEvent.create({ data: { actorUserId: user.id, eventType: "AUTH_CANDIDATE_REGISTERED", subjectType: "User", subjectId: user.id } });
  return NextResponse.json({ ok: true, message: "Conta criada. Você já pode entrar." }, { status: 201 });
}