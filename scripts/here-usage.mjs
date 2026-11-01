import { PrismaClient } from "@prisma/client";

// Shows this month's HERE requests counted by this installation against the safety cap (SPEC-007 / OPEN-088).
const limits = { geocode: 30000, routing: 5000, transit: 5000 };
const num = value => (value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : undefined);
const percent = Math.min(num(process.env.HERE_QUOTA_PERCENT) ?? 60, 100);
const month = new Date().toISOString().slice(0, 7);
const prisma = new PrismaClient();
try {
  const rows = await prisma.hereUsage.findMany({ where: { month } });
  process.stdout.write(`Uso da HERE em ${month} (limite de segurança: ${percent}% da cota gratuita)\n`);
  for (const service of Object.keys(limits)) {
    const limit = num(process.env[`HERE_LIMIT_${service.toUpperCase()}`]) ?? limits[service];
    const cap = Math.floor((limit * percent) / 100);
    const used = rows.find(row => row.service === service)?.count ?? 0;
    process.stdout.write(`- ${service}: ${used} de ${cap}${used >= cap ? " (bloqueado até o próximo mês)" : ""}\n`);
  }
  process.stdout.write("Conta apenas as chamadas feitas por esta instalação; confira o painel da HERE para o total da chave.\n");
} catch (error) {
  process.stderr.write(`Falha ao consultar o uso: ${error instanceof Error ? error.message : "erro desconhecido"}\n`);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
