import { describe, expect, it } from "vitest";
import { infrastructureItems } from "@/lib/company-infrastructure/items";
import { normalizeCriteria } from "./criteria";
import { changedFieldNames, fieldsToData, jobInputSchema, rowToFields, validateForPublication, type JobFields } from "./schema";

const accessibility = Object.fromEntries(infrastructureItems.map((item) => [item.code, "NOT_INFORMED"]));
const complete = (): JobFields => ({
  title: "Analista", description: "Descrição", requirements: "Requisitos", modality: "REMOTO", locationCity: "", locationState: "",
  locationAddress: "", deadline: "2026-12-31", salaryMin: null, salaryMax: null, accessibility,
  technicalCriteria: { skills: [], experience: [], educationMinLevel: "", languages: [] }
});

describe("job schema", () => {
  it("accepts an empty draft and fills defaults", () => {
    const parsed = jobInputSchema.parse({});
    expect(parsed.title).toBe("");
    expect(parsed.accessibility).toEqual({});
  });
  it("rejects unknown fields, unknown accessibility items and negative salaries", () => {
    expect(jobInputSchema.safeParse({ companyId: "x" }).success).toBe(false);
    expect(jobInputSchema.safeParse({ accessibility: { UNKNOWN: "PRESENT" } }).success).toBe(false);
    expect(jobInputSchema.safeParse({ salaryMin: -1 }).success).toBe(false);
  });
  it("lets a complete remote job be published", () => {
    expect(validateForPublication(complete(), "2026-10-27")).toEqual({});
  });
  it("reports every missing required field", () => {
    const issues = validateForPublication({ ...complete(), title: " ", description: "", requirements: "", modality: "", deadline: "", accessibility: {} }, "2026-10-27");
    expect(Object.keys(issues)).toEqual(expect.arrayContaining(["title", "description", "requirements", "modality", "deadline", ...infrastructureItems.map((i) => `accessibility.${i.code}`)]));
  });
  it("requires location for onsite and hybrid jobs only", () => {
    expect(validateForPublication({ ...complete(), modality: "PRESENCIAL" }, "2026-10-27")).toHaveProperty("locationCity");
    expect(validateForPublication({ ...complete(), modality: "HIBRIDO", locationCity: "Recife" }, "2026-10-27")).toHaveProperty("locationState");
    expect(validateForPublication({ ...complete(), modality: "HIBRIDO", locationCity: "Recife", locationState: "PE" }, "2026-10-27")).toEqual({});
  });
  it("rejects past or invalid deadlines but accepts today", () => {
    expect(validateForPublication({ ...complete(), deadline: "2026-10-26" }, "2026-10-27")).toHaveProperty("deadline");
    expect(validateForPublication({ ...complete(), deadline: "2026-02-31" }, "2026-10-27")).toHaveProperty("deadline");
    expect(validateForPublication({ ...complete(), deadline: "2026-10-27" }, "2026-10-27")).toEqual({});
  });
  it("rejects a salary range whose minimum exceeds the maximum", () => {
    expect(validateForPublication({ ...complete(), salaryMin: 5000, salaryMax: 3000 }, "2026-10-27")).toHaveProperty("salary");
    expect(validateForPublication({ ...complete(), salaryMin: 3000, salaryMax: 3000 }, "2026-10-27")).toEqual({});
  });
  it("round-trips rows and lists only changed field names", () => {
    const fields = complete();
    const data = fieldsToData(fields);
    const row = { id: "j", companyId: "c", status: "DRAFT", origin: "OWN", ...data, createdAt: new Date(), updatedAt: new Date(), publishedAt: null, closedAt: null };
    expect(rowToFields(row as never)).toEqual(fields);
    expect(changedFieldNames(fields, { ...fields, title: "Outro", accessibility: { ...accessibility, RAMPS: "PRESENT" } })).toEqual(["title", "accessibility"]);
    expect(changedFieldNames(fields, { ...fields, accessibility: Object.fromEntries(Object.entries(accessibility).reverse()) })).toEqual([]);
  });

  it("accepts technical criteria, rejects repeats and unknown levels, and tolerates old rows", () => {
    expect(jobInputSchema.safeParse({ technicalCriteria: { skills: ["SQL", "Java"], experience: ["Analista"], educationMinLevel: "Ensino médio", languages: [{ language: "Inglês", level: "Fluente" }] } }).success).toBe(true);
    expect(jobInputSchema.safeParse({ technicalCriteria: { skills: ["SQL", "sql"] } }).success).toBe(false);
    expect(jobInputSchema.safeParse({ technicalCriteria: { educationMinLevel: "Curso livre" } }).success).toBe(false);
    expect(jobInputSchema.safeParse({ technicalCriteria: { languages: [{ language: "Inglês", level: "Mestre" }] } }).success).toBe(false);
    expect(jobInputSchema.safeParse({ technicalCriteria: { unknown: [] } }).success).toBe(false);
    expect(normalizeCriteria({ skills: "not a list" })).toEqual({ skills: [], experience: [], educationMinLevel: "", languages: [] });
    expect(normalizeCriteria(undefined).skills).toEqual([]);
  });
  it("does not require technical criteria to publish", () => {
    expect(validateForPublication(complete(), "2026-10-27")).toEqual({});
  });
});
