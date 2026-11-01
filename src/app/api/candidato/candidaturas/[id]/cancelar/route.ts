import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { cancelApplication } from "@/lib/applications/candidate-service";

type Context = { params: Promise<{ id: string }> };

/** SPEC-012: confirmed cancellation of the candidate's own application. The server checks ownership and conditions again. */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Entre como candidato para cancelar a candidatura." }, { status: 401 });
  const { id } = await context.params;
  const result = await cancelApplication(user.id, id);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true, stage: result.stage });
}
