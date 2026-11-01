import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { rejectCrossOriginRequest } from "@/lib/security/request-origin";
import { hideApplication } from "@/lib/applications/candidate-service";

type Context = { params: Promise<{ id: string }> };

/** Removes one of the candidate's own refused or cancelled applications from their list (nothing is deleted). */
export async function POST(request: Request, context: Context) {
  const originRejection = rejectCrossOriginRequest(request);
  if (originRejection) return originRejection;
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Entre como candidato para gerenciar suas candidaturas." }, { status: 401 });
  const { id } = await context.params;
  const result = await hideApplication(user.id, id);
  if (!result.ok) return NextResponse.json({ message: result.message }, { status: result.status });
  return NextResponse.json({ ok: true });
}
