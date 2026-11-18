/**
 * SPEC-006 settings, read from the environment. Credentials stay on the server (`.env` locally, the hosting panel in
 * production) and are never written to the database, the audit log or a response.
 */
export const ADZUNA_SOURCE = "ADZUNA";

// OPEN-087: the current stage allows at most 25 test calls in total. This is a setting, not a ceiling of the program.
const DEFAULT_CALL_BUDGET = 25;
const DEFAULT_CALLS_PER_RUN = 5;
const DEFAULT_PHRASES = ["pessoa com deficiência", "vaga pcd", "exclusiva pcd", "afirmativa pcd", "pcd"];

const positiveInt = (value: string | undefined, fallback: number, max: number) => {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? Math.min(number, max) : fallback;
};

export type ExternalImportConfig = {
  source: typeof ADZUNA_SOURCE;
  configured: boolean;
  appId: string;
  appKey: string;
  // Search endpoint; only tests point it elsewhere (a local fake of the source).
  apiUrl: string;
  country: string;
  phrases: string[];
  resultsPerPage: number;
  callBudget: number;
  maxCallsPerRun: number;
  // Daily run (T-006-01): off until the continuous use of the source is authorized (OPEN-086/087).
  scheduleEnabled: boolean;
  llm: { provider: "off" | "gemini"; apiKey: string; model: string };
};

export function externalImportConfig(env: Record<string, string | undefined> = process.env): ExternalImportConfig {
  const appId = env.ADZUNA_APP_ID?.trim() ?? "";
  const appKey = env.ADZUNA_APP_KEY?.trim() ?? "";
  const phrases = (env.ADZUNA_PHRASES ?? "").split(/[;\n]/).map((phrase) => phrase.trim()).filter(Boolean);
  const provider = env.EXTERNAL_JOBS_LLM?.trim().toLowerCase() === "gemini" ? "gemini" : "off";
  return {
    source: ADZUNA_SOURCE,
    configured: Boolean(appId && appKey),
    appId, appKey,
    apiUrl: (env.ADZUNA_API_URL?.trim() || "https://api.adzuna.com/v1/api/jobs").replace(/\/+$/, ""),
    country: /^[a-z]{2}$/.test(env.ADZUNA_COUNTRY?.trim() ?? "") ? env.ADZUNA_COUNTRY!.trim() : "br",
    phrases: (phrases.length ? phrases : DEFAULT_PHRASES).slice(0, 20),
    resultsPerPage: positiveInt(env.ADZUNA_RESULTS_PER_PAGE, 20, 50),
    callBudget: positiveInt(env.ADZUNA_CALL_BUDGET, DEFAULT_CALL_BUDGET, 100000),
    maxCallsPerRun: positiveInt(env.ADZUNA_MAX_CALLS_PER_RUN, DEFAULT_CALLS_PER_RUN, 1000),
    scheduleEnabled: env.EXTERNAL_IMPORT_SCHEDULE?.trim().toLowerCase() === "on",
    llm: { provider, apiKey: env.GEMINI_API_KEY?.trim() ?? "", model: env.GEMINI_MODEL?.trim() || "gemini-2.5-flash" }
  };
}
