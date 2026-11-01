import { prisma } from "@/lib/prisma";
import { infrastructureItems, statusLabels } from "@/lib/company-infrastructure/items";
import { categoryLabel, getCompanyInfrastructure } from "@/lib/company-infrastructure/service";
import { analyzeWithContext, loadCandidateContext, type CompatibilityView } from "@/lib/compatibility/service";
import type { TravelEstimator } from "@/lib/compatibility/travel";
import { jobModalityLabels, type JobModalityValue } from "./constants";
import { availabilityOf, decideAction, formatDate, locationText, salaryText, type ActionDecision, type Availability } from "./detail";
import { rowToFields, todayInBrazil } from "./schema";
import { findApplicationResult, findBlockingApplication } from "@/lib/applications/service";

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
  jobId: string;
};

/**
 * SPEC-010: what a candidate may see about a published own job (external ones depend on SPEC-006). Drafts are not visible;
 * paused and closed jobs are shown with their status and blocked actions. No internal identifiers, contacts or other
 * candidates' data are returned. Compatibility comes from SPEC-007 (reused when nothing changed) only while the job is open.
 */
export async function getJobDetailForCandidate(userId: string, jobId: string, deps: { estimator?: TravelEstimator; now?: Date } = {}): Promise<JobDetail | null> {
  const row = await prisma.job.findFirst({
    where: { id: jobId, origin: "OWN", status: { in: ["OPEN", "PAUSED", "CLOSED"] } },
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
  const infrastructure = await getCompanyInfrastructure(row.companyId);
  const existing = await findBlockingApplication(userId, jobId);
  return {
    jobId: row.id,
    title: fields.title || "Vaga sem título",
    companyName: row.company.tradeName || row.company.legalName,
    description: fields.description || "Não informada",
    requirements: fields.requirements || "Não informados",
    criteria: fields.technicalCriteria,
    modality: fields.modality ? jobModalityLabels[fields.modality as JobModalityValue] : "Não informada",
    professionalArea: fields.professionalArea || "Não informada",
    location: locationText(fields.locationCity, fields.locationState, fields.locationAddress),
    salary: salaryText(fields.salaryMin, fields.salaryMax),
    deadline: fields.deadline ? formatDate(fields.deadline) : "Não informado",
    origin: "Publicada pela empresa no Acessa Vagas",
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
    action: decideAction(availability, compatibility, existing),
    applicationId: existing?.id ?? null
  };
}
