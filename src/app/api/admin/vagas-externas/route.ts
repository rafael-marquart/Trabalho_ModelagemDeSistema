import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listImportRuns, runExternalImport } from "@/lib/external-jobs/service";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";

// SPEC-006: the administrator starts the test batch (OPEN-086/087) and follows the runs. Only ADMIN accounts (RF-40).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" && user.isActive ? user : null;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  return NextResponse.json(await listImportRuns());
}

export async function POST(request: Request) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const result = await runExternalImport({ trigger: "ADMIN", userId: user.id });
  if ("error" in result) return NextResponse.json({ message: result.error.message }, { status: result.error.status });
  return NextResponse.json({ run: result.summary });
}
