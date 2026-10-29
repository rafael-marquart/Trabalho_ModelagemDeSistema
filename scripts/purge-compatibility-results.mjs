import { PrismaClient } from "@prisma/client";
import { purgeExpiredCompatibilityResults } from "./compatibility-retention.mjs";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  process.stdout.write(
    "Retenção do histórico de compatibilidade: um ano a partir de executedAt.\n" +
    "Uso: npm run compatibility:retention             (simulação, não apaga registros)\n" +
    "     npm run compatibility:retention -- --execute (executa o descarte)\n"
  );
} else {
  const prisma = new PrismaClient();
  try {
    const result = await purgeExpiredCompatibilityResults(prisma, { execute: args.includes("--execute") });
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
