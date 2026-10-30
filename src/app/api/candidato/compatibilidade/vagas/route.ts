import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { todayInBrazil } from "@/lib/jobs/schema";

/** Simple list of published jobs for the provisional analysis page (SPEC-007); the search itself is /api/candidato/vagas (SPEC-008). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CANDIDATE" || !user.isActive) return NextResponse.json({ message: "Acesso não autorizado." }, { status: 401 });
  const today = new Date(`${todayInBrazil()}T00:00:00.000Z`);
  const jobs = await prisma.job.findMany({
    where: { status: "OPEN", origin: "OWN", OR: [{ deadline: null }, { deadline: { gte: today } }] },
    orderBy: { publishedAt: "desc" }, take: 50,
    select: { id: true, title: true, modality: true, locationCity: true, locationState: true, deadline: true, company: { select: { tradeName: true, legalName: true } } }
  });
  return NextResponse.json({
    jobs: jobs.map((job) => ({
      id: job.id, title: job.title, modality: job.modality, city: job.locationCity, state: job.locationState,
      deadline: job.deadline ? job.deadline.toISOString().slice(0, 10) : "", company: job.company.tradeName || job.company.legalName
    }))
  });
}
