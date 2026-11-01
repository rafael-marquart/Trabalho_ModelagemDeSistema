import { PrismaClient } from "@prisma/client";
import { purgeExpiredNotifications } from "./notification-retention.mjs";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  process.stdout.write(
    "Retenção dos registros de notificação: um ano a partir da criação (só enviados ou com falha final).\n" +
    "Uso: npm run notifications:retention             (simulação, não apaga registros)\n" +
    "     npm run notifications:retention -- --execute (executa o descarte)\n"
  );
} else {
  const prisma = new PrismaClient();
  try {
    const result = await purgeExpiredNotifications(prisma, { execute: args.includes("--execute") });
    process.stdout.write(
      `Corte de retenção: ${result.cutoff.toISOString()}\nRegistros elegíveis: ${result.eligibleCount}\n` +
      (result.executed ? `Registros descartados: ${result.deletedCount}\n` : "Simulação concluída; nenhum registro foi apagado. Use --execute para aplicar.\n")
    );
  } catch (error) {
    process.stderr.write(`Falha na rotina de retenção: ${error instanceof Error ? error.message : "erro desconhecido"}\n`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
