import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, tx, notify } = vi.hoisted(() => {
  const tx = {
    report: { create: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    reportEvent: { create: vi.fn() }, auditEvent: { create: vi.fn() }
  };
  return {
    tx,
    notify: { enqueueReportNotice: vi.fn(), kickNotificationDelivery: vi.fn() },
    prismaMock: {
      job: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
      interviewEvaluation: { findMany: vi.fn(), findUnique: vi.fn() }, interview: { findFirst: vi.fn() },
      report: { count: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn() },
      user: { findMany: vi.fn() }, auditEvent: { create: vi.fn() },
      $transaction: vi.fn(async (cb: (t: typeof tx) => unknown) => cb(tx))
    }
  };
});
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/notifications/service", () => notify);
import { addBusinessDays } from "./business-days";
import { createReport, getOwnReport, listOwnReports, reportInputSchema } from "./reporter-service";
import { concludeReport, decisionSchema, getReportForAdmin, listCompanyReports, listQueue, requestCompanyInfo, respondAsCompany, startAnalysis } from "./moderation-service";

const now = new Date("2026-11-02T12:00:00Z"); // Monday
const job = { id: "j1", title: "Analista", companyId: "c1", company: { id: "c1", tradeName: "Loja", legalName: "Loja Ltda", accountUserId: "company-user" } };
const input = reportInputSchema.parse({ jobId: "j1", category: "FALSE_INCLUSION", description: "A vaga diz ser inclusiva, mas a entrevista foi num local sem acesso.", evidence: "  https://exemplo.org/foto  " });
const report = (over = {}) => ({ id: "r1", reporterUserId: "cand", jobId: "j1", companyId: "c1", status: "EM_ANALISE", highPriority: false, ...over });

describe("reports (SPEC-019)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.job.findFirst.mockResolvedValue(job);
    prismaMock.job.findUnique.mockResolvedValue(job);
    prismaMock.job.findMany.mockResolvedValue([job]);
    prismaMock.report.count.mockResolvedValue(0);
    prismaMock.interviewEvaluation.findMany.mockResolvedValue([]);
    prismaMock.interview.findFirst.mockResolvedValue({ id: "i1" });
    tx.report.create.mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({ id: "r1", ...data }));
    tx.report.updateMany.mockResolvedValue({ count: 1 });
  });

  it("counts 5 business days, skipping the weekend", () => {
    expect(addBusinessDays(new Date("2026-11-06T15:00:00Z"), 5).toISOString().slice(0, 10)).toBe("2026-11-13"); // Friday → next Friday
  });

  it("requires category and a description, keeps evidence optional and refuses extra fields", () => {
    expect(input.evidence).toBe("https://exemplo.org/foto");
    expect(reportInputSchema.safeParse({ jobId: "j1", description: "x".repeat(30) }).success).toBe(false);
    expect(reportInputSchema.safeParse({ jobId: "j1", category: "FALSE_INCLUSION", description: "curta" }).success).toBe(false);
    expect(reportInputSchema.safeParse({ jobId: "j1", category: "FALSE_INCLUSION", description: "x".repeat(30) }).success).toBe(true);
    expect(reportInputSchema.safeParse({ jobId: "j1", category: "FALSE_INCLUSION", description: "x".repeat(30), companyId: "c2" }).success).toBe(false);
  });

  it("registers a report linked to the job and its company, with history and audit, changing nothing on the job", async () => {
    expect(await createReport("cand", { ...input, reporterFlaggedRisk: true }, now)).toEqual({ ok: true, reportId: "r1" });
    expect(tx.report.create.mock.calls[0][0].data).toMatchObject({ reporterUserId: "cand", jobId: "j1", companyId: "c1", category: "FALSE_INCLUSION", highPriority: true, dueAt: new Date("2026-11-09T12:00:00Z") });
    expect(tx.reportEvent.create.mock.calls[0][0].data).toMatchObject({ kind: "SUBMITTED", toStatus: "RECEBIDA" });
    expect(tx.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "REPORT_SUBMITTED" });
    expect(Object.keys(prismaMock.job)).not.toContain("update");
  });

  it("is available only after a completed interview in this job (decision of 01/11/2026)", async () => {
    prismaMock.interview.findFirst.mockResolvedValueOnce(null);
    expect(await createReport("cand", input, now)).toMatchObject({ ok: false, status: 403 });
    expect(prismaMock.interview.findFirst.mock.calls[0][0].where).toEqual({ status: "COMPLETED", application: { jobId: "j1", candidateUserId: "cand" } });
    expect(tx.report.create).not.toHaveBeenCalled();
  });

  it("refuses an invisible job, someone else's evaluation, the daily limit and a second open report for the job", async () => {
    prismaMock.job.findFirst.mockResolvedValueOnce(null);
    expect(await createReport("cand", input, now)).toMatchObject({ ok: false, status: 404 });
    expect(await createReport("cand", { ...input, evaluationId: "not-mine" }, now)).toMatchObject({ ok: false, status: 400 });
    prismaMock.report.count.mockResolvedValueOnce(3);
    expect(await createReport("cand", input, now)).toMatchObject({ ok: false, status: 429 });
    expect(prismaMock.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "REPORT_REFUSED", metadata: { reason: "DAILY_LIMIT" } });
    expect(tx.report.create).not.toHaveBeenCalled();
    tx.report.create.mockRejectedValueOnce(Object.assign(new Error("unique"), { code: "P2002" }));
    expect(await createReport("cand", input, now)).toMatchObject({ ok: false, status: 409 });
  });

  it("accepts a link to the reporter's own evaluation for this job", async () => {
    prismaMock.interviewEvaluation.findMany.mockResolvedValue([{ id: "e1", submittedAt: now, interview: { scheduledAt: now } }]);
    expect(await createReport("cand", { ...input, evaluationId: "e1" }, now)).toEqual({ ok: true, reportId: "r1" });
    expect(prismaMock.interviewEvaluation.findMany.mock.calls[0][0].where).toEqual({ candidateUserId: "cand", interview: { application: { jobId: "j1", candidateUserId: "cand" } } });
  });

  it("shows the reporter progress and result only, and only their own reports", async () => {
    prismaMock.report.findMany.mockResolvedValue([{ id: "r1", category: "FALSE_INCLUSION", status: "AGUARDANDO_INFORMACOES", createdAt: now, dueAt: now, extensionReason: "pedido à empresa", decision: null, reporterSummary: null, concludedAt: null, jobId: "j1" }]);
    const list = await listOwnReports("cand");
    expect(prismaMock.report.findMany.mock.calls[0][0].where).toEqual({ reporterUserId: "cand" });
    expect(list[0]).toMatchObject({ statusLabel: "Aguardando informações", delayed: true });
    expect(JSON.stringify(list)).not.toContain("pedido à empresa");
    prismaMock.report.findFirst.mockResolvedValueOnce(null);
    expect(await getOwnReport("intruder", "r1")).toBeNull();
    expect(prismaMock.report.findFirst.mock.calls[0][0].where).toEqual({ id: "r1", reporterUserId: "intruder" });
  });
});

describe("moderation (SPEC-020)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMock.job.findUnique.mockResolvedValue(job);
    prismaMock.job.findMany.mockResolvedValue([job]);
    tx.report.updateMany.mockResolvedValue({ count: 1 });
  });

  it("orders the queue by priority and age and flags overdue reports", async () => {
    prismaMock.report.findMany.mockResolvedValue([{ id: "r1", category: "FALSE_INCLUSION", status: "RECEBIDA", highPriority: true, createdAt: now, dueAt: new Date("2026-11-01T00:00:00Z"), decision: null, concludedAt: null, companyResponse: null, companyRespondedAt: null, jobId: "j1" }]);
    const queue = await listQueue("open", now);
    expect(prismaMock.report.findMany.mock.calls[0][0].orderBy).toEqual([{ highPriority: "desc" }, { createdAt: "asc" }, { id: "asc" }]);
    expect(queue[0]).toMatchObject({ overdue: true, highPriority: true, job: { companyName: "Loja" } });
  });

  it("starts the analysis once, with history, audit and a notice to the reporter", async () => {
    prismaMock.report.findUnique.mockResolvedValue(report({ status: "RECEBIDA" }));
    expect(await startAnalysis("admin", "r1")).toEqual({ ok: true });
    expect(tx.report.updateMany).toHaveBeenCalledWith({ where: { id: "r1", status: "RECEBIDA" }, data: { status: "EM_ANALISE" } });
    expect(tx.reportEvent.create.mock.calls[0][0].data).toMatchObject({ kind: "ANALYSIS_STARTED", actorUserId: "admin" });
    expect(notify.enqueueReportNotice).toHaveBeenCalledWith(tx, "REPORT_STATUS_CHANGED", "cand", expect.objectContaining({ statusLabel: "Em análise" }));
    prismaMock.report.findUnique.mockResolvedValue(report({ status: "EM_ANALISE" }));
    expect(await startAnalysis("admin", "r1")).toMatchObject({ ok: false, status: 409 });
  });

  it("asks the company with the administrator's points only and tells the reporter about the delay", async () => {
    prismaMock.report.findUnique.mockResolvedValue(report());
    expect(await requestCompanyInfo("admin", "r1", { pointsForCompany: "Informe se a sala tem rampa de acesso.", extensionReason: "Aguardar a empresa" })).toEqual({ ok: true });
    expect(tx.report.updateMany.mock.calls[0][0].data).toMatchObject({ status: "AGUARDANDO_INFORMACOES", companyRequest: "Informe se a sala tem rampa de acesso.", extensionReason: "Aguardar a empresa" });
    expect(notify.enqueueReportNotice).toHaveBeenCalledWith(tx, "REPORT_INFO_REQUESTED", "company-user", { reportId: "r1", area: "empresa", jobTitle: "Analista" });
    expect(notify.enqueueReportNotice).toHaveBeenCalledWith(tx, "REPORT_STATUS_CHANGED", "cand", expect.objectContaining({ delayed: true }));
  });

  it("lets only the reported company answer an open request", async () => {
    prismaMock.report.findFirst.mockResolvedValueOnce(null);
    expect(await respondAsCompany({ companyId: "other", actorUserId: "x", reportId: "r1", response: "Temos rampa na entrada." })).toMatchObject({ ok: false, status: 404 });
    expect(prismaMock.report.findFirst.mock.calls[0][0].where).toEqual({ id: "r1", companyId: "other" });
    prismaMock.report.findFirst.mockResolvedValueOnce(report({ status: "EM_ANALISE" }));
    expect(await respondAsCompany({ companyId: "c1", actorUserId: "rec", reportId: "r1", response: "Temos rampa na entrada." })).toMatchObject({ ok: false, status: 409 });
    prismaMock.report.findFirst.mockResolvedValueOnce(report({ status: "AGUARDANDO_INFORMACOES" }));
    expect(await respondAsCompany({ companyId: "c1", actorUserId: "rec", reportId: "r1", response: "Temos rampa na entrada." })).toEqual({ ok: true });
    expect(tx.report.updateMany.mock.calls[0][0].data).toMatchObject({ status: "EM_ANALISE", companyResponse: "Temos rampa na entrada." });
  });

  it("requires measures only for upheld decisions and tells both parties", async () => {
    const base = { reporterSummary: "A empresa ajustou o local.", justification: "Foi confirmado que o local não tinha rampa." };
    expect(decisionSchema.safeParse({ decision: "PROCEDENTE", ...base }).success).toBe(false);
    expect(decisionSchema.safeParse({ decision: "IMPROCEDENTE", ...base, measures: "Advertência" }).success).toBe(false);
    expect(decisionSchema.safeParse({ decision: "INCONCLUSIVA", ...base }).success).toBe(true);
    prismaMock.report.findUnique.mockResolvedValue(report());
    expect(await concludeReport("admin", "r1", decisionSchema.parse({ decision: "PARCIALMENTE_PROCEDENTE", ...base, measures: "Corrigir a acessibilidade declarada da vaga." }), now)).toEqual({ ok: true });
    expect(tx.report.updateMany.mock.calls[0][0].data).toMatchObject({ status: "CONCLUIDA", decision: "PARCIALMENTE_PROCEDENTE", decidedByUserId: "admin", concludedAt: now });
    expect(notify.enqueueReportNotice).toHaveBeenCalledWith(tx, "REPORT_CONCLUDED", "cand", expect.objectContaining({ summary: "A empresa ajustou o local." }));
    expect(notify.enqueueReportNotice).toHaveBeenCalledWith(tx, "REPORT_CONCLUDED", "company-user", expect.not.objectContaining({ summary: expect.anything() }));
    prismaMock.report.findUnique.mockResolvedValue(report({ status: "AGUARDANDO_INFORMACOES" }));
    expect(await concludeReport("admin", "r1", decisionSchema.parse({ decision: "INCONCLUSIVA", ...base }), now)).toMatchObject({ ok: false, status: 409 });
  });

  it("never gives the company the reporter, the description or the evidence", async () => {
    prismaMock.report.findMany.mockResolvedValue([{ id: "r1", category: "FALSE_INCLUSION", status: "AGUARDANDO_INFORMACOES", createdAt: now, companyRequest: "Pontos", companyResponse: null, companyRespondedAt: null, decision: null, justification: "interna", measures: null, concludedAt: null, jobId: "j1" }]);
    const list = await listCompanyReports("c1");
    expect(prismaMock.report.findMany.mock.calls[0][0].select).not.toHaveProperty("description");
    expect(prismaMock.report.findMany.mock.calls[0][0].select).not.toHaveProperty("reporterUserId");
    expect(list[0]).toMatchObject({ canRespond: true, justification: null });
  });

  it("shows the administrator the context without the reporter's identity", async () => {
    prismaMock.report.findUnique.mockResolvedValue({ ...report(), category: "FALSE_INCLUSION", description: "Texto", evidence: null, reporterFlaggedRisk: false, dueAt: now, createdAt: now, extensionReason: null, companyRequest: null, companyResponse: null, companyRespondedAt: null, decision: null, reporterSummary: null, justification: null, measures: null, concludedAt: null, evaluationId: null,
      events: [{ createdAt: now, kind: "SUBMITTED", fromStatus: null, toStatus: "RECEBIDA", actorUserId: "cand", note: null }] });
    prismaMock.job.findUnique.mockResolvedValue({ id: "j1", title: "Analista", status: "OPEN", accessibility: {}, company: { tradeName: "Loja", legalName: "Loja Ltda" } });
    prismaMock.user.findMany.mockResolvedValue([{ id: "cand", fullName: "Ana Lima", role: "CANDIDATE" }]);
    const detail = await getReportForAdmin("r1", now);
    expect(detail?.history[0].actor).toBe("Denunciante");
    expect(JSON.stringify(detail)).not.toMatch(/Ana Lima|reporterUserId|cand"/);
  });
});
