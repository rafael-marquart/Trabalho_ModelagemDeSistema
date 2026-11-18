import { brazilianStates } from "@/lib/candidate-profile/options";
import type { AdzunaRecord } from "./adzuna";
import { comparisonKey, letterCount, plainText, wordCount } from "./text";

type State = (typeof brazilianStates)[number];

const stateNames: Record<string, State> = {
  acre: "AC", alagoas: "AL", amapa: "AP", amazonas: "AM", bahia: "BA", ceara: "CE", "distrito federal": "DF", "espirito santo": "ES",
  goias: "GO", maranhao: "MA", "mato grosso": "MT", "mato grosso do sul": "MS", "minas gerais": "MG", para: "PA", paraiba: "PB",
  parana: "PR", pernambuco: "PE", piaui: "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN", "rio grande do sul": "RS",
  rondonia: "RO", roraima: "RR", "santa catarina": "SC", "sao paulo": "SP", sergipe: "SE", tocantins: "TO"
};

/** UF of a state written as a name or as the two-letter code; "" when it cannot be identified with certainty. */
export function toState(value: string | null | undefined): State | "" {
  const key = comparisonKey(value ?? "");
  if (!key) return "";
  const upper = key.toUpperCase();
  if ((brazilianStates as readonly string[]).includes(upper)) return upper as State;
  return stateNames[key] ?? "";
}

export type FieldOrigin = "SOURCE" | "LLM";

/** A record of the source mapped to the common job fields (documented mapping, RNF-16), before the minimum-data checks. */
export type ExternalCandidate = {
  externalId: string; url: string; title: string; description: string; companyName: string; city: string; state: State | "";
  publishedAt: Date | null; salaryMin: number | null; salaryMax: number | null;
  origins: Record<"companyName" | "city" | "state", FieldOrigin>;
};

/**
 * Adzuna → AcessaVagas. title/description: HTML removed; company: company.display_name; location: location.area
 * (country, state, city, district…) or, without it, "City, State" in location.display_name; url: redirect_url;
 * publishedAt: created; salary only when the source declared it (salary_is_predicted = 0). Nothing is guessed.
 */
export function fromAdzuna(record: AdzunaRecord): ExternalCandidate {
  const area = (record.location?.area ?? []).map((part) => plainText(part));
  let state: State | "" = area.length >= 2 ? toState(area[1]) : "";
  let city = area.length >= 3 ? area[2] : "";
  if (!state || !city) {
    const parts = plainText(record.location?.display_name).split(",").map((part) => part.trim()).filter(Boolean);
    if (parts.length >= 2 && toState(parts[parts.length - 1])) { state = toState(parts[parts.length - 1]); city = parts[0]; }
  }
  const predicted = String(record.salary_is_predicted ?? "0") === "1";
  const salary = (value: number | undefined) => (!predicted && typeof value === "number" && Number.isFinite(value) && value > 0 ? Math.round(value * 100) / 100 : null);
  const created = record.created ? new Date(record.created) : null;
  return {
    externalId: record.id.trim(), url: (record.redirect_url ?? "").trim(),
    title: plainText(record.title).slice(0, 200), description: plainText(record.description).slice(0, 8000),
    companyName: plainText(record.company?.display_name).slice(0, 200),
    city: state ? city.slice(0, 120) : "", state,
    publishedAt: created && !Number.isNaN(created.getTime()) ? created : null,
    salaryMin: salary(record.salary_min), salaryMax: salary(record.salary_max),
    origins: { companyName: "SOURCE", city: "SOURCE", state: "SOURCE" }
  };
}

const genericTitles = new Set(["vaga", "vagas", "emprego", "empregos", "oportunidade", "oportunidades", "job", "jobs", "trabalho", "teste", "pcd", "vaga pcd"]);
const placeholderCompanies = ["adzuna", "confidencial", "empresa confidencial", "sigiloso", "sigilosa", "empresa sigilosa", "nao informado", "nao informada", "n a", "diversas", "varias empresas", "empresa"];

export type MinimumProblem = "TITLE" | "DESCRIPTION" | "COMPANY" | "LOCATION" | "ORIGIN";
export const problemLabels: Record<MinimumProblem, string> = {
  TITLE: "título sem conteúdo significativo",
  DESCRIPTION: "descrição sem detalhes úteis",
  COMPANY: "empresa contratante não identificável",
  LOCATION: "localidade não identificável",
  ORIGIN: "sem identificador ou link do anúncio original"
};

const isHttpUrl = (value: string) => {
  try { const url = new URL(value); return url.protocol === "https:" || url.protocol === "http:"; } catch { return false; }
};

/**
 * Minimum data of an external job (OPEN-025, SPEC-006 section 5.2): content and consistency, not only presence.
 * Returns the problems found; an empty list means the record may become a job.
 */
export function minimumProblems(candidate: ExternalCandidate): MinimumProblem[] {
  const problems: MinimumProblem[] = [];
  const title = comparisonKey(candidate.title);
  if (letterCount(candidate.title) < 3 || genericTitles.has(title)) problems.push("TITLE");
  const description = comparisonKey(candidate.description);
  if (candidate.description.length < 60 || wordCount(candidate.description) < 8 || description === title) problems.push("DESCRIPTION");
  const company = comparisonKey(candidate.companyName);
  // The source portal does not replace the hiring company.
  if (letterCount(candidate.companyName) < 2 || placeholderCompanies.includes(company) || company.includes("adzuna")) problems.push("COMPANY");
  if (!candidate.state || letterCount(candidate.city) < 2 || comparisonKey(candidate.city) === "brasil") problems.push("LOCATION");
  if (!candidate.externalId || !isHttpUrl(candidate.url)) problems.push("ORIGIN");
  return problems;
}

/** First layers of the deduplication (OPEN-028): the original link without query string, fragment, "www." or final "/". */
export function urlKey(value: string): string {
  try {
    const url = new URL(value);
    return `${url.hostname.toLowerCase().replace(/^www\./, "")}${url.pathname.replace(/\/+$/, "")}`;
  } catch { return ""; }
}

/** Third layer: company, title, city and state, normalized. Used only when all four are present. */
export function attributeKey(candidate: Pick<ExternalCandidate, "companyName" | "title" | "city" | "state">): string {
  const parts = [candidate.companyName, candidate.title, candidate.city, candidate.state].map(comparisonKey);
  return parts.every(Boolean) ? parts.join("|") : "";
}
