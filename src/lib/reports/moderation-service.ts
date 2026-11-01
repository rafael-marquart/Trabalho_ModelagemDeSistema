import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { enqueueReportNotice, kickNotificationDelivery } from "@/lib/notifications/service";
import { categoryLabels, decisionLabels, reportStatusLabels, type DecisionCode, type ReportCategoryCode, type ReportStatusCode } from "./labels";

// SPEC-020: moderation by the platform administrator only (RB-25). Recruiters and company accounts never moderate.
// A report changes no job and no rating; the decision records measures for the company, applied by the rules that own
// them (OPEN-079). Every step goes to the immutable history (ReportEvent) and to the audit.

type Tx = Prisma.TransactionClient;
type Result = { ok: true } | { ok: false; status: number; message: string };
const fail = (status: number, message: string): Result => ({ ok: false, status, message });
const longText = (max: number, min = 1, message = "Preencha este campo.") => z.string().transform((value) => value.replace(/\r\n/g, "\n").trim())
  .pipe(z.string().min(min, message).max(max, `Use até ${max} caracteres.`));

const jobInfo = { select: { id: true, title: true, company: { select: { id: true, tradeName: true, legalName: true, accountUserId: true } } } } as const;
const companyName = (company: { tradeName: string | null; legalName: string }) => company.tradeName || company.legalName;

/** Queue order (OPEN-080): high priority first, then the oldest. Open reports by default; concluded ones form the history. */
export async function listQueue(filter: "open" | "concluded" = "open", now: Date = new Date()) {
  const rows = await prisma.report.findMany({
    where: filter === "open" ? { status: { not: "CONCLUIDA" } } : { status: "CONCLUIDA" },
    orderBy: filter === "open" ? [{ highPriority: "desc" }, { createdAt: "asc" }, { id: "asc" }] : [{ concludedAt: "desc" }, { id: "desc" }],
    take: 200,
    select: { id: true, category: true, status: true, highPriority: true, createdAt: true, dueAt: true, decision: true, concludedAt: true, companyResponse: true, companyRespondedAt: true, jobId: true }
  });
  const jobs = await prisma.job.findMany({ where: { id: { in: [...new Set(rows.map((row) => row.jobId))] } }, ...jobInfo });
  return rows.map((row) => {
    const job = jobs.find((item) => item.id === row.jobId);
    return {
      id: row.id, createdAt: row.createdAt.toISOString(), dueAt: row.dueAt.toISOString(), overdue: row.status !== "CONCLUIDA" && row.dueAt < now,
      category: row.category, categoryLabel: categoryLabels[row.category as ReportCategoryCode],
      status: row.status, statusLabel: reportStatusLabels[row.status as ReportStatusCode], highPriority: row.highPriority,
      decisionLabel: row.decision ? decisionLabels[row.decision as DecisionCode] : null, concludedAt: row.concludedAt?.toISOString() ?? null,
      companyAnswered: Boolean(row.companyRespondedAt) && row.status === "EM_ANALISE",
      job: job ? { id: job.id, title: job.title || "Vaga sem título", companyName: companyName(job.company) } : null
    };
  });
}

/**
 * Everything the administrator needs to analyse (OPEN-078): the job and its declared accessibility, the report, the
 * evidence, the linked evaluation's ratings if any, the company's answer and the history. The reporter's name, e-mail
 * and documents are not returned: the analysis does not need them (OPEN-081).
 */
export async function getReportForAdmin(reportId: string, now: Date = new Date()) {
  const row = await prisma.report.findUnique({ where: { id: reportId }, include: { events: { orderBy: [{ createdAt: "asc" }, { id: "asc" }] } } });
  if (!row) return null;
  const [job, evaluation, actors] = await Promise.all([
    prisma.job.findUnique({ where: { id: row.jobId }, select: { id: true, title: true, status: true, accessibility: true, company: { select: { tradeName: true, legalName: true } } } }),
    row.evaluationId ? prisma.interviewEvaluation.findUnique({ where: { id: row.evaluationId }, select: { accessibilityRating: true, inclusionRating: true, submittedAt: true } }) : null,
    prisma.user.findMany({ where: { id: { in: [...new Set(row.events.map((event) => event.actorUserId).filter((id): id is string => Boolean(id)))] } }, select: { id: true, fullName: true, role: true } })
  ]);
  const actorLabel = (id: string | null) => {
    const actor = actors.find((item) => item.id === id);
    if (!actor) return "Sistema";
    return actor.role === "ADMIN" ? actor.fullName : actor.role === "CANDIDATE" ? "Denunciante" : "Empresa";
  };
  return {
    id: row.id, createdAt: row.createdAt.toISOString(), dueAt: row.dueAt.toISOString(), overdue: row.status !== "CONCLUIDA" && row.dueAt < now,
    category: row.category, categoryLabel: categoryLabels[row.category as ReportCategoryCode],
    status: row.status, statusLabel: reportStatusLabels[row.status as ReportStatusCode],
    highPriority: row.highPriority, reporterFlaggedRisk: row.reporterFlaggedRisk,
    description: row.description, evidence: row.evidence, extensionReason: row.extensionReason,
    companyRequest: row.companyRequest, companyResponse: row.companyResponse, companyRespondedAt: row.companyRespondedAt?.toISOString() ?? null,
    decision: row.decision, decisionLabel: row.decision ? decisionLabels[row.decision as DecisionCode] : null,
    reporterSummary: row.reporterSummary, justification: row.justification, measures: row.measures, concludedAt: row.concludedAt?.toISOString() ?? null,
    job: job ? { id: job.id, title: job.title || "Vaga sem título", status: job.status, companyName: companyName(job.company), accessibility: job.accessibility } : null,
    evaluation: evaluation ? { accessibilityRating: evaluation.accessibilityRating, inclusionRating: evaluation.inclusionRating, submittedAt: evaluation.submittedAt.toISOString() } : null,
    history: row.events.map((event) => ({
      at: event.createdAt.toISOString(), kind: event.kind, from: event.fromStatus ? reportStatusLabels[event.fromStatus as ReportStatusCode] : null,
      to: event.toStatus ? reportStatusLabels[event.toStatus as ReportStatusCode] : null, actor: actorLabel(event.actorUserId), note: event.note
    }))
  };
}

async function loadOpen(reportId: string) {
  const report = await prisma.report.findUnique({ where: { id: reportId }, include: { events: false } });
  return report;
}

async function step(tx: Tx, params: { reportId: string; from: ReportStatusCode; to: ReportStatusCode; kind: string; actorUserId: string; note?: string | null; data?: Prisma.ReportUpdateManyMutationInput }) {
  const changed = await tx.report.updateMany({ where: { id: params.reportId, status: params.from }, data: { status: params.to, ...(params.data ?? {}) } });
  if (changed.count !== 1) return false;
  await tx.reportEvent.create({ data: { reportId: params.reportId, kind: params.kind, fromStatus: params.from, toStatus: params.to, actorUserId: params.actorUserId, note: params.note ?? null } });
  await tx.auditEvent.create({ data: { actorUserId: params.actorUserId, eventType: `REPORT_${params.kind}`, subjectType: "Report", subjectId: params.reportId, metadata: { fromStatus: params.from, toStatus: params.to } } });
  return true;
}

async function jobFor(jobId: string) {
  return prisma.job.findUnique({ where: { id: jobId }, ...jobInfo });
}

/** "Assumir análise": Recebida → Em análise; the reporter is told. */
export async function startAnalysis(adminId: string, reportId: string): Promise<Result> {
  const report = await loadOpen(reportId);
  if (!report) return fail(404, "Denúncia não encontrada.");
  if (report.status !== "RECEBIDA") return fail(409, "A análise desta denúncia já foi iniciada.");
  const job = await jobFor(report.jobId);
  const done = await prisma.$transaction(async (tx) => {
    if (!await step(tx, { reportId, from: "RECEBIDA", to: "EM_ANALISE", kind: "ANALYSIS_STARTED", actorUserId: adminId })) return false;
    await enqueueReportNotice(tx, "REPORT_STATUS_CHANGED", report.reporterUserId, { reportId, area: "candidato", jobTitle: job?.title || "Vaga sem título", statusLabel: reportStatusLabels.EM_ANALISE });
    return true;
  });
  if (!done) return fail(409, "A denúncia mudou enquanto você operava. Atualize a página.");
  kickNotificationDelivery();
  return { ok: true };
}

/** OPEN-080: priority for a relevant risk to accessibility or safety. Recorded in the history; no status change. */
export async function setPriority(adminId: string, reportId: string, highPriority: boolean): Promise<Result> {
  const report = await loadOpen(reportId);
  if (!report) return fail(404, "Denúncia não encontrada.");
  if (report.status === "CONCLUIDA") return fail(409, "A denúncia já foi concluída.");
  if (report.highPriority === highPriority) return { ok: true };
  await prisma.$transaction(async (tx) => {
    await tx.report.update({ where: { id: reportId }, data: { highPriority } });
    await tx.reportEvent.create({ data: { reportId, kind: highPriority ? "PRIORITY_RAISED" : "PRIORITY_LOWERED", actorUserId: adminId } });
    await tx.auditEvent.create({ data: { actorUserId: adminId, eventType: "REPORT_PRIORITY_CHANGED", subjectType: "Report", subjectId: reportId, metadata: { highPriority } } });
  });
  return { ok: true };
}

export const infoRequestSchema = z.object({
  pointsForCompany: longText(2000, 10, "Escreva os pontos que a empresa deve responder (pelo menos 10 caracteres)."),
  extensionReason: longText(500, 5, "Registre o motivo da ampliação do prazo.")
}).strict();

/**
 * Asks the company for clarification (OPEN-078/080): the points written by the administrator — never the reporter's
 * identity or the original text — go to the company; the deadline is extended with the reason recorded; the reporter
 * is told that more time is needed.
 */
export async function requestCompanyInfo(adminId: string, reportId: string, input: z.infer<typeof infoRequestSchema>): Promise<Result> {
  const report = await loadOpen(reportId);
  if (!report) return fail(404, "Denúncia não encontrada.");
  if (report.status !== "EM_ANALISE") return fail(409, "Informações só podem ser pedidas com a denúncia em análise.");
  const job = await jobFor(report.jobId);
  if (!job) return fail(409, "A vaga desta denúncia não foi encontrada.");
  const done = await prisma.$transaction(async (tx) => {
    const ok = await step(tx, {
      reportId, from: "EM_ANALISE", to: "AGUARDANDO_INFORMACOES", kind: "INFO_REQUESTED", actorUserId: adminId, note: input.extensionReason,
      data: { companyRequest: input.pointsForCompany, companyResponse: null, companyRespondedAt: null, extensionReason: input.extensionReason }
    });
    if (!ok) return false;
    const jobTitle = job.title || "Vaga sem título";
    await enqueueReportNotice(tx, "REPORT_INFO_REQUESTED", job.company.accountUserId, { reportId, area: "empresa", jobTitle });
    await enqueueReportNotice(tx, "REPORT_STATUS_CHANGED", report.reporterUserId, { reportId, area: "candidato", jobTitle, statusLabel: reportStatusLabels.AGUARDANDO_INFORMACOES, delayed: true });
    return true;
  });
  if (!done) return fail(409, "A denúncia mudou enquanto você operava. Atualize a página.");
  kickNotificationDelivery();
  return { ok: true };
}

export const companyResponseSchema = z.object({ response: longText(3000, 10, "Escreva a resposta com pelo menos 10 caracteres.") }).strict();

/** The company (account or linked recruiter) answers the administrator's points; the report goes back to analysis. */
export async function respondAsCompany(params: { companyId: string; actorUserId: string; reportId: string; response: string }): Promise<Result> {
  const report = await prisma.report.findFirst({ where: { id: params.reportId, companyId: params.companyId } });
  if (!report) return fail(404, "Denúncia não encontrada.");
  if (report.status !== "AGUARDANDO_INFORMACOES") return fail(409, "Não há pedido de informações em aberto para esta denúncia.");
  const done = await prisma.$transaction((tx) => step(tx, {
    reportId: report.id, from: "AGUARDANDO_INFORMACOES", to: "EM_ANALISE", kind: "COMPANY_RESPONDED", actorUserId: params.actorUserId,
    data: { companyResponse: params.response, companyRespondedAt: new Date() }
  }));
  if (!done) return fail(409, "A denúncia mudou enquanto você respondia. Atualize a página.");
  return { ok: true };
}

export const decisionSchema = z.object({
  decision: z.enum(["PROCEDENTE", "PARCIALMENTE_PROCEDENTE", "IMPROCEDENTE", "INCONCLUSIVA"], { message: "Escolha a conclusão." }),
  reporterSummary: longText(1000, 10, "Escreva a justificativa resumida para o denunciante."),
  justification: longText(3000, 10, "Escreva a justificativa da decisão."),
  measures: z.string().optional().transform((value) => value?.replace(/\r\n/g, "\n").trim() || undefined).pipe(z.string().max(2000, "Use até 2000 caracteres.").optional())
}).strict().superRefine((value, ctx) => {
  const upheld = value.decision === "PROCEDENTE" || value.decision === "PARCIALMENTE_PROCEDENTE";
  if (upheld && !value.measures) ctx.addIssue({ code: "custom", path: ["measures"], message: "Descreva as medidas, limitadas às irregularidades confirmadas." });
  if (!upheld && value.measures) ctx.addIssue({ code: "custom", path: ["measures"], message: "Improcedente ou inconclusiva não tem medidas: encerra sem penalidade." });
});

/**
 * Records the conclusion (OPEN-079): classification, short justification for the reporter, full justification for the
 * company and, only when upheld, the measures. Nothing is applied automatically to the job or to ratings; the reporter
 * and the company are told (OPEN-081).
 */
export async function concludeReport(adminId: string, reportId: string, input: z.infer<typeof decisionSchema>, now: Date = new Date()): Promise<Result> {
  const report = await loadOpen(reportId);
  if (!report) return fail(404, "Denúncia não encontrada.");
  if (report.status !== "EM_ANALISE") return fail(409, report.status === "CONCLUIDA" ? "A denúncia já foi concluída." : "Conclua a análise com a denúncia em análise (aguarde ou registre a resposta da empresa).");
  const job = await jobFor(report.jobId);
  const done = await prisma.$transaction(async (tx) => {
    const ok = await step(tx, {
      reportId, from: "EM_ANALISE", to: "CONCLUIDA", kind: "CONCLUDED", actorUserId: adminId, note: decisionLabels[input.decision],
      data: { decision: input.decision, reporterSummary: input.reporterSummary, justification: input.justification, measures: input.measures ?? null, decidedByUserId: adminId, concludedAt: now }
    });
    if (!ok) return false;
    const jobTitle = job?.title || "Vaga sem título";
    await enqueueReportNotice(tx, "REPORT_CONCLUDED", report.reporterUserId, { reportId, area: "candidato", jobTitle, decisionLabel: decisionLabels[input.decision], summary: input.reporterSummary });
    if (job) await enqueueReportNotice(tx, "REPORT_CONCLUDED", job.company.accountUserId, { reportId, area: "empresa", jobTitle, decisionLabel: decisionLabels[input.decision] });
    return true;
  });
  if (!done) return fail(409, "A denúncia mudou enquanto você operava. Atualize a página.");
  kickNotificationDelivery();
  return { ok: true };
}

/**
 * What the reported company sees (OPEN-077/081): only reports where the administrator asked for information or that
 * were concluded; the category, the administrator's points, its own answer and the conclusion with justification and
 * measures. Never the reporter's identity, the original description or the evidence.
 */
export async function listCompanyReports(companyId: string) {
  const rows = await prisma.report.findMany({
    where: { companyId, OR: [{ status: "AGUARDANDO_INFORMACOES" }, { status: "CONCLUIDA" }, { companyRequest: { not: null } }] },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
    select: { id: true, category: true, status: true, createdAt: true, companyRequest: true, companyResponse: true, companyRespondedAt: true, decision: true, justification: true, measures: true, concludedAt: true, jobId: true }
  });
  const jobs = await prisma.job.findMany({ where: { id: { in: [...new Set(rows.map((row) => row.jobId))] } }, select: { id: true, title: true } });
  return rows.map((row) => ({
    id: row.id, createdAt: row.createdAt.toISOString(),
    categoryLabel: categoryLabels[row.category as ReportCategoryCode], status: row.status, statusLabel: reportStatusLabels[row.status as ReportStatusCode],
    jobTitle: jobs.find((job) => job.id === row.jobId)?.title || "Vaga sem título",
    request: row.companyRequest, response: row.companyResponse, respondedAt: row.companyRespondedAt?.toISOString() ?? null,
    canRespond: row.status === "AGUARDANDO_INFORMACOES",
    decisionLabel: row.decision ? decisionLabels[row.decision as DecisionCode] : null,
    justification: row.status === "CONCLUIDA" ? row.justification : null, measures: row.status === "CONCLUIDA" ? row.measures : null,
    concludedAt: row.concludedAt?.toISOString() ?? null
  }));
}
