import { prisma } from "@/lib/prisma";
import { infrastructureItems, statusLabels } from "@/lib/company-infrastructure/items";
import { categoryLabel, getCompanyInfrastructure } from "@/lib/company-infrastructure/service";
import { analyzeWithContext, loadCandidateContext, type CompatibilityView } from "@/lib/compatibility/service";
import type { TravelEstimator } from "@/lib/compatibility/travel";
import { jobModalityLabels, type JobModalityValue } from "./constants";
import { availabilityOf, decideAction, formatDate, locationText, salaryText, type ActionDecision, type Availability } from "./detail";
import { rowToFields, todayInBrazil } from "./schema";
import { findApplicationResult, findBlockingApplication } from "@/lib/applications/service";
import { getPublicRating, type PublicRating } from "@/lib/public-rating/service";
import { jobCompanyName } from "./company-name";
import { sourceLabel } from "@/lib/external-jobs/labels";

const label = (status: string) => statusLabels[status as keyof typeof statusLabels] ?? statusLabels.NOT_INFORMED;

export type JobDetail = {
  title: string; companyName: string; description: string; requirements: string;
  criteria: { skills: string[]; experience: string[]; educationMinLevel: string; languages: { language: string; level: string }[] };
  modality: string; professionalArea: string; location: string; salary: string; deadline: string; origin: string;
  availability: Availability;
  jobAccessibility: { label: string; status: string; statusLabel: string }[];
  companyInfrastructure: { updatedAt: string | null; items: { category: string; label: string; status: string; statusLabel: string; note: string }[] };
  compatibility: CompatibilityView | null;
  // Set when the result shown is the one registered with the application (job no longer open): the application date.
  compatibilityFromApplication: string | null;
  action: ActionDecision;
  // The candidate's application that still counts for this job (in progress or approved), to link to its detail (SPEC-012).
  applicationId: string | null;
  // SPEC-021: the company's public note (distribution of valid evaluations by number of stars).
  publicRating: PublicRating | null;
  // SPEC-006: link to the original ad and the source's name; null for jobs published by a company in the platform.
  external: { sourceName: string; url: string } | null;
  jobId: string;
};

/**
 * SPEC-010: what a candidate may see about a published job, own or external (SPEC-006). Drafts are not visible;
 * paused and closed jobs are shown with their status and blocked actions. No internal identifiers, contacts or other
 * candidates' data are returned. Compatibility comes from SPEC-007 (reused when nothing changed) only while the job is open.
 */
export async function getJobDetailForCandidate(userId: string, jobId: string, deps: { estimator?: TravelEstimator; now?: Date } = {}): Promise<JobDetail | null> {
  const row = await prisma.job.findFirst({
    where: { id: jobId, origin: { in: ["OWN", "EXTERNAL"] }, status: { in: ["OPEN", "PAUSED", "CLOSED"] } },
    include: { company: { select: { tradeName: true, legalName: true } } }
  });
  if (!row) return null;
  const fields = rowToFields(row);
  const availability = availabilityOf(row.status, fields.deadline, todayInBrazil(deps.now));
  let compatibility: CompatibilityView | null = null;
  let compatibilityFromApplication: string | null = null;
  if (availability.code === "OPEN") {
    compatibility = await analyzeWithContext(userId, await loadCandidateContext(userId), row, undefined, deps);
  } else {
    // A candidate who applied keeps seeing the result registered with the application (decision of 31/10/2026).
    const registered = await findApplicationResult(userId, jobId);
    if (registered) { compatibility = registered.result; compatibilityFromApplication = registered.appliedAt; }
  }
  // External jobs have no company account: no infrastructure, public note or application inside the platform.
  const external = row.origin === "EXTERNAL" && row.externalUrl ? { sourceName: sourceLabel(row.externalSource), url: row.externalUrl } : null;
  const [infrastructure, publicRating] = row.companyId
    ? await Promise.all([getCompanyInfrastructure(row.companyId), getPublicRating(row.companyId)])
    : [{ updatedAt: null, items: [] }, null];
  const existing = external ? null : await findBlockingApplication(userId, jobId);
  const action = external
    ? { allowed: false, message: `Esta vaga foi publicada fora do Acessa Vagas. A candidatura é feita no anúncio original, no ${external.sourceName}.` }
    : decideAction(availability, compatibility, existing);
  return {
    jobId: row.id,
    publicRating,
    external,
    title: fields.title || "Vaga sem título",
    companyName: jobCompanyName(row.company, row.externalCompanyName),
    description: fields.description || "Não informada",
    requirements: fields.requirements || "Não informados",
    criteria: fields.technicalCriteria,
    modality: fields.modality ? jobModalityLabels[fields.modality as JobModalityValue] : "Não informada",
    professionalArea: fields.professionalArea || "Não informada",
    location: locationText(fields.locationCity, fields.locationState, fields.locationAddress),
    salary: salaryText(fields.salaryMin, fields.salaryMax),
    deadline: fields.deadline ? formatDate(fields.deadline) : "Não informado",
    origin: external ? `Vaga externa, encontrada no ${external.sourceName}` : "Publicada pela empresa no Acessa Vagas",
    availability,
    jobAccessibility: infrastructureItems.map((item) => {
      const status = fields.accessibility[item.code] ?? "NOT_INFORMED";
      return { label: item.label, status, statusLabel: label(status) };
    }),
    companyInfrastructure: {
      updatedAt: infrastructure.updatedAt,
      items: infrastructure.items.map((item) => ({ category: categoryLabel(item.category), label: item.label, status: item.status, statusLabel: label(item.status), note: item.note }))
    },
    compatibility,
    compatibilityFromApplication,
    action,
    applicationId: existing?.id ?? null
  };
}
