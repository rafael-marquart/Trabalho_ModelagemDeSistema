import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { enqueueInterviewNotice, kickNotificationDelivery } from "@/lib/notifications/service";

// SPEC-018 (decision of 01/11/2026): interviews registered in the funnel by the company account or a linked recruiter.
// The company always comes from the session (resolveJobActor); the client never chooses it.

export const modalityLabels = { PRESENCIAL: "Presencial", ONLINE: "On-line" } as const;
export const statusLabels = { SCHEDULED: "Agendada", COMPLETED: "Concluída", CANCELLED: "Cancelada" } as const;

/** "AAAA-MM-DDTHH:mm" typed in the form, read as Brasília time (UTC−3, no daylight saving since 2019). */
export function fromLocalInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00-03:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export const interviewInputSchema = z.object({
  scheduledAt: z.string().refine((value) => fromLocalInput(value) !== null, "Informe data e hora válidas."),
  modality: z.enum(["PRESENCIAL", "ONLINE"], { message: "Escolha a modalidade." }),
  locationOrLink: z.string().trim().min(3, "Informe o endereço ou o link.").max(300, "Use até 300 caracteres."),
  accessibilityResources: z.string().trim().max(1000, "Use até 1000 caracteres.").default("")
}).strict().superRefine((value, ctx) => {
  if (value.modality === "ONLINE" && !/^https?:\/\/\S+$/i.test(value.locationOrLink)) {
    ctx.addIssue({ code: "custom", path: ["locationOrLink"], message: "Para entrevista on-line, informe o link começando com https://." });
  }
});
export type InterviewInput = z.infer<typeof interviewInputSchema>;

type Result = { ok: true; interviewId: string } | { ok: false; status: number; message: string };
const fail = (status: number, message: string): Result => ({ ok: false, status, message });

const applicationOf = (companyId: string, applicationId: string) => prisma.application.findFirst({
  where: { id: applicationId, job: { companyId } },
  select: { id: true, stage: true, jobId: true, candidateUserId: true, job: { select: { title: true, company: { select: { tradeName: true, legalName: true } } } } }
});
type App = NonNullable<Awaited<ReturnType<typeof applicationOf>>>;
const notice = (app: App, interview: { scheduledAt: Date; modality: string; locationOrLink: string; accessibilityResources: string }) => ({
  applicationId: app.id, jobId: app.jobId, candidateUserId: app.candidateUserId,
  jobTitle: app.job.title || "Vaga sem título", companyName: app.job.company.tradeName || app.job.company.legalName,
  scheduledAt: interview.scheduledAt.toISOString(), modality: interview.modality, locationOrLink: interview.locationOrLink,
  accessibilityResources: interview.accessibilityResources
});

/** Schedules an interview for an application in the Entrevista stage; only one scheduled interview at a time. */
export async function scheduleInterview(params: { companyId: string; actorUserId: string; applicationId: string; input: InterviewInput; now?: Date }): Promise<Result> {
  const app = await applicationOf(params.companyId, params.applicationId);
  if (!app) return fail(404, "Candidatura não encontrada.");
  if (app.stage !== "ENTREVISTA") return fail(409, "A entrevista só pode ser agendada com a candidatura na etapa Entrevista.");
  const scheduledAt = fromLocalInput(params.input.scheduledAt)!;
  if (scheduledAt <= (params.now ?? new Date())) return fail(400, "Escolha uma data e hora futuras.");
  try {
    const interview = await prisma.$transaction(async (tx) => {
      const created = await tx.interview.create({ data: {
        applicationId: app.id, scheduledAt, modality: params.input.modality, locationOrLink: params.input.locationOrLink,
        accessibilityResources: params.input.accessibilityResources, createdByUserId: params.actorUserId
      } });
      await tx.auditEvent.create({ data: { actorUserId: params.actorUserId, eventType: "INTERVIEW_SCHEDULED", subjectType: "Interview", subjectId: created.id, metadata: { applicationId: app.id, jobId: app.jobId, companyId: params.companyId } } });
      await enqueueInterviewNotice(tx, "INTERVIEW_SCHEDULED", notice(app, created));
      return created;
    });
    kickNotificationDelivery();
    return { ok: true, interviewId: interview.id };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return fail(409, "Esta candidatura já tem uma entrevista agendada. Altere ou cancele a atual.");
    }
    throw error;
  }
}

async function scheduledInterview(companyId: string, applicationId: string, interviewId: string) {
  const app = await applicationOf(companyId, applicationId);
  if (!app) return { app: null, interview: null };
  const interview = await prisma.interview.findFirst({ where: { id: interviewId, applicationId: app.id } });
  return { app, interview };
}

/** Changes date, modality, place/link or resources of a scheduled interview; the candidate is told. */
export async function updateInterview(params: { companyId: string; actorUserId: string; applicationId: string; interviewId: string; input: InterviewInput; now?: Date }): Promise<Result> {
  const { app, interview } = await scheduledInterview(params.companyId, params.applicationId, params.interviewId);
  if (!app || !interview) return fail(404, "Entrevista não encontrada.");
  if (interview.status !== "SCHEDULED") return fail(409, `Uma entrevista ${statusLabels[interview.status].toLocaleLowerCase("pt-BR")} não pode ser alterada.`);
  const scheduledAt = fromLocalInput(params.input.scheduledAt)!;
  if (scheduledAt <= (params.now ?? new Date())) return fail(400, "Escolha uma data e hora futuras.");
  const data = { scheduledAt, modality: params.input.modality, locationOrLink: params.input.locationOrLink, accessibilityResources: params.input.accessibilityResources };
  const done = await prisma.$transaction(async (tx) => {
    const changed = await tx.interview.updateMany({ where: { id: interview.id, status: "SCHEDULED" }, data });
    if (changed.count !== 1) return false;
    await tx.auditEvent.create({ data: { actorUserId: params.actorUserId, eventType: "INTERVIEW_UPDATED", subjectType: "Interview", subjectId: interview.id, metadata: { applicationId: app.id, jobId: app.jobId, companyId: params.companyId } } });
    await enqueueInterviewNotice(tx, "INTERVIEW_UPDATED", notice(app, data));
    return true;
  });
  if (!done) return fail(409, "A entrevista mudou enquanto você operava. Atualize a página.");
  kickNotificationDelivery();
  return { ok: true, interviewId: interview.id };
}

/** Cancels a scheduled interview (the candidate is told) or marks it as completed (only after its time). */
export async function finishInterview(params: { companyId: string; actorUserId: string; applicationId: string; interviewId: string; action: "cancel" | "complete"; now?: Date }): Promise<Result> {
  const now = params.now ?? new Date();
  const { app, interview } = await scheduledInterview(params.companyId, params.applicationId, params.interviewId);
  if (!app || !interview) return fail(404, "Entrevista não encontrada.");
  if (interview.status !== "SCHEDULED") return fail(409, `Esta entrevista já está ${statusLabels[interview.status].toLocaleLowerCase("pt-BR")}.`);
  if (params.action === "complete" && interview.scheduledAt > now) return fail(409, "Só é possível marcar como concluída depois do horário da entrevista.");
  const done = await prisma.$transaction(async (tx) => {
    const changed = await tx.interview.updateMany({
      where: { id: interview.id, status: "SCHEDULED" },
      data: params.action === "cancel" ? { status: "CANCELLED", cancelledAt: now } : { status: "COMPLETED", completedAt: now }
    });
    if (changed.count !== 1) return false;
    await tx.auditEvent.create({ data: {
      actorUserId: params.actorUserId, eventType: params.action === "cancel" ? "INTERVIEW_CANCELLED" : "INTERVIEW_COMPLETED",
      subjectType: "Interview", subjectId: interview.id, metadata: { applicationId: app.id, jobId: app.jobId, companyId: params.companyId }
    } });
    if (params.action === "cancel") await enqueueInterviewNotice(tx, "INTERVIEW_CANCELLED", notice(app, interview));
    return true;
  });
  if (!done) return fail(409, "A entrevista mudou enquanto você operava. Atualize a página.");
  if (params.action === "cancel") kickNotificationDelivery();
  return { ok: true, interviewId: interview.id };
}

export type InterviewView = {
  id: string; scheduledAt: string; modality: keyof typeof modalityLabels; modalityLabel: string; locationOrLink: string;
  accessibilityResources: string; status: keyof typeof statusLabels; statusLabel: string; completedAt: string | null; cancelledAt: string | null;
};

export const toInterviewView = (row: { id: string; scheduledAt: Date; modality: string; locationOrLink: string; accessibilityResources: string; status: string; completedAt: Date | null; cancelledAt: Date | null }): InterviewView => ({
  id: row.id, scheduledAt: row.scheduledAt.toISOString(),
  modality: row.modality as InterviewView["modality"], modalityLabel: modalityLabels[row.modality as InterviewView["modality"]],
  locationOrLink: row.locationOrLink, accessibilityResources: row.accessibilityResources,
  status: row.status as InterviewView["status"], statusLabel: statusLabels[row.status as InterviewView["status"]],
  completedAt: row.completedAt?.toISOString() ?? null, cancelledAt: row.cancelledAt?.toISOString() ?? null
});

/** Interviews of one application, most recent first. */
export async function listInterviews(applicationId: string) {
  const rows = await prisma.interview.findMany({ where: { applicationId }, orderBy: [{ scheduledAt: "desc" }, { id: "desc" }] });
  return rows.map(toInterviewView);
}
