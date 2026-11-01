import { PrismaClient } from "@prisma/client";
import { anonymizeExpiredEvaluations } from "./evaluation-retention.mjs";

const args = process.argv.slice(2);
if (args.includes("--help")) {
  process.stdout.write(
    "Retenção das avaliações pós-entrevista: anonimiza registros individuais com mais de 1 ano do envio.\n" +
    "Uso: npm run evaluations:retention             (simulação, não altera registros)\n" +
    "     npm run evaluations:retention -- --execute (executa a anonimização)\n"
  );
} else {
  const prisma = new PrismaClient();
  try {
    const result = await anonymizeExpiredEvaluations(prisma, { execute: args.includes("--execute") });
    process.stdout.write(
      `Corte de retenção: ${result.cutoff.toISOString()}\nRegistros elegíveis: ${result.eligibleCount}\n` +
      (result.executed ? `Registros anonimizados: ${result.anonymizedCount}\n` : "Simulação concluída; nenhum registro foi alterado. Use --execute para aplicar.\n")
    );
  } catch (error) {
    process.stderr.write(`Falha na rotina de retenção: ${error instanceof Error ? error.message : "erro desconhecido"}\n`);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}
