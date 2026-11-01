import { prisma } from "@/lib/prisma";
import { ratingDistribution } from "@/lib/evaluations/service";

// SPEC-021: the public accessibility note of a company is the distribution of its valid post-interview evaluations by
// number of stars, per criterion (OPEN-082). No average, weights or other score. One valid evaluation is enough
// (OPEN-083); with none, the note is not shown and the page says there is not enough data (OPEN-084). Every stored
// evaluation is valid: it was checked when submitted (SPEC-018) and administrators cannot edit or remove it (OPEN-085).
// A pending report has no effect on the note.

export type StarCounts = Record<1 | 2 | 3 | 4 | 5, number>;
export type PublicRating =
  | { available: false; total: 0 }
  | { available: true; total: number; accessibility: StarCounts; inclusion: StarCounts };

export async function getPublicRating(companyId: string): Promise<PublicRating> {
  const total = await prisma.interviewEvaluation.count({ where: { companyId } });
  if (!total) return { available: false, total: 0 };
  const distribution = await ratingDistribution(companyId);
  return { available: true, total, ...distribution };
}
