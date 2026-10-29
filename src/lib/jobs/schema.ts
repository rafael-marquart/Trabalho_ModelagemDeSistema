import { z } from "zod";
import { infrastructureItems, infrastructureStatuses, statusLabels } from "@/lib/company-infrastructure/items";
import { emptyCriteria, normalizeCriteria, technicalCriteriaSchema, type TechnicalCriteria } from "./criteria";
import { brazilianStates, jobModalities, TEXT_LIMITS, type JobModalityValue } from "./constants";

const knownAccessibilityCodes = new Set(infrastructureItems.map((item) => item.code));
const dateText = z.string().trim().refine((value) => value === "" || isValidDate(value), "Informe uma data válida.");

export function isValidDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

// Today's date in Brazil, used to compare the registration deadline with "the current date".
export function todayInBrazil(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  return parts; // YYYY-MM-DD
}

const salary = z.number().finite().min(0, "O valor não pode ser negativo.").max(100000000).nullable().default(null);

// Draft input: lenient on completeness, strict on shape and limits.
export const jobInputSchema = z.object({
  title: z.string().trim().max(TEXT_LIMITS.title, `Use até ${TEXT_LIMITS.title} caracteres.`).default(""),
  description: z.string().trim().max(TEXT_LIMITS.description, `Use até ${TEXT_LIMITS.description} caracteres.`).default(""),
  requirements: z.string().trim().max(TEXT_LIMITS.requirements, `Use até ${TEXT_LIMITS.requirements} caracteres.`).default(""),
  modality: z.enum([...jobModalities, ""] as const).default(""),
  locationCity: z.string().trim().max(TEXT_LIMITS.city).default(""),
  locationState: z.enum([...brazilianStates, ""] as const).default(""),
  locationAddress: z.string().trim().max(TEXT_LIMITS.address).default(""),
  deadline: dateText.default(""),
  salaryMin: salary,
  salaryMax: salary,
  accessibility: z.record(z.string(), z.enum(infrastructureStatuses)).default({}),
  technicalCriteria: technicalCriteriaSchema.default({ ...emptyCriteria })
}).strict().superRefine((input, context) => {
  for (const code of Object.keys(input.accessibility)) {
    if (!knownAccessibilityCodes.has(code)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["accessibility", code], message: "Item de acessibilidade desconhecido." });
    }
  }
});

export type JobInput = z.infer<typeof jobInputSchema>;

export type JobFields = {
  title: string; description: string; requirements: string; modality: JobModalityValue | "";
  locationCity: string; locationState: string; locationAddress: string; deadline: string;
  salaryMin: number | null; salaryMax: number | null; accessibility: Record<string, string>;
  technicalCriteria: TechnicalCriteria;
};

const effective = (value: string) => value.trim().length > 0;

/**
 * Publication rules (OPEN-020/021). Returns a message per field/problem; empty means publishable.
 * Runs in the application layer so the same rules apply regardless of the interface used.
 */
export function validateForPublication(job: JobFields, today = todayInBrazil()): Record<string, string> {
  const issues: Record<string, string> = {};
  if (!effective(job.title)) issues.title = "Informe o cargo ou título da vaga.";
  if (!effective(job.description)) issues.description = "Descreva o trabalho e suas condições.";
  if (!effective(job.requirements)) issues.requirements = "Informe os requisitos da vaga.";
  if (!job.modality) issues.modality = "Escolha a modalidade de trabalho.";
  if (job.modality === "PRESENCIAL" || job.modality === "HIBRIDO") {
    if (!effective(job.locationCity)) issues.locationCity = "Informe a cidade do local de trabalho.";
    if (!job.locationState) issues.locationState = "Informe o estado do local de trabalho.";
  }
  if (!job.deadline) issues.deadline = "Informe o prazo de inscrição.";
  else if (!isValidDate(job.deadline)) issues.deadline = "Informe uma data válida.";
  else if (job.deadline < today) issues.deadline = "O prazo de inscrição não pode ser anterior à data de hoje.";
  if (job.salaryMin !== null && job.salaryMax !== null && job.salaryMin > job.salaryMax) {
    issues.salary = "O valor mínimo da faixa salarial não pode ser maior que o máximo.";
  }
  for (const item of infrastructureItems) {
    const status = job.accessibility[item.code];
    if (!status) issues[`accessibility.${item.code}`] = `Declare o estado da informação: ${item.label.toLocaleLowerCase()} (${Object.values(statusLabels).join(", ")}).`;
  }
  return issues;
}

type JobRow = {
  id: string; companyId: string; status: string; origin: string; title: string; description: string; requirements: string;
  modality: string | null; locationCity: string; locationState: string; locationAddress: string; deadline: Date | null;
  salaryMin: unknown; salaryMax: unknown; accessibility: unknown; technicalCriteria?: unknown; publishedAt: Date | null; closedAt: Date | null;
  createdAt: Date; updatedAt: Date;
};

const toNumber = (value: unknown) => (value === null || value === undefined ? null : Number(value));

export function rowToFields(row: JobRow): JobFields {
  const stored = row.accessibility && typeof row.accessibility === "object" && !Array.isArray(row.accessibility)
    ? (row.accessibility as Record<string, unknown>) : {};
  const accessibility: Record<string, string> = {};
  for (const item of infrastructureItems) {
    const value = stored[item.code];
    if (typeof value === "string" && (infrastructureStatuses as readonly string[]).includes(value)) accessibility[item.code] = value;
  }
  return {
    title: row.title, description: row.description, requirements: row.requirements,
    modality: (row.modality ?? "") as JobFields["modality"], locationCity: row.locationCity, locationState: row.locationState,
    locationAddress: row.locationAddress, deadline: row.deadline ? row.deadline.toISOString().slice(0, 10) : "",
    salaryMin: toNumber(row.salaryMin), salaryMax: toNumber(row.salaryMax), accessibility,
    technicalCriteria: normalizeCriteria(row.technicalCriteria)
  };
}

export function toJobResponse(row: JobRow) {
  return {
    id: row.id, status: row.status, origin: row.origin, ...rowToFields(row),
    publishedAt: row.publishedAt ? row.publishedAt.toISOString() : null,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString()
  };
}

export function fieldsToData(fields: JobFields) {
  return {
    title: fields.title, description: fields.description, requirements: fields.requirements,
    modality: fields.modality === "" ? null : fields.modality,
    locationCity: fields.locationCity, locationState: fields.locationState, locationAddress: fields.locationAddress,
    deadline: fields.deadline ? new Date(`${fields.deadline}T00:00:00.000Z`) : null,
    salaryMin: fields.salaryMin, salaryMax: fields.salaryMax, accessibility: fields.accessibility,
    technicalCriteria: fields.technicalCriteria
  };
}

// Names of the fields whose values differ; audit records only these names, never the content.
export function changedFieldNames(before: JobFields, after: JobFields): string[] {
  const names: string[] = [];
  for (const key of Object.keys(after) as (keyof JobFields)[]) {
    if (JSON.stringify(canonical(before[key])) !== JSON.stringify(canonical(after[key]))) names.push(key);
  }
  return names;
}

function canonical(value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)));
  }
  return value;
}
