import { describe, expect, it } from "vitest";
import { infrastructureItems } from "./items";
import { describeChanges, infrastructureInputSchema, normalizeAnswers, type InfrastructureAnswers } from "./schema";

const complete = () => Object.fromEntries(infrastructureItems.map((item) => [item.code, { status: "PRESENT", note: "" }]));

describe("company infrastructure schema", () => {
  it("accepts a complete questionnaire", () => {
    expect(infrastructureInputSchema.safeParse({ answers: complete() }).success).toBe(true);
  });

  it("blocks saving while a required item is unanswered or not informed, naming the item", () => {
    const answers = complete() as Record<string, { status: string; note: string }>;
    delete answers.RAMPS;
    answers.ELEVATORS = { status: "NOT_INFORMED", note: "" };
    const result = infrastructureInputSchema.safeParse({ answers });
    expect(result.success).toBe(false);
    const paths = result.success ? [] : result.error.issues.map((issue) => issue.path[1]);
    expect(paths).toEqual(expect.arrayContaining(["RAMPS", "ELEVATORS"]));
    expect(paths).toHaveLength(2);
  });

  it("rejects unknown items, unknown statuses, long notes and extra fields", () => {
    expect(infrastructureInputSchema.safeParse({ answers: { ...complete(), TELEPORT: { status: "PRESENT", note: "" } } }).success).toBe(false);
    expect(infrastructureInputSchema.safeParse({ answers: { ...complete(), RAMPS: { status: "MAYBE", note: "" } } }).success).toBe(false);
    expect(infrastructureInputSchema.safeParse({ answers: { ...complete(), RAMPS: { status: "PRESENT", note: "x".repeat(301) } } }).success).toBe(false);
    expect(infrastructureInputSchema.safeParse({ answers: complete(), companyId: "other" }).success).toBe(false);
  });

  it("returns unanswered items as NOT_INFORMED instead of presence or absence", () => {
    const normalized = normalizeAnswers({ RAMPS: { status: "ABSENT", note: "" } });
    expect(normalized.RAMPS.status).toBe("ABSENT");
    expect(normalized.ELEVATORS).toEqual({ status: "NOT_INFORMED", note: "" });
    expect(Object.keys(normalizeAnswers(null))).toHaveLength(infrastructureItems.length);
  });

  it("describes changes by item and type without copying values or notes", () => {
    const before = normalizeAnswers({ RAMPS: { status: "PRESENT", note: "segredo" } });
    const after: InfrastructureAnswers = normalizeAnswers({ RAMPS: { status: "ABSENT", note: "segredo" }, ELEVATORS: { status: "PRESENT", note: "" } });
    const changes = describeChanges(before, after);
    expect(changes).toEqual([{ item: "RAMPS", type: "CHANGED" }, { item: "ELEVATORS", type: "ADDED" }]);
    expect(JSON.stringify(changes)).not.toContain("segredo");
  });
});
