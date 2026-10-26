import { PrismaClient } from "@prisma/client";
import { purgeExpiredAuditEvents } from "./audit-retention.mjs";

const args = process.argv.slice(2);
const unknown = args.filter(arg => arg !== "--execute" && arg !== "--help");
if (unknown.length) {
  process.stderr.write(`Argumentos desconhecidos: ${unknown.join(", ")}\nUse --help para instruções.\n`);
  process.exitCode = 2;
} else if (args.includes("--help")) {
  process.stdout.write(
    "Política de retenção de auditoria: um ano-calendário a partir de createdAt.\n" +
    "Uso: npm run audit:retention             (simulação, não apaga registros)\n" +
    "     npm run audit:retention -- --execute (executa o descarte)\n" +
    "Registros com retentionHold=true são preservados. Configure este comando em um agendador operacional diário.\n"
  );
} else {
  const prisma = new PrismaClient();
  try {
    const result = await purgeExpiredAuditEvents(prisma, { execute: args.includes("--execute") });
    process.stdout.write(
      `Corte de retenção: ${result.cutoff.toISOString()}\n` +
      `Registros elegíveis: ${result.eligibleCount}\n` +
      (result.executed
        ? `Registros descartados: ${result.deletedCount}\n`
        : "Simulação concluída; nenhum registro foi apagado. Use --execute para aplicar.\n")
    );
  } catch (error) {
    process.stderr.write(`Falha na rotina de retenção: ${error instanceof Error ? error.message : "erro desconhecido"}\n`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
