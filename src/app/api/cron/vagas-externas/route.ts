import { NextResponse } from "next/server";
import { runExternalImport } from "@/lib/external-jobs/service";
import { isAuthorizedCron } from "@/lib/security/cron";

// SPEC-006 (T-006-01): daily collection, started by the scheduler without an administrator. It stays off
// (EXTERNAL_IMPORT_SCHEDULE) until the continuous use of the source is authorized (OPEN-086/087).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const result = await runExternalImport({ trigger: "SCHEDULE" });
  if ("error" in result) return NextResponse.json({ ok: false, message: result.error.message }, { status: result.error.status === 409 ? 200 : result.error.status });
  return NextResponse.json({ ok: true, run: result.summary });
}
