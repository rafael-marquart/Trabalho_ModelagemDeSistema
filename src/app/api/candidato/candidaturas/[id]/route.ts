import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCandidateApplication } from "@/lib/applications/candidate-service";

type Context = { params: Promise<{ id: string }> };

/** SPEC-012/016: one of the candidate's own applications — job, current stage and timeline. Others answer 404. */
export async function GET(_request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Entre como candidato para ver suas candidaturas." }, { status: 401 });
  const { id } = await context.params;
  const application = await getCandidateApplication(user.id, id);
  if (!application) return NextResponse.json({ message: "Candidatura não encontrada." }, { status: 404 });
  return NextResponse.json({ application }, { headers: { "Cache-Control": "no-store" } });
}
