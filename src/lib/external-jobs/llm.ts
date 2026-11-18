import { z } from "zod";
import type { FetchFn } from "./adzuna";
import { toState } from "./record";
import { appearsIn, plainText } from "./text";

/**
 * ADR-003: the LLM sits behind this port, on the server only. It may suggest the hiring company and the location when
 * the source left them out; every suggestion is validated against the ad text before use and never replaces the source
 * (RB-11, RB-18). Without a configured provider the port is off and the import continues with the source data alone.
 */
export type ExtractionInput = { title: string; description: string };
export type Extraction = { companyName: string | null; city: string | null; state: string | null };
export type ExtractionResult = { status: "OK"; data: unknown } | { status: "FAILED"; recoverable: boolean; reason: string };
export type ExtractionPort = { readonly name: string; readonly enabled: boolean; extract(input: ExtractionInput): Promise<ExtractionResult> };

export const disabledExtractor: ExtractionPort = {
  name: "off", enabled: false,
  async extract() { return { status: "FAILED", recoverable: false, reason: "Extração por LLM desligada." }; }
};

const extractionSchema = z.object({
  companyName: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional()
}).strict();

/**
 * Keeps only what is written in the ad: a company or city the text does not contain is discarded, so the LLM cannot
 * invent them (SPEC-006 5.3 item 4); the state must be a Brazilian state. Returns null for an invalid answer.
 */
export function validateExtraction(data: unknown, input: ExtractionInput): Extraction | null {
  const parsed = extractionSchema.safeParse(data);
  if (!parsed.success) return null;
  const text = `${input.title} ${input.description}`;
  const keep = (value: string | null | undefined) => {
    const clean = plainText(value ?? "").slice(0, 200);
    return clean && appearsIn(clean, text) ? clean : null;
  };
  const stateText = plainText(parsed.data.state ?? "");
  const state = toState(stateText);
  return {
    companyName: keep(parsed.data.companyName),
    city: keep(parsed.data.city),
    state: state && (appearsIn(stateText, text) || appearsIn(state, text)) ? state : null
  };
}

/** Limited retries, only for recoverable failures and invalid answers; each answer is validated (OPEN-026). */
export async function extractWithRetries(port: ExtractionPort, input: ExtractionInput, attempts = 3): Promise<{ data: Extraction | null; reason: string | null }> {
  if (!port.enabled) return { data: null, reason: "extração por LLM desligada" };
  let reason = "resposta do LLM inválida";
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    const result = await port.extract(input);
    if (result.status === "OK") {
      const data = validateExtraction(result.data, input);
      if (data) return { data, reason: null };
      reason = "resposta do LLM inválida";
      continue;
    }
    reason = result.reason;
    if (!result.recoverable) break;
  }
  return { data: null, reason };
}

const prompt = (input: ExtractionInput) => [
  "Você extrai dados de um anúncio de emprego. Responda somente com JSON no formato {\"companyName\": string|null, \"city\": string|null, \"state\": string|null}.",
  "Regras: copie exatamente como está escrito no anúncio; use null quando a informação não estiver escrita; não deduza, não complete e não use conhecimento externo.",
  "companyName é a empresa contratante (não o site de empregos). city é a cidade do local de trabalho. state é o estado brasileiro.",
  `Título: ${input.title}`,
  `Anúncio: ${input.description}`
].join("\n");

/** Gemini adapter (REST). Chosen by configuration; another provider only needs another adapter for the same port. */
export function createGeminiExtractor(options: { apiKey: string; model: string; fetchFn?: FetchFn; timeoutMs?: number }): ExtractionPort {
  const fetchFn = options.fetchFn ?? fetch;
  return {
    name: "gemini", enabled: Boolean(options.apiKey),
    async extract(input) {
      let response: Response;
      try {
        response = await fetchFn(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(options.model)}:generateContent`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-goog-api-key": options.apiKey },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt(input) }] }], generationConfig: { temperature: 0, responseMimeType: "application/json" } }),
          signal: AbortSignal.timeout(options.timeoutMs ?? 20000)
        });
      } catch {
        return { status: "FAILED", recoverable: true, reason: "LLM indisponível" };
      }
      if (response.status === 429 || response.status >= 500) return { status: "FAILED", recoverable: true, reason: "LLM indisponível" };
      if (!response.ok) return { status: "FAILED", recoverable: false, reason: "LLM recusou a solicitação" };
      try {
        const body = await response.json() as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
        const text = body.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        return { status: "OK", data: JSON.parse(text) };
      } catch {
        return { status: "FAILED", recoverable: true, reason: "resposta do LLM inválida" };
      }
    }
  };
}
