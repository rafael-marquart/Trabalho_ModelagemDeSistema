import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

const groupSchema = z.enum(["ARCHITECTURAL", "COMMUNICATION", "TECHNOLOGICAL"]);
const createSchema = z.object({
  code: z.string().trim().regex(/^[A-Z][A-Z0-9_-]{1,31}$/, "Use um identificador estável em letras maiúsculas, números, hífen ou sublinhado."),
  name: z.string().trim().min(1),
  description: z.string().trim().min(1),
  group: groupSchema
}).strict();
const updateSchema = z.object({
  code: z.string().trim().min(2),
  name: z.string().trim().min(1).optional(),
  description: z.string().trim().min(1).optional(),
  group: groupSchema.optional(),
  isMandatory: z.boolean().optional(),
  isActive: z.boolean().optional()
}).strict().refine((value) => Object.keys(value).some((key) => key !== "code"), {
  message: "Informe ao menos um campo para atualizar."
});

async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" ? user : null;
}

export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const options = await prisma.accessibilityNeedOption.findMany({
    orderBy: [{ group: "asc" }, { code: "asc" }]
  });
  return NextResponse.json({ options });
}

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Confira os dados informados.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });

  const existing = await prisma.accessibilityNeedOption.findUnique({ where: { code: parsed.data.code }, select: { code: true } });
  if (existing) return NextResponse.json({ message: "Esse identificador já está cadastrado. Identificadores existentes não podem ser reutilizados." }, { status: 409 });
  const option = await prisma.$transaction(async (tx) => {
    const created = await tx.accessibilityNeedOption.create({ data: { ...parsed.data, isMandatory: false, isActive: true } });
    await tx.auditEvent.create({
      data: {
        actorUserId: user.id, eventType: "ACCESSIBILITY_CATALOG_OPTION_CREATED",
        subjectType: "AccessibilityNeedOption", subjectId: created.code,
        metadata: { code: created.code, group: created.group, isMandatory: created.isMandatory, isActive: created.isActive }
      }
    });
    return created;
  });
  return NextResponse.json({ option }, { status: 201 });
}

export async function PATCH(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Confira os dados informados.", issues: parsed.error.flatten().fieldErrors }, { status: 400 });
  const { code, ...changes } = parsed.data;
  const previous = await prisma.accessibilityNeedOption.findUnique({ where: { code } });
  if (!previous) return NextResponse.json({ message: "Opção não encontrada." }, { status: 404 });

  const option = await prisma.$transaction(async (tx) => {
    const updated = await tx.accessibilityNeedOption.update({ where: { code }, data: changes });
    const changedFields = Object.keys(changes).filter((key) =>
      previous[key as keyof typeof previous] !== updated[key as keyof typeof updated]
    );
    if (changedFields.length) {
      await tx.auditEvent.create({
        data: {
          actorUserId: user.id, eventType: "ACCESSIBILITY_CATALOG_OPTION_UPDATED",
          subjectType: "AccessibilityNeedOption", subjectId: code,
          metadata: {
            code, changedFields,
            isMandatory: updated.isMandatory, isActive: updated.isActive
          }
        }
      });
    }
    return updated;
  });
  return NextResponse.json({ option });
}
