import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { addBusinessDays, REVIEW_TARGET_BUSINESS_DAYS } from "./business-days";
import { categoryLabels, decisionLabels, reportStatusLabels, type DecisionCode, type ReportCategoryCode, type ReportStatusCode } from "./labels";

// SPEC-019: a signed-in candidate reports a job after taking part in its selection process: they must have had a
// completed interview for that job (decision of 01/11/2026, revising OPEN-074). Category and description are required; evidence
// is optional free text (links or a description) and never a medical report or personal document (OPEN-075).

export const MAX_REPORTS_PER_DAY = 3;
const DAY_MS = 24 * 60 * 60 * 1000;
const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const text = (min: number, max: number, minMessage: string) => z.string().transform((value) => value.replace(/\r\n/g, "\n").trim())
  .pipe(z.string().min(min, minMessage).max(max, `Use até ${max} caracteres.`).refine((value) => !controlChars.test(value), "O texto tem caracteres inválidos."));

export const reportInputSchema = z.object({
  jobId: z.string().min(1).max(64),
  category: z.enum(["ACCESSIBILITY_INCOMPATIBILITY", "FALSE_INCLUSION"], { message: "Escolha o tipo da situação." }),
  description: text(20, 3000, "Descreva a situação com pelo menos 20 caracteres."),
  evidence: z.string().optional().transform((value) => value?.replace(/\r\n/g, "\n").trim() || undefined)
    .pipe(z.string().max(2000, "Use até 2000 caracteres.").refine((value) => !controlChars.test(value), "O texto tem caracteres inválidos.").optional()),
  evaluationId: z.string().min(1).max(64).optional(),
  reporterFlaggedRisk: z.boolean().optional().default(false)
}).strict();
export type ReportInput = z.infer<typeof reportInputSchema>;

/** Jobs a candidate can see (and so report): published own jobs, open, paused or closed (SPEC-010). */
const visibleJob = (jobId: string) => prisma.job.findFirst({
  where: { id: jobId, origin: "OWN", status: { in: ["OPEN", "PAUSED", "CLOSED"] } },
  select: { id: true, title: true, companyId: true, company: { select: { tradeName: true, legalName: true } } }
});

/** The candidate's own evaluations of interviews for this job, which a report may point to (OPEN-075). */
const ownEvaluationsForJob = (userId: string, jobId: string) => prisma.interviewEvaluation.findMany({
  where: { candidateUserId: userId, interview: { application: { jobId, candidateUserId: userId } } },
  select: { id: true, submittedAt: true, interview: { select: { scheduledAt: true } } }, orderBy: { submittedAt: "desc" }
});

/** OPEN-074 (revised 01/11/2026): reporting is open to candidates with a completed interview in this job. */
export async function canReportJob(userId: string, jobId: string) {
  const interview = await prisma.interview.findFirst({ where: { status: "COMPLETED", application: { jobId, candidateUserId: userId } }, select: { id: true } });
  return Boolean(interview);
}

/** What the report form needs: the job, the reporter's own evaluations for it and whether a report is already open. */
export async function reportFormContext(userId: string, jobId: string) {
  const job = await visibleJob(jobId);
  if (!job) return null;
  const [eligible, evaluations, open] = await Promise.all([
    canReportJob(userId, jobId),
    ownEvaluationsForJob(userId, jobId),
    prisma.report.findFirst({ where: { reporterUserId: userId, jobId, status: { not: "CONCLUIDA" } }, select: { id: true } })
  ]);
  return {
    job: { id: job.id, title: job.title || "Vaga sem título", companyName: job.company.tradeName || job.company.legalName },
    evaluations: evaluations.map((item) => ({ id: item.id, submittedAt: item.submittedAt.toISOString(), interviewAt: item.interview?.scheduledAt.toISOString() ?? null })),
    openReportId: open?.id ?? null,
    eligible
  };
}

type Result = { ok: true; reportId: string } | { ok: false; status: number; message: string };
const fail = (status: number, message: string): Result => ({ ok: false, status, message });

/**
 * Registers the report and puts it in the moderation queue (SPEC-019). Checked here: the job is visible, the optional
 * evaluation is the reporter's own for this job, at most 3 reports in 24 h and no open report for the same job (OPEN-076).
 * Registering never blocks the job nor changes any rating (RB-44).
 */
export async function createReport(userId: string, input: ReportInput, now: Date = new Date()): Promise<Result> {
  const job = await visibleJob(input.jobId);
  if (!job) return fail(404, "Vaga não encontrada.");
  if (!await canReportJob(userId, job.id)) return fail(403, "A denúncia fica disponível depois que você participa de uma entrevista concluída nesta vaga.");
  if (input.evaluationId) {
    const own = await ownEvaluationsForJob(userId, job.id);
    if (!own.some((item) => item.id === input.evaluationId)) return fail(400, "A avaliação indicada não é sua ou não é desta vaga.");
  }
  const recent = await prisma.report.count({ where: { reporterUserId: userId, createdAt: { gte: new Date(now.getTime() - DAY_MS) } } });
  if (recent >= MAX_REPORTS_PER_DAY) {
    await prisma.auditEvent.create({ data: { actorUserId: userId, eventType: "REPORT_REFUSED", subjectType: "Job", subjectId: job.id, metadata: { reason: "DAILY_LIMIT" } } });
    return fail(429, `Você já registrou ${MAX_REPORTS_PER_DAY} denúncias nas últimas 24 horas. Para evitar abuso, novas denúncias ficam disponíveis depois desse período.`);
  }
  try {
    const report = await prisma.$transaction(async (tx) => {
      const created = await tx.report.create({ data: {
        reporterUserId: userId, jobId: job.id, companyId: job.companyId, evaluationId: input.evaluationId ?? null,
        category: input.category, description: input.description, evidence: input.evidence ?? null,
        reporterFlaggedRisk: input.reporterFlaggedRisk, highPriority: input.reporterFlaggedRisk,
        dueAt: addBusinessDays(now, REVIEW_TARGET_BUSINESS_DAYS), createdAt: now
      } });
      await tx.reportEvent.create({ data: { reportId: created.id, kind: "SUBMITTED", toStatus: "RECEBIDA", actorUserId: userId, createdAt: now } });
      await tx.auditEvent.create({ data: { actorUserId: userId, eventType: "REPORT_SUBMITTED", subjectType: "Report", subjectId: created.id, metadata: { jobId: job.id, companyId: job.companyId, category: input.category } } });
      return created;
    });
    return { ok: true, reportId: report.id };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002") {
      return fail(409, "Você já tem uma denúncia em andamento sobre esta vaga. Acompanhe-a em Minhas denúncias.");
    }
    throw error;
  }
}

const reporterView = (row: {
  id: string; category: string; status: string; createdAt: Date; dueAt: Date; extensionReason: string | null; decision: string | null;
  reporterSummary: string | null; concludedAt: Date | null; job: { id: string; title: string; company: { tradeName: string | null; legalName: string } } | null;
}) => ({
  id: row.id, createdAt: row.createdAt.toISOString(), dueAt: row.dueAt.toISOString(),
  category: row.category as ReportCategoryCode, categoryLabel: categoryLabels[row.category as ReportCategoryCode],
  status: row.status as ReportStatusCode, statusLabel: reportStatusLabels[row.status as ReportStatusCode],
  // OPEN-080: the reporter is told about a delay, not about its internal reason.
  delayed: Boolean(row.extensionReason) && row.status !== "CONCLUIDA",
  decision: row.decision as DecisionCode | null, decisionLabel: row.decision ? decisionLabels[row.decision as DecisionCode] : null,
  summary: row.reporterSummary, concludedAt: row.concludedAt?.toISOString() ?? null,
  job: row.job ? { id: row.job.id, title: row.job.title || "Vaga sem título", companyName: row.job.company.tradeName || row.job.company.legalName } : null
});

const jobRelation = { select: { id: true, title: true, company: { select: { tradeName: true, legalName: true } } } } as const;
const reporterSelect = {
  id: true, category: true, status: true, createdAt: true, dueAt: true, extensionReason: true, decision: true, reporterSummary: true, concludedAt: true, jobId: true
} as const;

async function withJobs<T extends { jobId: string }>(rows: T[]) {
  const jobs = await prisma.job.findMany({ where: { id: { in: [...new Set(rows.map((row) => row.jobId))] } }, ...jobRelation });
  return rows.map((row) => ({ ...row, job: jobs.find((job) => job.id === row.jobId) ?? null }));
}

/** The candidate's own reports: progress and result only, never the internal analysis (OPEN-077). */
export async function listOwnReports(userId: string) {
  const rows = await prisma.report.findMany({ where: { reporterUserId: userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], select: reporterSelect });
  return (await withJobs(rows)).map(reporterView);
}

export async function getOwnReport(userId: string, reportId: string) {
  const row = await prisma.report.findFirst({ where: { id: reportId, reporterUserId: userId }, select: { ...reporterSelect, description: true, evidence: true } });
  if (!row) return null;
  const [withJob] = await withJobs([row]);
  return { ...reporterView(withJob), description: row.description, evidence: row.evidence };
}
