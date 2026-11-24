import { z } from "zod";
import type { ExternalImportConfig } from "./config";

export type FetchFn = (input: string, init?: RequestInit) => Promise<Response>;

export type CallOutcome =
  | { status: "OK"; httpStatus: number; results: unknown[] }
  | { status: "ERROR"; recoverable: boolean; httpStatus?: number; message: string };

// Contract of the Adzuna search response (T-006-41): only `results` is required; each record is checked on its own.
const responseSchema = z.object({ results: z.array(z.unknown()) }).passthrough();

// Fields used from each Adzuna record. Optional ones may be absent; their absence is handled by the validation.
export const adzunaRecordSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  title: z.string().optional(),
  description: z.string().optional(),
  redirect_url: z.string().optional(),
  created: z.string().optional(),
  company: z.object({ display_name: z.string().optional() }).passthrough().optional(),
  location: z.object({ display_name: z.string().optional(), area: z.array(z.string()).optional() }).passthrough().optional(),
  salary_min: z.number().optional(),
  salary_max: z.number().optional(),
  salary_is_predicted: z.union([z.string(), z.number()]).optional()
}).passthrough();
export type AdzunaRecord = z.infer<typeof adzunaRecordSchema>;

/** Search URL for one phrase (`what_phrase`) and page. Contains the credentials: never log or store it. */
export function adzunaSearchUrl(config: ExternalImportConfig, phrase: string, page: number): string {
  const url = new URL(`${config.apiUrl}/${config.country}/search/${page}`);
  url.searchParams.set("app_id", config.appId);
  url.searchParams.set("app_key", config.appKey);
  url.searchParams.set("results_per_page", String(config.resultsPerPage));
  url.searchParams.set("what_phrase", phrase);
  url.searchParams.set("content-type", "application/json");
  return url.toString();
}

/**
 * One call to the Adzuna search. Network errors, time-outs, 429 and 5xx are recoverable (OPEN-029); other statuses and
 * a body that is not the expected JSON are permanent for this call. Messages never include the URL or the credentials.
 */
export async function callAdzuna(config: ExternalImportConfig, phrase: string, page: number, fetchFn: FetchFn = fetch, timeoutMs = 10000): Promise<CallOutcome> {
  let response: Response;
  try {
    response = await fetchFn(adzunaSearchUrl(config, phrase, page), { headers: { accept: "application/json" }, signal: AbortSignal.timeout(timeoutMs) });
  } catch (error) {
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return { status: "ERROR", recoverable: true, message: timedOut ? "A fonte não respondeu a tempo." : "Não foi possível conectar à fonte." };
  }
  if (response.status === 429) return { status: "ERROR", recoverable: true, httpStatus: 429, message: "Limite de chamadas da fonte atingido." };
  if (response.status >= 500) return { status: "ERROR", recoverable: true, httpStatus: response.status, message: "A fonte respondeu com erro temporário." };
  if (!response.ok) return { status: "ERROR", recoverable: false, httpStatus: response.status, message: response.status === 401 || response.status === 403 ? "A fonte recusou as credenciais." : "A fonte recusou a consulta." };
  let body: unknown;
  try { body = await response.json(); } catch {
    return { status: "ERROR", recoverable: false, httpStatus: response.status, message: "A resposta da fonte não é um JSON válido." };
  }
  const parsed = responseSchema.safeParse(body);
  if (!parsed.success) return { status: "ERROR", recoverable: false, httpStatus: response.status, message: "A resposta da fonte não segue o formato esperado." };
  return { status: "OK", httpStatus: response.status, results: parsed.data.results };
}
