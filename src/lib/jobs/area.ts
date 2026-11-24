import { normalizeText } from "@/lib/compatibility/text";
import type { ProfessionalArea } from "./constants";

/**
 * Professional area of an external job (SPEC-006), inferred from its title, since the source does not send one.
 * Deterministic keyword rules, checked in order (the more specific areas first); a title that matches none is "Outra".
 * Each keyword matches the start of a word of the normalized title (no accents, lowercase), so "engenheir" finds
 * "engenheiro" and "engenheira"; keywords shorter than four letters ("ti", "rh", "sac") match only the whole word.
 */
const rules: { area: ProfessionalArea; keywords: string[] }[] = [
  { area: "Tecnologia da informação", keywords: [
    "desenvolvedor", "programador", "software", "dados", "ti", "sistemas", "suporte", "devops", "front end", "frontend",
    "back end", "backend", "full stack", "fullstack", "qa", "tester", "computacao", "informatica", "ux", "ui", "redes", "infraestrutura de ti"
  ] },
  { area: "Saúde", keywords: [
    "enfermeir", "enfermagem", "medic", "farmac", "cuidador", "fisioterap", "psicolog", "dentista", "odonto", "nutricion", "saude",
    "hospital", "clinic", "radiolog", "laborator"
  ] },
  { area: "Jurídico", keywords: ["advogad", "juridic", "paralegal"] },
  { area: "Recursos humanos", keywords: ["recursos humanos", "rh", "recrutador", "recrutamento", "departamento pessoal", "dp"] },
  { area: "Finanças e contabilidade", keywords: [
    "financeir", "contab", "contador", "fiscal", "faturamento", "cobranca", "tesouraria", "contas a pagar", "contas a receber", "auditor"
  ] },
  { area: "Educação", keywords: ["professor", "monitor", "educador", "pedagog", "instrutor", "tutor", "ensino", "escola"] },
  { area: "Comunicação e marketing", keywords: ["marketing", "comunicacao", "social media", "designer", "redator", "jornalis", "publicidade"] },
  { area: "Engenharia", keywords: ["engenheir", "engenharia", "projetista"] },
  { area: "Comercial e vendas", keywords: ["vendedor", "vendas", "comercial", "negocios", "representante", "promotor", "executivo de contas"] },
  { area: "Atendimento ao cliente", keywords: [
    "atendente", "atendimento", "telemarketing", "recepcionista", "sac", "call center", "operador de caixa", "caixa", "garcom", "garconete"
  ] },
  { area: "Logística e operações", keywords: [
    "estoquista", "estoque", "almoxarif", "logistic", "expedicao", "conferente", "separador", "repositor", "motorista", "entregador",
    "armazem", "abastecedor", "montador", "producao", "operador", "servicos gerais", "limpeza", "zelador", "porteiro", "manutencao",
    "compras", "comprador", "mecanic", "eletricista", "ajudante"
  ] },
  { area: "Administração", keywords: ["administrativ", "administracao", "escritorio", "secretari", "assistente", "auxiliar"] }
];

const SHORT = 4;

function matches(words: string[], text: string, keyword: string): boolean {
  if (keyword.includes(" ")) return ` ${text} `.includes(` ${keyword}`);
  return words.some((word) => (keyword.length < SHORT ? word === keyword : word.startsWith(keyword)));
}

/** Area shown and filtered for a job: the one the company chose, or, for an external job without one, the inferred area. */
export function jobProfessionalArea(job: { origin: string; title: string; professionalArea: string | null }): string {
  if (job.professionalArea) return job.professionalArea;
  return job.origin === "EXTERNAL" ? inferProfessionalArea(job.title) : "";
}

export function inferProfessionalArea(title: string): ProfessionalArea {
  const text = normalizeText(title).replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const words = text.split(" ").filter(Boolean);
  for (const rule of rules) if (rule.keywords.some((keyword) => matches(words, text, keyword))) return rule.area;
  return "Outra";
}
