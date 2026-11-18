import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getImportRecords } from "@/lib/external-jobs/service";

/** SPEC-006 (T-006-25): result of each record of one run, with the reason of rejections and failures. */
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (user?.role !== "ADMIN" || !user.isActive) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const { id } = await context.params;
  return NextResponse.json({ records: await getImportRecords(id) });
}
