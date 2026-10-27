import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";

// Creates the platform administrator account used to manage the accessibility catalog.
// Usage: ADMIN_EMAIL=... ADMIN_NAME="..." ADMIN_PASSWORD=... npm run admin:create
// Local/demo use only; the password is read from the environment, never printed.
const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const fullName = (process.env.ADMIN_NAME || "Administrador").trim();
const password = process.env.ADMIN_PASSWORD || "";

function passwordProblem(value) {
  if (value.length < 10 || value.length > 128) return "A senha deve ter entre 10 e 128 caracteres.";
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value) || !/[0-9]/.test(value)) {
    return "A senha deve conter letra minúscula, letra maiúscula e número.";
  }
  return null;
}

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  process.stderr.write("Informe ADMIN_EMAIL com um e-mail válido.\n");
  process.exitCode = 2;
} else if (passwordProblem(password)) {
  process.stderr.write(`${passwordProblem(password)} Defina ADMIN_PASSWORD.\n`);
  process.exitCode = 2;
} else {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email }, select: { id: true, role: true } });
    if (existing) {
      process.stderr.write(`Já existe uma conta com este e-mail (perfil ${existing.role}). Use outro e-mail.\n`);
      process.exitCode = 1;
    } else {
      const passwordHash = await argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
      await prisma.$transaction(async (tx) => {
        const admin = await tx.user.create({
          data: { email, fullName, passwordHash, role: "ADMIN", isActive: true },
          select: { id: true }
        });
        await tx.auditEvent.create({
          data: { actorUserId: null, eventType: "ADMIN_ACCOUNT_CREATED", subjectType: "User", subjectId: admin.id }
        });
      });
      process.stdout.write(`Administrador criado: ${email}. Acesse /admin/login.\n`);
    }
  } catch (error) {
    process.stderr.write(`Falha ao criar o administrador: ${error instanceof Error ? error.message : "erro desconhecido"}\n`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
