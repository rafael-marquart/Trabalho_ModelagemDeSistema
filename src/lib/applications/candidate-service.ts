import { prisma } from "@/lib/prisma";
import { ACTIVE_STAGES } from "@/lib/jobs/applications";
import { candidateStageLabels, stageLabels } from "./stages";
import { enqueueApplicationCancelled, kickNotificationDelivery } from "@/lib/notifications/service";

// SPEC-012 and SPEC-016: the candidate's side of their own applications. Every read and write is scoped to the user of
// the session; another person's application is reported exactly like one that does not exist.

/** OPEN-065: after the application is cancelled or the job is closed, the history stays visible for 60 days. */
export const HISTORY_VISIBLE_DAYS = 60;
const DAY_MS = 24 * 60 * 60 * 1000;

type ActiveStage = (typeof ACTIVE_STAGES)[number];
const isActive = (stage: string): stage is ActiveStage => (ACTIVE_STAGES as readonly string[]).includes(stage);

export type TimelineEvent = { date: string; type: "SUBMITTED" | "STATUS" | "CANCELLED"; title: string; description: string; resultingStage: string };

/**
 * Translates the stored stage events into the candidate's timeline (OPEN-051): "Candidatura realizada", "Status" and
 * "Candidatura cancelada", most recent first. Who moved the application and any internal note are never included.
 */
export function toTimeline(events: { createdAt: Date; toStage: string; kind: string }[]): TimelineEvent[] {
  return [...events]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .map((event) => {
      const stage = candidateStageLabels[event.toStage] ?? event.toStage;
      const date = event.createdAt.toISOString();
      if (event.kind === "SUBMITTED") return { date, type: "SUBMITTED", title: "Candidatura realizada", description: "Registro inicial da candidatura à vaga.", resultingStage: stage };
      if (event.kind === "CANCELLED") return { date, type: "CANCELLED", title: "Candidatura cancelada", description: "Você confirmou o cancelamento. O registro e o histórico foram preservados.", resultingStage: stage };
      const description = event.kind === "HIRED" ? "A empresa registrou a aprovação da sua candidatura."
        : event.kind === "REJECTED" ? "A empresa encerrou a sua participação neste processo seletivo."
        : `A candidatura avançou para a etapa ${stageLabels[event.toStage] ?? stage} do processo seletivo.`;
      return { date, type: "STATUS", title: `Status: ${stage}`, description, resultingStage: stage };
    });
}

type Row = {
  stage: string; updatedAt: Date;
  job: { status: string; closedAt: Date | null };
  stageEvents: { createdAt: Date; kind: string }[];
};

/** The date the 60 days start: the cancellation or the job closure, whichever happened first (OPEN-065). */
export function historyEndsAt(row: Row): Date | null {
  const dates: Date[] = [];
  if (row.stage === "CANCELADA") dates.push(row.stageEvents.find((event) => event.kind === "CANCELLED")?.createdAt ?? row.updatedAt);
  if (row.job.status === "CLOSED") dates.push(row.job.closedAt ?? row.updatedAt);
  if (!dates.length) return null;
  return new Date(Math.min(...dates.map((date) => date.getTime())));
}

export const visibleUntil = (row: Row) => {
  const end = historyEndsAt(row);
  return end ? new Date(end.getTime() + HISTORY_VISIBLE_DAYS * DAY_MS) : null;
};
const isVisible = (row: Row, now: Date) => { const until = visibleUntil(row); return !until || now < until; };

/**
 * The application can be cancelled while active (RB-36, OPEN-050). Revised 01/11/2026: the company may keep working
 * the funnel after closing the job, so on a closed job the candidate can still cancel up to the interview stage
 * (Inscrito, Triagem, Entrevista); a Finalista on a closed job can no longer cancel.
 */
const CANCELLABLE_AFTER_CLOSE = ["INSCRITO", "TRIAGEM", "ENTREVISTA"];
const CLOSED_MESSAGE = "Com a vaga encerrada, a candidatura só pode ser cancelada até a etapa de entrevista.";

export function cancellationBlock(stage: string, jobStatus: string): string | null {
  if (stage === "CANCELADA") return "Esta candidatura já foi cancelada.";
  if (!isActive(stage)) return `Uma candidatura ${candidateStageLabels[stage]?.toLocaleLowerCase("pt-BR") ?? "encerrada"} não pode ser cancelada.`;
  if (jobStatus === "CLOSED" && !CANCELLABLE_AFTER_CLOSE.includes(stage)) return CLOSED_MESSAGE;
  return null;
}

const jobSelect = { id: true, title: true, status: true, closedAt: true, company: { select: { tradeName: true, legalName: true } } } as const;
const companyName = (company: { tradeName: string | null; legalName: string }) => company.tradeName || company.legalName;

export async function listCandidateApplications(userId: string, now: Date = new Date()) {
  const rows = await prisma.application.findMany({
    where: { candidateUserId: userId, hiddenByCandidateAt: null },
    orderBy: [{ appliedAt: "desc" }, { id: "desc" }],
    select: {
      id: true, stage: true, appliedAt: true, updatedAt: true, job: { select: jobSelect },
      stageEvents: { where: { kind: "CANCELLED" }, select: { createdAt: true, kind: true } }
    }
  });
  return rows.filter((row) => isVisible(row, now)).map((row) => ({
    id: row.id, appliedAt: row.appliedAt.toISOString(), stage: row.stage, stageLabel: candidateStageLabels[row.stage] ?? row.stage,
    job: { id: row.job.id, title: row.job.title || "Vaga sem título", companyName: companyName(row.job.company), closed: row.job.status === "CLOSED" },
    canHide: HIDEABLE.includes(row.stage)
  }));
}

export async function getCandidateApplication(userId: string, applicationId: string, now: Date = new Date()) {
  const row = await prisma.application.findFirst({
    where: { id: applicationId, candidateUserId: userId, hiddenByCandidateAt: null },
    select: {
      id: true, stage: true, appliedAt: true, updatedAt: true, job: { select: jobSelect },
      stageEvents: { select: { createdAt: true, kind: true, toStage: true }, orderBy: [{ createdAt: "asc" }, { id: "asc" }] }
    }
  });
  if (!row || !isVisible(row, now)) return null;
  const until = visibleUntil(row);
  const block = cancellationBlock(row.stage, row.job.status);
  return {
    id: row.id,
    appliedAt: row.appliedAt.toISOString(),
    stage: row.stage, stageLabel: candidateStageLabels[row.stage] ?? row.stage,
    job: {
      id: row.job.id, title: row.job.title || "Vaga sem título", companyName: companyName(row.job.company),
      status: row.job.status, closedAt: row.job.status === "CLOSED" ? (row.job.closedAt ?? row.updatedAt).toISOString() : null
    },
    timeline: toTimeline(row.stageEvents),
    canCancel: block === null,
    canHide: HIDEABLE.includes(row.stage),
    historyVisibleUntil: until ? until.toISOString() : null
  };
}

/** Decision of 01/11/2026: refused and cancelled applications can leave the candidate's list before the 60 days. */
const HIDEABLE = ["RECUSADA", "CANCELADA"];

/**
 * Hides one of the candidate's own refused or cancelled applications from "Minhas candidaturas". Nothing is deleted: the
 * record, its history, the audit and the company's funnel stay as they are. The hiding itself is audited.
 */
export async function hideApplication(userId: string, applicationId: string): Promise<{ ok: true } | { ok: false; status: number; message: string }> {
  const row = await prisma.application.findFirst({ where: { id: applicationId, candidateUserId: userId, hiddenByCandidateAt: null }, select: { id: true, stage: true, jobId: true } });
  if (!row) return { ok: false, status: 404, message: "Candidatura não encontrada." };
  if (!HIDEABLE.includes(row.stage)) return { ok: false, status: 409, message: "Só candidaturas recusadas ou canceladas podem ser removidas da lista." };
  const done = await prisma.$transaction(async (tx) => {
    const changed = await tx.application.updateMany({
      where: { id: row.id, candidateUserId: userId, hiddenByCandidateAt: null, stage: { in: HIDEABLE as ("RECUSADA" | "CANCELADA")[] } },
      data: { hiddenByCandidateAt: new Date() }
    });
    if (changed.count !== 1) return false;
    await tx.auditEvent.create({ data: { actorUserId: userId, eventType: "APPLICATION_HIDDEN_BY_CANDIDATE", subjectType: "Application", subjectId: row.id, metadata: { jobId: row.jobId, stage: row.stage } } });
    return true;
  });
  return done ? { ok: true } : { ok: false, status: 409, message: "A candidatura mudou enquanto você confirmava. Atualize a página." };
}

export type CancelResult = { ok: true; stage: "CANCELADA" } | { ok: false; status: number; message: string };

/**
 * SPEC-012: cancels the candidate's own application after the explicit confirmation. Ownership, stage and job status
 * are read again here; the stage only changes if it is still the one just read, and the stage, the history event and
 * the audit entry are written together. A refusal changes nothing.
 */
export async function cancelApplication(userId: string, applicationId: string): Promise<CancelResult> {
  const row = await prisma.application.findFirst({
    where: { id: applicationId, candidateUserId: userId }, select: { id: true, stage: true, jobId: true, job: { select: { status: true } }, candidate: { select: { fullName: true } } }
  });
  if (!row) return { ok: false, status: 404, message: "Candidatura não encontrada." };
  const block = cancellationBlock(row.stage, row.job.status);
  if (block) return { ok: false, status: 409, message: block };
  const from = row.stage;
  const done = await prisma.$transaction(async (tx) => {
    const job = await tx.job.findFirst({ where: { id: row.jobId }, select: { status: true } });
    if (!job || cancellationBlock(from, job.status)) return "CLOSED" as const;
    const changed = await tx.application.updateMany({ where: { id: row.id, candidateUserId: userId, stage: from }, data: { stage: "CANCELADA" } });
    if (changed.count !== 1) return "CHANGED" as const;
    await tx.applicationStageEvent.create({ data: { applicationId: row.id, fromStage: from, toStage: "CANCELADA", kind: "CANCELLED", actorUserId: userId } });
    await tx.auditEvent.create({
      data: { actorUserId: userId, eventType: "APPLICATION_CANCELLED", subjectType: "Application", subjectId: row.id, metadata: { jobId: row.jobId, fromStage: from, toStage: "CANCELADA" } }
    });
    // SPEC-017: the recruiter responsible for the job is told (OPEN-066, item 4).
    await enqueueApplicationCancelled(tx, { applicationId: row.id, jobId: row.jobId, candidateName: row.candidate.fullName });
    return "OK" as const;
  });
  if (done === "CLOSED") return { ok: false, status: 409, message: CLOSED_MESSAGE };
  if (done === "CHANGED") return { ok: false, status: 409, message: "A etapa desta candidatura mudou enquanto você confirmava. Atualize a página e confira a situação atual." };
  kickNotificationDelivery();
  return { ok: true, stage: "CANCELADA" };
}
