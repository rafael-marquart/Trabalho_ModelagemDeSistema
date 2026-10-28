import { prisma } from "@/lib/prisma";
import { transportModes } from "@/lib/candidate-profile/options";
import { toEducationList, toExperienceList, toLanguageList, toStringList, toWorkPreferences } from "@/lib/candidate-profile/schema";
import { rowToFields, todayInBrazil } from "@/lib/jobs/schema";
import { RULES_VERSION } from "./constants";
import { analyze, evaluateCriticalLock, travelRequired } from "./engine";
import { createHereEstimator, type TravelEstimator } from "./travel";
import type { AnalysisInput, AnalysisOutcome, CandidateInput, JobInput, TravelInput } from "./types";

export type CompatibilityView = AnalysisOutcome & { id: string; executedAt: string; rulesVersion: string; jobId: string };
export type ServiceResult = { error: { status: number; message: string } } | { view: CompatibilityView };

let estimator: TravelEstimator | null = null;
const defaultEstimator = () => (estimator ??= createHereEstimator());

/** Keeps only what the calculation used: no residential address or location data is copied into the history (OPEN-035). */
function minimizedSnapshot(input: AnalysisInput): AnalysisInput {
  return {
    ...input,
    candidate: { ...input.candidate, workPreferences: { modalities: input.candidate.workPreferences.modalities, city: "", state: "", address: "", transportMode: input.candidate.workPreferences.transportMode } }
  };
}

export function toView(row: { id: string; executedAt: Date; rulesVersion: string; jobId: string; outcome: unknown }): CompatibilityView {
  return { ...(row.outcome as AnalysisOutcome), id: row.id, executedAt: row.executedAt.toISOString(), rulesVersion: row.rulesVersion, jobId: row.jobId };
}

async function resolveTravel(
  candidate: CandidateInput, job: { modality: JobInput["modality"]; locationCity: string; locationState: string; locationAddress: string },
  override: string | undefined, estimatorToUse: TravelEstimator, addresses: { candidate: { city: string; state: string; address: string } }
): Promise<TravelInput> {
  if (!travelRequired(job)) return { status: "NOT_REQUESTED" };
  const mode = override || candidate.workPreferences.transportMode;
  if (!mode) return { status: "UNAVAILABLE", reason: "Meio de transporte não informado." };
  const home = addresses.candidate;
  if (!home.address || !home.city || !home.state) return { status: "UNAVAILABLE", reason: "Endereço do candidato incompleto (rua, cidade e estado)." };
  if (!job.locationAddress || !job.locationCity || !job.locationState) return { status: "UNAVAILABLE", reason: "Endereço do local de trabalho da vaga não informado." };
  return estimatorToUse.estimate({
    origin: `${home.address}, ${home.city}, ${home.state}, Brasil`,
    destination: `${job.locationAddress}, ${job.locationCity}, ${job.locationState}, Brasil`,
    mode
  });
}

export async function analyzeCandidateForJob(
  params: { userId: string; jobId: string; transportMode?: string },
  deps: { estimator?: TravelEstimator; now?: Date } = {}
): Promise<ServiceResult> {
  if (params.transportMode && !(transportModes as readonly string[]).includes(params.transportMode)) {
    return { error: { status: 400, message: "Meio de transporte inválido." } };
  }
  const today = todayInBrazil(deps.now);
  const jobRow = await prisma.job.findFirst({ where: { id: params.jobId, status: "OPEN", origin: "OWN" } });
  // Only published, own jobs still open for applications are analyzed; external jobs must first be validated (SPEC-006).
  if (!jobRow || (jobRow.deadline && jobRow.deadline.toISOString().slice(0, 10) < today)) {
    return { error: { status: 404, message: "Vaga não disponível para análise." } };
  }
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: params.userId } });
  const codes = toStringList(profile?.accessibilityNeedOptionCodes);
  const options = codes.length ? await prisma.accessibilityNeedOption.findMany({ where: { code: { in: codes } }, select: { code: true, name: true, isMandatory: true } }) : [];
  const preferences = toWorkPreferences(profile?.workPreferences);

  const candidate: CandidateInput = {
    accessibilityDeclaration: profile?.accessibilityDeclaration ?? "NOT_INFORMED",
    needs: options.map((option) => ({ code: option.code, name: option.name, mandatory: option.isMandatory })),
    hasFreeTextNeeds: toStringList(profile?.accessibilityNeeds).length > 0,
    education: toEducationList(profile?.education), languages: toLanguageList(profile?.languages),
    experience: toExperienceList(profile?.professionalExperience),
    courses: toStringList(profile?.courses), certifications: toStringList(profile?.certifications), skills: [],
    workPreferences: preferences
  };
  const fields = rowToFields(jobRow);
  const job: JobInput = { modality: fields.modality, accessibility: fields.accessibility, criteria: fields.technicalCriteria };

  // The route is only requested when no critical barrier already decides the outcome (saves provider quota).
  const locked = evaluateCriticalLock(candidate, job).length > 0;
  const travel: TravelInput = locked ? { status: "NOT_REQUESTED" }
    : await resolveTravel(candidate, { ...fields, modality: fields.modality }, params.transportMode, deps.estimator ?? defaultEstimator(), {
      candidate: { city: preferences.city, state: preferences.state, address: preferences.address }
    });

  const input: AnalysisInput = { candidate, job, travel };
  const outcome = analyze(input);
  const row = await prisma.compatibilityResult.create({
    data: {
      candidateUserId: params.userId, jobId: jobRow.id, rulesVersion: RULES_VERSION, status: outcome.status, score: outcome.score,
      snapshot: JSON.parse(JSON.stringify(minimizedSnapshot(input))), outcome: JSON.parse(JSON.stringify(outcome))
    }
  });
  return { view: toView(row) };
}

/** Recomputes from a stored snapshot with the same rules, to explain or audit a past result (SPEC-007 section 6.2). */
export function reproduce(snapshot: unknown): AnalysisOutcome {
  return analyze(snapshot as AnalysisInput);
}
