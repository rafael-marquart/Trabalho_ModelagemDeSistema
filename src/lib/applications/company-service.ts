import { prisma } from "@/lib/prisma";
import { toEducationList, toExperienceList, toLanguageList, toStringList } from "@/lib/candidate-profile/schema";
import { canMove, FUNNEL_ORDER, kindLabels, knownBlockingIssues, moveKind, RECRUITER_TRANSITIONS, type Stage } from "./funnel";
import { stageLabels } from "./stages";
import { enqueueStageChanged, kickNotificationDelivery } from "@/lib/notifications/service";

// SPEC-013: the company side of applications. Every read and write is scoped to the company resolved from the session
// (company account or recruiter with an active link); the client never chooses the company.

type Outcome = { dimensions?: Record<"A" | "T" | "D", { status: string; score: number | null }> };

export async function listJobApplications(companyId: string, jobId: string) {
  const job = await prisma.job.findFirst({ where: { id: jobId, companyId }, select: { id: true, title: true, status: true } });
  if (!job) return null;
  const rows = await prisma.application.findMany({
    where: { jobId },
    orderBy: [{ appliedAt: "asc" }, { id: "asc" }],
    select: { id: true, appliedAt: true, stage: true, score: true, candidate: { select: { fullName: true } } }
  });
  const counts = Object.fromEntries(FUNNEL_ORDER.map((stage) => [stage, rows.filter((row) => row.stage === stage).length])) as Record<Stage, number>;
  return {
    job: { id: job.id, title: job.title || "Vaga sem título", status: job.status },
    counts,
    applications: rows.map((row) => ({
      id: row.id, candidateName: row.candidate.fullName, appliedAt: row.appliedAt.toISOString(),
      stage: row.stage, stageLabel: stageLabels[row.stage], score: row.score
    }))
  };
}

/**
 * What the company sees about one application (OPEN-055): contact name and e-mail, the professional profile, the
 * compatibility summary registered with the application, and only the accessibility information needed to prepare the
 * process (catalog needs and indispensable resources). Free-text accessibility descriptions, documents, CPF and any
 * medical information are never returned.
 */
export async function getApplicationForCompany(companyId: string, applicationId: string) {
  const row = await prisma.application.findFirst({
    where: { id: applicationId, job: { companyId } },
    include: {
      job: { select: { id: true, title: true } },
      candidate: { select: { id: true, fullName: true, email: true } },
      compatibilityResult: { select: { outcome: true } },
      stageEvents: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] }
    }
  });
  if (!row) return null;
  const profile = await prisma.candidateProfile.findUnique({ where: { userId: row.candidateUserId } });
  const needCodes = toStringList(profile?.accessibilityNeedOptionCodes);
  const needs = needCodes.length ? await prisma.accessibilityNeedOption.findMany({ where: { code: { in: needCodes } }, select: { name: true } }) : [];
  const actorIds = [...new Set(row.stageEvents.map((event) => event.actorUserId).filter((id): id is string => Boolean(id)))];
  const actors = actorIds.length ? await prisma.user.findMany({ where: { id: { in: actorIds } }, select: { id: true, fullName: true, role: true } }) : [];
  const actorName = (id: string | null) => {
    const actor = actors.find((item) => item.id === id);
    if (!actor) return "Sistema";
    return actor.role === "CANDIDATE" ? `${actor.fullName} (candidato)` : actor.fullName;
  };
  const outcome = (row.compatibilityResult.outcome ?? {}) as Outcome;
  const stage = row.stage as Stage;
  return {
    id: row.id,
    job: { id: row.job.id, title: row.job.title || "Vaga sem título" },
    candidate: { fullName: row.candidate.fullName, email: row.candidate.email },
    appliedAt: row.appliedAt.toISOString(),
    stage, stageLabel: stageLabels[stage],
    score: row.score,
    dimensions: (["A", "T", "D"] as const).map((code) => ({ code, status: outcome.dimensions?.[code]?.status ?? "INSUFFICIENT", score: outcome.dimensions?.[code]?.score ?? null })),
    profile: {
      education: toEducationList(profile?.education), experience: toExperienceList(profile?.professionalExperience),
      languages: toLanguageList(profile?.languages), courses: toStringList(profile?.courses), certifications: toStringList(profile?.certifications),
      links: toStringList(profile?.professionalLinks)
    },
    accessibility: {
      declaration: profile?.accessibilityDeclaration ?? "NOT_INFORMED",
      needs: needs.map((need) => need.name),
      essentialResources: toStringList(profile?.essentialAccessibilityResources)
    },
    history: row.stageEvents.map((event) => ({
      at: event.createdAt.toISOString(), from: event.fromStage ? stageLabels[event.fromStage] : null, to: stageLabels[event.toStage],
      kind: kindLabels[event.kind] ?? event.kind, actor: actorName(event.actorUserId), note: event.note
    })),
    nextStages: RECRUITER_TRANSITIONS[stage].map((to) => ({ stage: to, label: stageLabels[to] })),
    blockingIssues: knownBlockingIssues()
  };
}

export type StageChangeResult = { ok: true; stage: Stage } | { ok: false; status: number; message: string };

/**
 * Moves an application to another funnel stage (OPEN-054/056). Only transitions of RB-39 are accepted, the stage must
 * still be the one the recruiter saw, and no known blocking issue may exist. The stage, the history event and the
 * audit entry are written together; a refusal changes nothing.
 */
export async function changeApplicationStage(params: { companyId: string; actorUserId: string; applicationId: string; toStage: Stage; note?: string }): Promise<StageChangeResult> {
  const application = await prisma.application.findFirst({
    where: { id: params.applicationId, job: { companyId: params.companyId } },
    select: { id: true, stage: true, jobId: true, candidateUserId: true, job: { select: { title: true, company: { select: { tradeName: true, legalName: true } } } } }
  });
  if (!application) return { ok: false, status: 404, message: "Candidatura não encontrada." };
  const from = application.stage as Stage;
  if (!canMove(from, params.toStage)) {
    return { ok: false, status: 409, message: `Não é possível mover uma candidatura de ${stageLabels[from]} para ${stageLabels[params.toStage]}.` };
  }
  const issues = knownBlockingIssues();
  if (issues.length) return { ok: false, status: 409, message: `A etapa não foi alterada: ${issues.join("; ")}` };
  const note = params.note?.trim() || null;
  const moved = await prisma.$transaction(async (tx) => {
    const changed = await tx.application.updateMany({ where: { id: application.id, stage: from }, data: { stage: params.toStage } });
    if (changed.count !== 1) return false;
    await tx.applicationStageEvent.create({
      data: { applicationId: application.id, fromStage: from, toStage: params.toStage, kind: moveKind(params.toStage), actorUserId: params.actorUserId, note }
    });
    await tx.auditEvent.create({
      data: {
        actorUserId: params.actorUserId, eventType: "APPLICATION_STAGE_CHANGED", subjectType: "Application", subjectId: application.id,
        metadata: { jobId: application.jobId, companyId: params.companyId, fromStage: from, toStage: params.toStage }
      }
    });
    // SPEC-017: the candidate is told about every move (advance, refusal, hiring).
    await enqueueStageChanged(tx, {
      applicationId: application.id, jobId: application.jobId, candidateUserId: application.candidateUserId, toStage: params.toStage,
      jobTitle: application.job.title || "Vaga sem título", companyName: application.job.company.tradeName || application.job.company.legalName
    });
    return true;
  });
  if (!moved) return { ok: false, status: 409, message: "A etapa desta candidatura mudou enquanto você operava. Atualize a página e tente de novo." };
  kickNotificationDelivery();
  return { ok: true, stage: params.toStage };
}
