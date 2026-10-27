import { z } from "zod";
import { infrastructureItems, infrastructureStatuses, NOTE_MAX_LENGTH, type InfrastructureStatus } from "./items";

export type InfrastructureAnswer = { status: InfrastructureStatus; note: string };
export type InfrastructureAnswers = Record<string, InfrastructureAnswer>;

const answerSchema = z.object({
  status: z.enum(infrastructureStatuses),
  note: z.string().trim().max(NOTE_MAX_LENGTH, `Use até ${NOTE_MAX_LENGTH} caracteres na observação.`).default("")
}).strict();

const knownCodes = new Set(infrastructureItems.map((item) => item.code));

export const infrastructureInputSchema = z.object({
  answers: z.record(z.string(), answerSchema)
}).strict().superRefine((input, context) => {
  for (const code of Object.keys(input.answers)) {
    if (!knownCodes.has(code)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["answers", code], message: "Item desconhecido." });
    }
  }
  // Required items must be answered with a declared presence or absence; "not informed" does not satisfy them.
  for (const item of infrastructureItems) {
    if (!item.required) continue;
    const status = input.answers[item.code]?.status;
    if (status !== "PRESENT" && status !== "ABSENT") {
      context.addIssue({
        code: z.ZodIssueCode.custom, path: ["answers", item.code],
        message: `Informe se há ou não há: ${item.label.toLocaleLowerCase()}.`
      });
    }
  }
});

// Unanswered items are returned as NOT_INFORMED: absence of data never implies presence or absence (RB-16).
export function normalizeAnswers(value: unknown): InfrastructureAnswers {
  const stored = value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
  const result: InfrastructureAnswers = {};
  for (const item of infrastructureItems) {
    const parsed = answerSchema.safeParse(stored[item.code]);
    result[item.code] = parsed.success ? parsed.data : { status: "NOT_INFORMED", note: "" };
  }
  return result;
}

export function canonicalAnswers(answers: InfrastructureAnswers): string {
  return JSON.stringify(infrastructureItems.map((item) => [item.code, answers[item.code]?.status ?? "NOT_INFORMED", answers[item.code]?.note ?? ""]));
}

export type InfrastructureChange = { item: string; type: "ADDED" | "CHANGED" | "REMOVED" };

// Change descriptions record only which item changed and how, never the declared values or notes.
export function describeChanges(before: InfrastructureAnswers | null, after: InfrastructureAnswers): InfrastructureChange[] {
  const changes: InfrastructureChange[] = [];
  for (const item of infrastructureItems) {
    const previous = before?.[item.code];
    const next = after[item.code];
    const previousInformed = previous && previous.status !== "NOT_INFORMED";
    const nextInformed = next && next.status !== "NOT_INFORMED";
    if (!previousInformed && nextInformed) changes.push({ item: item.code, type: "ADDED" });
    else if (previousInformed && !nextInformed) changes.push({ item: item.code, type: "REMOVED" });
    else if (previous && next && (previous.status !== next.status || previous.note !== next.note)) changes.push({ item: item.code, type: "CHANGED" });
  }
  return changes;
}
