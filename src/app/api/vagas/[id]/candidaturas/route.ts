import { NextResponse } from "next/server";
import { resolveJobActor } from "@/lib/jobs/access";
import { listJobApplications } from "@/lib/applications/company-service";

type Context = { params: Promise<{ id: string }> };

/** SPEC-013: applications of one job of the actor's company, with counts per funnel stage. */
export async function GET(_request: Request, context: Context) {
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const { id } = await context.params;
  const result = await listJobApplications(actor.companyId, id);
  if (!result) return NextResponse.json({ message: "Vaga não encontrada." }, { status: 404 });
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
