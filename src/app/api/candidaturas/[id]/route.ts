import { NextResponse } from "next/server";
import { resolveJobActor } from "@/lib/jobs/access";
import { getApplicationForCompany } from "@/lib/applications/company-service";

type Context = { params: Promise<{ id: string }> };

/** SPEC-013: one application of the actor's company, limited to the data the selection process needs (OPEN-055). */
export async function GET(_request: Request, context: Context) {
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const { id } = await context.params;
  const application = await getApplicationForCompany(actor.companyId, id);
  if (!application) return NextResponse.json({ message: "Candidatura não encontrada." }, { status: 404 });
  return NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
}
