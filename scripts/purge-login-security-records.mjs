import { PrismaClient } from "@prisma/client";
import { purgeExpiredLoginSecurityRecords } from "./login-security-retention.mjs";
const args = process.argv.slice(2);
const unknown = args.filter(arg => arg !== "--execute" && arg !== "--help");
if (unknown.length) {
  process.stderr.write(`Argumentos desconhecidos: ${unknown.join(", ")}\nUse --help para instruções.\n`);
  process.exitCode = 2;
} else if (args.includes("--help")) {
  process.stdout.write(
    "Retenção de segurança de login: tentativas com mais de 24 horas e bloqueios já expirados.\n" +
    "Uso: npm run login-security:retention             (simulação, não apaga registros)\n" +
    "     npm run login-security:retention -- --execute (executa a limpeza)\n" +
    "Configure este comando em um agendador operacional diário.\n"
  );
} else {
  const prisma = new PrismaClient();
  try {
    const result = await purgeExpiredLoginSecurityRecords(prisma, { execute: args.includes("--execute") });
    process.stdout.write(
      `Corte de tentativas: ${result.attemptCutoff.toISOString()}\n` +
      `Bloqueios expirados elegíveis: ${result.eligibleBlocks}\n` +
      `Tentativas antigas elegíveis: ${result.eligibleAttempts}\n` +
      (result.executed
        ? `Bloqueios removidos: ${result.deletedBlocks}\nTentativas removidas: ${result.deletedAttempts}\n`
        : "Simulação concluída; nenhum registro foi apagado. Use --execute para aplicar.\n")
    );
  } catch (error) {
    process.stderr.write(`Falha na limpeza de segurança de login: ${error instanceof Error ? error.message : "erro desconhecido"}\n`);
    process.exitCode = 1;
  } finally { await prisma.$disconnect(); }
}
