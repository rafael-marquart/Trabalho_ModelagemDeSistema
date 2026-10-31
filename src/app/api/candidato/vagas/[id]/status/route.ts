import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { checkJobAvailability } from "@/lib/jobs/availability";

type Context = { params: Promise<{ id: string }> };

/** SPEC-009: current status of a published job for a signed-in candidate. Read-only; there is no way to change it here. */
export async function GET(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const { id } = await context.params;
  const availability = await checkJobAvailability(id);
  if (!availability) return NextResponse.json({ message: "Vaga não encontrada." }, { status: 404 });
  return NextResponse.json({ availability }, { headers: { "Cache-Control": "no-store" } });
}
