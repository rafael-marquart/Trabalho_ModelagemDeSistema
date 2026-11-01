import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAuthorizedCron } from "@/lib/security/cron";
import { purgeExpiredAuditEvents } from "../../../../../scripts/audit-retention.mjs";
import { purgeExpiredLoginSecurityRecords } from "../../../../../scripts/login-security-retention.mjs";
import { purgeExpiredCompatibilityResults } from "../../../../../scripts/compatibility-retention.mjs";
import { purgeExpiredNotifications } from "../../../../../scripts/notification-retention.mjs";
import { anonymizeExpiredEvaluations } from "../../../../../scripts/evaluation-retention.mjs";

// Daily retention on hosting without a terminal: the same routines as the "npm run ...:retention -- --execute" commands
// (audit 1 year, login security, compatibility 1 year, notifications, evaluations anonymized after 1 year — SPEC-021).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const routines = {
  audit: () => purgeExpiredAuditEvents(prisma, { execute: true }),
  loginSecurity: () => purgeExpiredLoginSecurityRecords(prisma, { execute: true }),
  compatibility: () => purgeExpiredCompatibilityResults(prisma, { execute: true }),
  notifications: () => purgeExpiredNotifications(prisma, { execute: true }),
  evaluations: () => anonymizeExpiredEvaluations(prisma, { execute: true })
};

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  // Each routine runs on its own: one failure does not stop the others, and the response says which one failed.
  const results: Record<string, unknown> = {};
  let ok = true;
  for (const [name, run] of Object.entries(routines)) {
    try {
      results[name] = await run();
    } catch (error) {
      ok = false;
      results[name] = { error: error instanceof Error ? error.message : "erro desconhecido" };
      console.error(`[retenção] ${name} falhou:`, error);
    }
  }
  return NextResponse.json({ ok, results }, { status: ok ? 200 : 500 });
}
