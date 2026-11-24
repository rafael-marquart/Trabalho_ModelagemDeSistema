import { inferProfessionalArea } from "@/lib/jobs/area";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { adzunaRecordSchema, callAdzuna, type FetchFn } from "./adzuna";
import { externalImportConfig, type ExternalImportConfig } from "./config";
import { createGeminiExtractor, disabledExtractor, extractWithRetries, type ExtractionPort } from "./llm";
import { attributeKey, fromAdzuna, minimumProblems, problemLabels, urlKey, type ExternalCandidate } from "./record";

type Trigger = "ADMIN" | "SCHEDULE";
type RecordResult = "PROCESSED" | "REJECTED" | "DUPLICATE" | "FAILED";
type Query = { phrase: string; page: number; attempts: number; status: "OK" | "ERROR"; httpStatus: number | null; results: number; error: string | null };
export type RunSummary = {
  id: string; status: "SUCCEEDED" | "PARTIAL" | "FAILED"; callsMade: number; callLimit: number; remainingCalls: number;
  received: number; processed: number; rejected: number; duplicates: number; failed: number; queries: Query[]; error: string | null;
};
export type RunResult = { summary: RunSummary } | { error: { status: number; message: string } };
type Deps = { config?: ExternalImportConfig; fetchFn?: FetchFn; extractor?: ExtractionPort; now?: () => Date };

// A run still marked RUNNING after this long was interrupted (hosting time-out or crash) and is closed as failed.
const STALE_RUN_MS = 15 * 60 * 1000;
const isUniqueViolation = (error: unknown) => typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "P2002";

function defaultExtractor(config: ExternalImportConfig): ExtractionPort {
  return config.llm.provider === "gemini" && config.llm.apiKey ? createGeminiExtractor({ apiKey: config.llm.apiKey, model: config.llm.model }) : disabledExtractor;
}

/** Calls already spent on the source, across all runs: the test budget is shared (OPEN-087). */
export async function usedCalls(source: string): Promise<number> {
  const total = await prisma.externalImportRun.aggregate({ where: { source }, _sum: { callsMade: true } });
  return total._sum.callsMade ?? 0;
}

/** Layers of OPEN-028, in order, only against external jobs. Doubt keeps the records apart. */
async function findDuplicate(tx: Prisma.TransactionClient, source: string, candidate: ExternalCandidate): Promise<string | null> {
  const byId = await tx.job.findFirst({ where: { origin: "EXTERNAL", externalSource: source, externalId: candidate.externalId }, select: { id: true } });
  if (byId) return "Mesmo identificador do anúncio na fonte.";
  const link = urlKey(candidate.url);
  if (link && await tx.job.findFirst({ where: { origin: "EXTERNAL", externalUrlKey: link }, select: { id: true } })) return "Mesmo link do anúncio original.";
  const attributes = attributeKey(candidate);
  if (attributes && await tx.job.findFirst({ where: { origin: "EXTERNAL", externalDedupKey: attributes }, select: { id: true } })) {
    return "Mesma empresa, título e cidade de uma vaga externa já importada.";
  }
  return null;
}

/**
 * One record, independently of the others (OPEN-029): validation of the minimum data, LLM only to fill what is missing,
 * deduplication and a single transaction that writes the job and the record result together. Never throws.
 */
async function processRecord(raw: unknown, phrase: string, runId: string, config: ExternalImportConfig, extractor: ExtractionPort, now: Date): Promise<RecordResult> {
  const write = (result: RecordResult, data: { externalId?: string | null; title?: string; reason?: string | null; usedLlm?: boolean; jobId?: string | null }, tx: Prisma.TransactionClient = prisma) =>
    tx.externalImportRecord.create({ data: { runId, phrase, result, externalId: data.externalId ?? null, title: (data.title ?? "").slice(0, 200), reason: data.reason ?? null, usedLlm: data.usedLlm ?? false, jobId: data.jobId ?? null } });
  const parsed = adzunaRecordSchema.safeParse(raw);
  if (!parsed.success) { await write("REJECTED", { reason: "Estrutura do registro não reconhecida." }); return "REJECTED"; }
  const candidate = fromAdzuna(parsed.data);
  let problems = minimumProblems(candidate);
  let usedLlm = false;
  let llmNote = "";
  // SPEC-006 5.3: the LLM is asked only for the company and the location, and only when the source left them out.
  if (problems.some((problem) => problem === "COMPANY" || problem === "LOCATION") && !problems.some((problem) => problem === "TITLE" || problem === "DESCRIPTION" || problem === "ORIGIN")) {
    const extraction = await extractWithRetries(extractor, { title: candidate.title, description: candidate.description });
    usedLlm = extractor.enabled;
    if (extraction.data) {
      if (problems.includes("COMPANY") && extraction.data.companyName) { candidate.companyName = extraction.data.companyName; candidate.origins.companyName = "LLM"; }
      if (problems.includes("LOCATION") && extraction.data.city && extraction.data.state) {
        candidate.city = extraction.data.city; candidate.state = extraction.data.state as ExternalCandidate["state"];
        candidate.origins.city = "LLM"; candidate.origins.state = "LLM";
      }
      problems = minimumProblems(candidate);
    } else if (extraction.reason) llmNote = ` (${extraction.reason})`;
  }
  const base = { externalId: candidate.externalId || null, title: candidate.title, usedLlm };
  if (problems.length) {
    await write("REJECTED", { ...base, reason: `Dados mínimos ausentes: ${problems.map((problem) => problemLabels[problem]).join("; ")}.${llmNote}` });
    return "REJECTED";
  }
  try {
    return await prisma.$transaction(async (tx) => {
      const duplicate = await findDuplicate(tx, config.source, candidate);
      if (duplicate) { await write("DUPLICATE", { ...base, reason: duplicate }, tx); return "DUPLICATE" as const; }
      const job = await tx.job.create({ data: {
        origin: "EXTERNAL", status: "OPEN", companyId: null, createdByUserId: null,
        title: candidate.title, description: candidate.description, requirements: "", modality: null, professionalArea: inferProfessionalArea(candidate.title),
        locationCity: candidate.city, locationState: candidate.state, locationAddress: "", deadline: null,
        salaryMin: candidate.salaryMin, salaryMax: candidate.salaryMax !== null && candidate.salaryMin !== null && candidate.salaryMax < candidate.salaryMin ? null : candidate.salaryMax,
        // RB-16: nothing about accessibility is declared by the source; every item stays "não informado".
        accessibility: {}, technicalCriteria: {},
        publishedAt: candidate.publishedAt ?? now,
        externalSource: config.source, externalId: candidate.externalId, externalUrl: candidate.url, externalUrlKey: urlKey(candidate.url) || null,
        externalCompanyName: candidate.companyName, externalDedupKey: attributeKey(candidate) || null,
        externalFieldOrigins: candidate.origins, externalFetchedAt: now
      }, select: { id: true } });
      await write("PROCESSED", { ...base, jobId: job.id }, tx);
      return "PROCESSED" as const;
    });
  } catch (error) {
    // Two runs (or two phrases) wrote the same identifier at once: the database kept one job (first layer of OPEN-028).
    if (isUniqueViolation(error)) { await write("DUPLICATE", { ...base, reason: "Mesmo identificador do anúncio na fonte." }).catch(() => {}); return "DUPLICATE"; }
    await write("FAILED", { ...base, reason: "Falha ao gravar a vaga; nada foi alterado. Uma nova execução pode tentar de novo." }).catch(() => {});
    return "FAILED";
  }
}

/**
 * SPEC-006: one ingestion run. Spends at most the calls left in the budget (one page per phrase, a single retry for
 * recoverable failures, each attempt counted), processes every record on its own and records the aggregate result.
 */
export async function runExternalImport(params: { trigger: Trigger; userId?: string | null }, deps: Deps = {}): Promise<RunResult> {
  const config = deps.config ?? externalImportConfig();
  const now = deps.now ?? (() => new Date());
  if (!config.configured) return { error: { status: 503, message: "As credenciais do Adzuna não estão configuradas no servidor." } };
  if (params.trigger === "SCHEDULE" && !config.scheduleEnabled) return { error: { status: 409, message: "A coleta diária está desligada até a autorização de uso contínuo da fonte." } };

  await prisma.externalImportRun.updateMany({
    where: { source: config.source, status: "RUNNING", startedAt: { lt: new Date(now().getTime() - STALE_RUN_MS) } },
    data: { status: "FAILED", error: "Execução interrompida antes do fim.", finishedAt: now() }
  });
  const remaining = config.callBudget - await usedCalls(config.source);
  if (remaining <= 0) return { error: { status: 409, message: `O limite de ${config.callBudget} chamadas de teste ao Adzuna já foi usado.` } };
  const callLimit = Math.min(config.maxCallsPerRun, remaining);

  let runId: string;
  try {
    runId = (await prisma.externalImportRun.create({ data: { source: config.source, trigger: params.trigger, startedByUserId: params.userId ?? null, callLimit }, select: { id: true } })).id;
  } catch (error) {
    if (isUniqueViolation(error)) return { error: { status: 409, message: "Já existe uma importação em andamento." } };
    throw error;
  }

  const extractor = deps.extractor ?? defaultExtractor(config);
  const queries: Query[] = [];
  const counts = { received: 0, PROCESSED: 0, REJECTED: 0, DUPLICATE: 0, FAILED: 0 };
  let callsMade = 0;
  let generalError: string | null = null;
  try {
    for (const phrase of config.phrases) {
      if (callsMade >= callLimit) break;
      const query: Query = { phrase, page: 1, attempts: 0, status: "ERROR", httpStatus: null, results: 0, error: null };
      queries.push(query);
      let outcome = null as Awaited<ReturnType<typeof callAdzuna>> | null;
      // A recoverable failure is retried once, if the budget allows; the retry counts as a call.
      for (let attempt = 1; attempt <= 2 && callsMade < callLimit; attempt += 1) {
        callsMade += 1; query.attempts = attempt;
        await prisma.externalImportRun.update({ where: { id: runId }, data: { callsMade } });
        outcome = await callAdzuna(config, phrase, 1, deps.fetchFn);
        if (outcome.status === "OK" || !outcome.recoverable) break;
      }
      if (!outcome) break;
      query.httpStatus = outcome.httpStatus ?? null;
      if (outcome.status === "ERROR") { query.error = outcome.message; continue; }
      query.status = "OK"; query.results = outcome.results.length;
      for (const raw of outcome.results) {
        counts.received += 1;
        counts[await processRecord(raw, phrase, runId, config, extractor, now())] += 1;
      }
    }
  } catch {
    generalError = "A execução foi interrompida por um erro inesperado; os registros já gravados foram mantidos.";
  }

  const okQueries = queries.filter((query) => query.status === "OK").length;
  const status: RunSummary["status"] = generalError || okQueries === 0 ? "FAILED"
    : counts.FAILED > 0 || okQueries < queries.length ? "PARTIAL" : "SUCCEEDED";
  const totals = { received: counts.received, processed: counts.PROCESSED, rejected: counts.REJECTED, duplicates: counts.DUPLICATE, failed: counts.FAILED };
  const error = generalError ?? (okQueries === 0 ? queries.find((query) => query.error)?.error ?? "Nenhuma consulta foi concluída." : null);
  await prisma.$transaction([
    prisma.externalImportRun.update({ where: { id: runId }, data: { status, callsMade, queries: queries as unknown as Prisma.InputJsonValue, ...totals, error, finishedAt: now() } }),
    prisma.auditEvent.create({ data: {
      actorUserId: params.userId ?? null, eventType: "EXTERNAL_IMPORT_FINISHED", subjectType: "ExternalImportRun", subjectId: runId,
      metadata: { source: config.source, trigger: params.trigger, status, callsMade, ...totals }
    } })
  ]);
  return { summary: { id: runId, status, callsMade, callLimit, remainingCalls: Math.max(0, remaining - callsMade), queries, error, ...totals } };
}

/** Runs and their records, newest first, for the administrator (T-006-21 to T-006-25). */
export async function listImportRuns(limit = 20) {
  const config = externalImportConfig();
  const [runs, used] = await Promise.all([
    prisma.externalImportRun.findMany({ where: { source: config.source }, orderBy: { startedAt: "desc" }, take: limit }),
    usedCalls(config.source)
  ]);
  return {
    configured: config.configured, scheduleEnabled: config.scheduleEnabled, llm: config.llm.provider === "gemini" && Boolean(config.llm.apiKey),
    phrases: config.phrases, callBudget: config.callBudget, usedCalls: used, remainingCalls: Math.max(0, config.callBudget - used), maxCallsPerRun: config.maxCallsPerRun,
    runs: runs.map((run) => ({
      id: run.id, trigger: run.trigger, status: run.status, startedAt: run.startedAt.toISOString(), finishedAt: run.finishedAt?.toISOString() ?? null,
      callsMade: run.callsMade, callLimit: run.callLimit, received: run.received, processed: run.processed, rejected: run.rejected,
      duplicates: run.duplicates, failed: run.failed, error: run.error, queries: run.queries as Query[]
    }))
  };
}

export async function getImportRecords(runId: string) {
  const records = await prisma.externalImportRecord.findMany({ where: { runId }, orderBy: { createdAt: "asc" }, take: 500 });
  return records.map((record) => ({
    id: record.id, phrase: record.phrase, externalId: record.externalId, title: record.title, result: record.result,
    reason: record.reason, usedLlm: record.usedLlm, jobId: record.jobId
  }));
}
