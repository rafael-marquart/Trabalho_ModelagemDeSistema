import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { parseSearchParams } from "@/lib/jobs/search";
import { searchJobsForCandidate } from "@/lib/jobs/search-service";

/** SPEC-008: job search for the signed-in candidate, ordered by the compatibility computed for that candidate. */
export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const parsed = parseSearchParams(new URL(request.url).searchParams);
  if (!parsed.success) return NextResponse.json({ message: "Revise a busca e os filtros informados." }, { status: 400 });
  return NextResponse.json(await searchJobsForCandidate(user.id, parsed.data));
}
