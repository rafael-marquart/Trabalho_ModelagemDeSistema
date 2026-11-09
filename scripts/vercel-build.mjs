// Build used by Vercel ("vercel-build"). On the production deployment (main) and on the test environment
// (desenvolvimento-do-projeto, APP_ENV="staging") it first applies pending migrations (prisma migrate deploy) to that
// environment's own database, so the code and the schema go live together; other previews never touch a schema.
// Migrations need a direct connection: MIGRATE_DATABASE_URL, or DATABASE_URL_UNPOOLED (set by the Neon integration),
// or DATABASE_URL when it is already direct. See docs/operacao/deploy-vercel.md.
import { spawnSync } from "node:child_process";

function run(command, args, env = process.env) {
  process.stdout.write(`\n> ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const production = process.env.VERCEL_ENV === "production";
// The test environment (branch desenvolvimento-do-projeto, preview deployments) has its own database. Its schema is
// migrated only when the preview environment says so explicitly (APP_ENV="staging"): a preview that, by mistake,
// pointed to the production database without that flag never changes it.
const staging = process.env.VERCEL_ENV === "preview" && process.env.APP_ENV === "staging"
  && process.env.VERCEL_GIT_COMMIT_REF === "desenvolvimento-do-projeto";
if (production || staging) {
  const migrationUrl = process.env.MIGRATE_DATABASE_URL || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!migrationUrl) {
    process.stderr.write("DATABASE_URL não configurada: defina as variáveis de ambiente do projeto na Vercel.\n");
    process.exit(1);
  }
  process.stdout.write(`Aplicando migrações (${production ? "produção" : "ambiente de testes"}).\n`);
  run("npx", ["prisma", "migrate", "deploy"], { ...process.env, DATABASE_URL: migrationUrl });
} else {
  process.stdout.write(`Ambiente "${process.env.VERCEL_ENV || "local"}": migrações não são aplicadas.\n`);
}
run("npx", ["prisma", "generate"]);
run("npx", ["next", "build"]);
