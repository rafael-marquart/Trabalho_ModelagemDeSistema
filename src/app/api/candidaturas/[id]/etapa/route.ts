import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveJobActor } from "@/lib/jobs/access";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { changeApplicationStage } from "@/lib/applications/company-service";
import { FUNNEL_ORDER } from "@/lib/applications/funnel";

type Context = { params: Promise<{ id: string }> };
// Only the destination and an optional note come from the client; authorization and the current stage are read on the server.
const bodySchema = z.object({
  toStage: z.enum(FUNNEL_ORDER as [string, ...string[]]),
  note: z.string().trim().max(500, "Use até 500 caracteres.").optional()
}).strict();

export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const actor = await resolveJobActor();
  if (actor.error) return actor.error;
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "Dados inválidos." }, { status: 400 });
  const { id } = await context.params;
  const result = await changeApplicationStage({
    companyId: actor.companyId, actorUserId: actor.user.id, applicationId: id,
    toStage: parsed.data.toStage as Parameters<typeof changeApplicationStage>[0]["toStage"], note: parsed.data.note
  });
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true, stage: result.stage });
}
