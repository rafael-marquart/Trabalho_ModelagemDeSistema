import { prisma } from "@/lib/prisma";
import { infrastructureItems, statusLabels } from "@/lib/company-infrastructure/items";
import { analyzeWithContext, loadCandidateContext, type CompatibilityView } from "@/lib/compatibility/service";
import type { TravelEstimator } from "@/lib/compatibility/travel";
import { todayInBrazil } from "./schema";
import { buildFacets, locationLabel, matchesFilters, matchesText, paginate, sortResults, type Facets, type SearchQuery, type SearchableJob } from "./search";

export type SearchResultJob = {
  id: string; title: string; companyName: string; modality: string; professionalArea: string; location: string; publishedAt: string | null;
  accessibility: { code: string; label: string; status: string; statusLabel: string }[];
  compatibility: CompatibilityView;
};
export type SearchResponse = { jobs: SearchResultJob[]; page: number; pages: number; total: number; hiddenIncompatible: number; facets: Facets };

/**
 * SPEC-008: open own jobs (external ones only after validation, SPEC-006) within the deadline, filtered and searched,
 * analyzed by SPEC-007 for the signed-in candidate. Jobs blocked by a critical barrier are not listed as eligible.
 */
export async function searchJobsForCandidate(userId: string, query: SearchQuery, deps: { estimator?: TravelEstimator; now?: Date } = {}): Promise<SearchResponse> {
  const today = new Date(`${todayInBrazil(deps.now)}T00:00:00.000Z`);
  const rows = await prisma.job.findMany({
    where: { status: "OPEN", origin: "OWN", OR: [{ deadline: null }, { deadline: { gte: today } }] },
    include: { company: { select: { tradeName: true, legalName: true } } },
    orderBy: { id: "asc" }
  });
  const searchable = rows.map((row) => ({
    row,
    job: {
      id: row.id, title: row.title, description: row.description, companyName: row.company.tradeName || row.company.legalName,
      modality: (row.modality ?? "") as SearchableJob["modality"], professionalArea: row.professionalArea,
      locationCity: row.locationCity, locationState: row.locationState, publishedAt: row.publishedAt,
      accessibility: (row.accessibility && typeof row.accessibility === "object" && !Array.isArray(row.accessibility) ? row.accessibility : {}) as Record<string, string>
    } satisfies SearchableJob
  }));
  const facets = buildFacets(searchable.map((entry) => entry.job));
  const candidates = searchable.filter((entry) => matchesText(entry.job, query.q) && matchesFilters(entry.job, query));

  const context = await loadCandidateContext(userId);
  const analyzed: (SearchResultJob & { status: CompatibilityView["status"]; score: number | null; publishedAtDate: Date | null })[] = [];
  let hiddenIncompatible = 0;
  for (const { row, job } of candidates) {
    const compatibility = await analyzeWithContext(userId, context, row, undefined, deps);
    if (compatibility.status === "INCOMPATIBLE") { hiddenIncompatible += 1; continue; }
    analyzed.push({
      id: job.id, title: job.title, companyName: job.companyName, modality: job.modality, professionalArea: job.professionalArea,
      location: locationLabel(job), publishedAt: job.publishedAt ? job.publishedAt.toISOString() : null, publishedAtDate: job.publishedAt,
      accessibility: infrastructureItems.map((item) => {
        const status = job.accessibility[item.code] ?? "NOT_INFORMED";
        return { code: item.code, label: item.label, status, statusLabel: statusLabels[status as keyof typeof statusLabels] ?? statusLabels.NOT_INFORMED };
      }),
      compatibility, status: compatibility.status, score: compatibility.score
    });
  }
  const ordered = sortResults(analyzed.map((item) => ({ ...item, publishedAt: item.publishedAtDate })), query.ordem);
  const page = paginate(ordered, query.pagina);
  return {
    jobs: page.items.map(({ publishedAtDate, status: _status, score: _score, ...item }) => ({ ...item, publishedAt: publishedAtDate ? publishedAtDate.toISOString() : null })),
    page: page.page, pages: page.pages, total: page.total, hiddenIncompatible, facets
  };
}
