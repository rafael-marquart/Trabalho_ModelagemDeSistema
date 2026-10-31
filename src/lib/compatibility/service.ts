import { prisma } from "@/lib/prisma";
import { transportModes } from "@/lib/candidate-profile/options";
import { toEducationList, toExperienceList, toLanguageList, toStringList, toWorkPreferences } from "@/lib/candidate-profile/schema";
import { rowToFields, todayInBrazil } from "@/lib/jobs/schema";
import { RULES_VERSION } from "./constants";
import { fingerprint } from "./fingerprint";
import { nextPeakDeparture, PEAK_LABEL, PEAK_POLICY } from "./peak";
import { normalizeText } from "./text";
import { analyze, evaluateCriticalLock, travelRequired } from "./engine";
import { createDbQuotaGuard } from "./quota";
import { createHereEstimator, type TravelEstimator } from "./travel";
import type { AnalysisInput, AnalysisOutcome, CandidateInput, JobInput, TravelInput } from "./types";

export type CompatibilityView = AnalysisOutcome & { id: string; executedAt: string; rulesVersion: string; jobId: string };
export type ServiceResult = { error: { status: number; message: string } } | { view: CompatibilityView };

let estimator: TravelEstimator | null = null;
const defaultEstimator = () => (estimator ??= createHereEstimator({ quota: createDbQuotaGuard(prisma) }));

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
  if (!mode) return { status: "UNAVAILABLE", reason: "Meio de transporte não informado.", responsible: "CANDIDATE" };
  const home = addresses.candidate;
  if (!home.address || !home.city || !home.state) return { status: "UNAVAILABLE", reason: "Endereço do candidato incompleto (rua, cidade e estado).", responsible: "CANDIDATE" };
  if (!job.locationAddress || !job.locationCity || !job.locationState) return { status: "UNAVAILABLE", reason: "Endereço do local de trabalho da vaga não informado.", responsible: "COMPANY" };
  const origin = `${home.address}, ${home.city}, ${home.state}, Brasil`;
  const destination = `${job.locationAddress}, ${job.locationCity}, ${job.locationState}, Brasil`;
  // A trip is estimated once and saved; it is reused until an address or the means of transport changes (29/10/2026).
  // Only a hash of the addresses is stored, never the addresses themselves.
  const key = fingerprint({ policy: PEAK_POLICY, origin: normalizeText(origin), destination: normalizeText(destination), mode });
  const saved = await prisma.travelTimeCache.findUnique({ where: { key } });
  if (saved) return { status: "OK", minutes: saved.minutes, mode, method: saved.method, departure: PEAK_LABEL };
  const estimate = await estimatorToUse.estimate({ origin, destination, mode, departureTime: nextPeakDeparture() });
  if (estimate.status === "OK") {
    await prisma.travelTimeCache.upsert({ where: { key }, create: { key, minutes: estimate.minutes, method: estimate.method }, update: {} });
    return { ...estimate, departure: PEAK_LABEL };
  }
  const responsible = estimate.responsible ?? "PLATFORM";
  return estimate.permanent ? { status: "UNAVAILABLE", reason: estimate.reason, responsible } : { status: "UNAVAILABLE", reason: estimate.reason, transient: true, responsible };
}

type CandidateContext = { candidate: CandidateInput; home: { city: string; state: string; address: string } };
type AnalyzableJob = Parameters<typeof rowToFields>[0];
type Deps = { estimator?: TravelEstimator; now?: Date };

export async function loadCandidateContext(userId: string): Promise<CandidateContext> {
  const profile = await prisma.candidateProfile.findUnique({ where: { userId } });
  const codes = toStringList(profile?.accessibilityNeedOptionCodes);
  const options = codes.length ? await prisma.accessibilityNeedOption.findMany({ where: { code: { in: codes } }, select: { code: true, name: true, isMandatory: true } }) : [];
  const preferences = toWorkPreferences(profile?.workPreferences);
  const candidateMandatory = toStringList(profile?.mandatoryNeedOptionCodes);
  return {
    candidate: {
      accessibilityDeclaration: profile?.accessibilityDeclaration ?? "NOT_INFORMED",
      // Eliminatory when the candidate marks it as indispensable, or when the catalog marks the option as mandatory for everyone.
      needs: options.map((option) => ({ code: option.code, name: option.name, mandatory: option.isMandatory || candidateMandatory.includes(option.code) })),
      hasFreeTextNeeds: toStringList(profile?.accessibilityNeeds).length > 0,
      education: toEducationList(profile?.education), languages: toLanguageList(profile?.languages),
      experience: toExperienceList(profile?.professionalExperience),
      courses: toStringList(profile?.courses), certifications: toStringList(profile?.certifications), skills: [],
      workPreferences: preferences
    },
    home: { city: preferences.city, state: preferences.state, address: preferences.address }
  };
}

const sameOutcome = (stored: unknown, outcome: AnalysisOutcome) => JSON.stringify(stored) === JSON.stringify(JSON.parse(JSON.stringify(outcome)));

/**
 * Analyzes one job for a loaded candidate. D-01: when the inputs (fingerprint) are unchanged and the stored result did not
 * depend on a transient provider failure, the latest stored result is returned without calling HERE or writing a row;
 * a new immutable row is written only when the inputs or the outcome change.
 */
export async function analyzeWithContext(userId: string, context: CandidateContext, jobRow: AnalyzableJob, transportMode: string | undefined, deps: Deps = {}): Promise<CompatibilityView> {
  const { candidate, home } = context;
  const fields = rowToFields(jobRow);
  const job: JobInput = { modality: fields.modality, accessibility: fields.accessibility, criteria: fields.technicalCriteria };
  const mode = transportMode || candidate.workPreferences.transportMode;
  const inputHash = fingerprint({
    rules: RULES_VERSION, candidate, home, mode,
    job: { ...job, city: fields.locationCity, state: fields.locationState, address: fields.locationAddress }
  });
  const latest = await prisma.compatibilityResult.findFirst({ where: { candidateUserId: userId, jobId: jobRow.id }, orderBy: [{ executedAt: "desc" }, { id: "desc" }] });
  const latestTransient = Boolean((latest?.snapshot as { travel?: { transient?: boolean } } | null)?.travel?.transient);
  if (latest && latest.inputHash === inputHash && !latestTransient) return toView(latest);

  // The route is only requested when no critical barrier already decides the outcome (saves provider quota).
  const locked = evaluateCriticalLock(candidate, job).length > 0;
  const travel: TravelInput = locked ? { status: "NOT_REQUESTED" }
    : await resolveTravel(candidate, { ...fields, modality: fields.modality }, transportMode, deps.estimator ?? defaultEstimator(), { candidate: home });
  const input: AnalysisInput = { candidate, job, travel };
  const outcome = analyze(input);
  if (latest && latest.inputHash === inputHash && sameOutcome(latest.outcome, outcome)) return toView(latest);
  const row = await prisma.compatibilityResult.create({
    data: {
      candidateUserId: userId, jobId: jobRow.id, rulesVersion: RULES_VERSION, status: outcome.status, score: outcome.score, inputHash,
      snapshot: JSON.parse(JSON.stringify(minimizedSnapshot(input))), outcome: JSON.parse(JSON.stringify(outcome))
    }
  });
  return toView(row);
}

export async function analyzeCandidateForJob(
  params: { userId: string; jobId: string; transportMode?: string },
  deps: Deps = {}
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
  const context = await loadCandidateContext(params.userId);
  return { view: await analyzeWithContext(params.userId, context, jobRow, params.transportMode, deps) };
}

/** Recomputes from a stored snapshot with the same rules, to explain or audit a past result (SPEC-007 section 6.2). */
export function reproduce(snapshot: unknown): AnalysisOutcome {
  return analyze(snapshot as AnalysisInput);
}
