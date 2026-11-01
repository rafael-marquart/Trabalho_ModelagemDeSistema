// Build used by Vercel ("vercel-build"). On the production deployment it first applies pending database migrations
// (prisma migrate deploy), so the code and the schema go live together; preview deployments never touch the schema.
// Migrations need a direct connection: MIGRATE_DATABASE_URL, or DATABASE_URL_UNPOOLED (set by the Neon integration),
// or DATABASE_URL when it is already direct. See docs/operacao/deploy-vercel.md.
import { spawnSync } from "node:child_process";

function run(command, args, env = process.env) {
  process.stdout.write(`\n> ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const production = process.env.VERCEL_ENV === "production";
if (production) {
  const migrationUrl = process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!migrationUrl) {
    process.stderr.write("DATABASE_URL não configurada: defina as variáveis de ambiente do projeto na Vercel.\n");
    process.exit(1);
  }
  run("npx", ["prisma", "migrate", "deploy"], { ...process.env, DATABASE_URL: migrationUrl });
} else {
  process.stdout.write(`Ambiente "${process.env.VERCEL_ENV || "local"}": migrações não são aplicadas (só na produção).\n`);
}
run("npx", ["prisma", "generate"]);
run("npx", ["next", "build"]);
