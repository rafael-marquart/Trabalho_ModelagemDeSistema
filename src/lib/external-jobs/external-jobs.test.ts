// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { adzunaRecordSchema, adzunaSearchUrl, callAdzuna } from "./adzuna";
import { externalImportConfig } from "./config";
import { extractWithRetries, validateExtraction, type ExtractionPort } from "./llm";
import { attributeKey, fromAdzuna, minimumProblems, toState, urlKey } from "./record";
import { appearsIn, plainText } from "./text";

// SPEC-006 — mapping of the authorized source (T-006-41 to T-006-46), minimum data (T-006-04 to 08), LLM (T-006-09 to 20).
const config = externalImportConfig({ ADZUNA_APP_ID: "app-id-test", ADZUNA_APP_KEY: "secret-key-test" });
const description = "Empresa de tecnologia contrata pessoa desenvolvedora com deficiência para atuar em projetos web acessíveis, com plano de saúde e vale-refeição.";
const record = (overrides: Record<string, unknown> = {}) => adzunaRecordSchema.parse({
  id: 4123456789, title: "<strong>Desenvolvedor</strong> Front-end PCD", description,
  redirect_url: "https://www.adzuna.com.br/land/ad/4123456789?se=abc&utm_medium=api", created: "2026-11-10T12:00:00Z",
  company: { display_name: "Tech Acessível Ltda" }, location: { display_name: "Campinas, São Paulo", area: ["Brasil", "São Paulo", "Campinas"] },
  salary_min: 4500, salary_max: 6000, salary_is_predicted: "0", ...overrides
});

describe("Adzuna mapping (RNF-16)", () => {
  it("maps the fields used, removes HTML and converts the state to its UF without inventing anything", () => {
    const candidate = fromAdzuna(record());
    expect(candidate).toMatchObject({
      externalId: "4123456789", title: "Desenvolvedor Front-end PCD", companyName: "Tech Acessível Ltda", city: "Campinas", state: "SP",
      salaryMin: 4500, salaryMax: 6000, origins: { companyName: "SOURCE", city: "SOURCE", state: "SOURCE" }
    });
    expect(candidate.publishedAt?.toISOString()).toBe("2026-11-10T12:00:00.000Z");
    expect(minimumProblems(candidate)).toEqual([]);
  });

  it("uses \"City, State\" when the area list is missing, and ignores salaries the source only estimated", () => {
    const candidate = fromAdzuna(record({ location: { display_name: "Porto Alegre, Rio Grande do Sul" }, salary_is_predicted: "1" }));
    expect([candidate.city, candidate.state, candidate.salaryMin, candidate.salaryMax]).toEqual(["Porto Alegre", "RS", null, null]);
    expect(toState("Distrito Federal")).toBe("DF");
    expect(toState("Atlântida")).toBe("");
  });

  it("refuses records whose minimum data are absent, empty, generic or inconsistent", () => {
    const problems = (overrides: Record<string, unknown>) => minimumProblems(fromAdzuna(record(overrides)));
    expect(problems({ title: "  Vaga  " })).toEqual(["TITLE"]);
    expect(problems({ description: "Venha trabalhar conosco!" })).toEqual(["DESCRIPTION"]);
    expect(problems({ company: { display_name: "Adzuna" } })).toEqual(["COMPANY"]);
    expect(problems({ company: { display_name: "Empresa confidencial" } })).toEqual(["COMPANY"]);
    expect(problems({ company: {} })).toEqual(["COMPANY"]);
    expect(problems({ location: { display_name: "Brasil", area: ["Brasil"] } })).toEqual(["LOCATION"]);
    expect(problems({ redirect_url: "javascript:alert(1)" })).toEqual(["ORIGIN"]);
    expect(adzunaRecordSchema.safeParse({ title: "sem id" }).success).toBe(false);
  });

  it("builds the deduplication keys: the link without tracking and the normalized company, title and place", () => {
    expect(urlKey("https://www.adzuna.com.br/land/ad/4123456789/?se=abc&utm_medium=api#top")).toBe("adzuna.com.br/land/ad/4123456789");
    expect(urlKey("não é link")).toBe("");
    expect(attributeKey({ companyName: "Tech Acessível LTDA", title: "Desenvolvedor  Front-end PCD", city: "Campinas", state: "SP" }))
      .toBe(attributeKey({ companyName: "tech acessivel ltda", title: "desenvolvedor front end pcd", city: "CAMPINAS", state: "SP" }));
    expect(attributeKey({ companyName: "", title: "x", city: "y", state: "SP" })).toBe("");
  });

  it("text helpers decode entities and compare whole words without accents", () => {
    expect(plainText("Caf&eacute; &amp; <b>Ch&#225;</b>&nbsp; ")).toBe("Caf&eacute; & Chá");
    expect(appearsIn("São Paulo", "Vaga em sao paulo, capital")).toBe(true);
    expect(appearsIn("Paulo", "Vaga em Paulínia")).toBe(false);
  });
});

describe("Adzuna call", () => {
  it("sends one what_phrase per call and keeps the credentials out of every message", async () => {
    expect(adzunaSearchUrl(config, "vaga pcd", 1)).toBe("https://api.adzuna.com/v1/api/jobs/br/search/1?app_id=app-id-test&app_key=secret-key-test&results_per_page=20&what_phrase=vaga+pcd&content-type=application%2Fjson");
    const respond = (status: number, body: string) => vi.fn(async () => new Response(body, { status, headers: { "content-type": "application/json" } }));
    expect(await callAdzuna(config, "pcd", 1, respond(200, JSON.stringify({ results: [{ id: 1 }], count: 1 })))).toEqual({ status: "OK", httpStatus: 200, results: [{ id: 1 }] });
    const outcomes = [
      await callAdzuna(config, "pcd", 1, respond(200, "{não é json")),
      await callAdzuna(config, "pcd", 1, respond(200, JSON.stringify({ count: 3 }))),
      await callAdzuna(config, "pcd", 1, respond(429, "{}")),
      await callAdzuna(config, "pcd", 1, respond(503, "{}")),
      await callAdzuna(config, "pcd", 1, respond(401, "{}")),
      await callAdzuna(config, "pcd", 1, vi.fn(async () => { throw new TypeError("fetch failed"); }))
    ];
    expect(outcomes.map((outcome) => outcome.status === "ERROR" && outcome.recoverable)).toEqual([false, false, true, true, false, true]);
    expect(JSON.stringify(outcomes)).not.toContain("secret-key-test");
  });

  it("reads limits and switches from the environment, with the approved defaults", () => {
    const defaults = externalImportConfig({});
    expect([defaults.configured, defaults.callBudget, defaults.maxCallsPerRun, defaults.scheduleEnabled, defaults.llm.provider]).toEqual([false, 25, 5, false, "off"]);
    const custom = externalImportConfig({ ADZUNA_APP_ID: "a", ADZUNA_APP_KEY: "b", ADZUNA_PHRASES: "analista pcd; ; suporte pcd", ADZUNA_CALL_BUDGET: "100", EXTERNAL_IMPORT_SCHEDULE: "on" });
    expect([custom.phrases, custom.callBudget, custom.scheduleEnabled]).toEqual([["analista pcd", "suporte pcd"], 100, true]);
  });
});

describe("LLM behind the port (ADR-003, RB-11, RB-18)", () => {
  const input = { title: "Analista administrativo PCD", description: "A Rede Saúde Mais contrata analista para a unidade de Recife, Pernambuco. Vaga exclusiva para pessoas com deficiência." };

  it("keeps only values written in the ad; an invented company or city is discarded", () => {
    expect(validateExtraction({ companyName: "Rede Saúde Mais", city: "Recife", state: "Pernambuco" }, input)).toEqual({ companyName: "Rede Saúde Mais", city: "Recife", state: "PE" });
    expect(validateExtraction({ companyName: "Hospital Central", city: "Olinda", state: "PE" }, input)).toEqual({ companyName: null, city: null, state: null });
    expect(validateExtraction({ companyName: 42 }, input)).toBeNull();
    expect(validateExtraction({ companyName: "Rede Saúde Mais", extra: "campo" }, input)).toBeNull();
  });

  it("retries only recoverable failures or invalid answers, a limited number of times, validating each answer", async () => {
    const port = (results: Awaited<ReturnType<ExtractionPort["extract"]>>[]): ExtractionPort & { extract: ReturnType<typeof vi.fn> } => {
      const extract = vi.fn(async () => results.shift() ?? { status: "FAILED" as const, recoverable: true, reason: "LLM indisponível" });
      return { name: "fake", enabled: true, extract };
    };
    const recovers = port([{ status: "FAILED", recoverable: true, reason: "LLM indisponível" }, { status: "OK", data: { companyName: "Rede Saúde Mais", city: null, state: null } }]);
    expect((await extractWithRetries(recovers, input)).data?.companyName).toBe("Rede Saúde Mais");
    expect(recovers.extract).toHaveBeenCalledTimes(2);

    const invalid = port([{ status: "OK", data: "texto" }, { status: "OK", data: "texto" }, { status: "OK", data: "texto" }, { status: "OK", data: { companyName: "Rede Saúde Mais" } }]);
    expect(await extractWithRetries(invalid, input)).toEqual({ data: null, reason: "resposta do LLM inválida" });
    expect(invalid.extract).toHaveBeenCalledTimes(3);

    const permanent = port([{ status: "FAILED", recoverable: false, reason: "LLM recusou a solicitação" }]);
    expect(await extractWithRetries(permanent, input)).toEqual({ data: null, reason: "LLM recusou a solicitação" });
    expect(permanent.extract).toHaveBeenCalledTimes(1);

    expect((await extractWithRetries({ name: "off", enabled: false, extract: vi.fn() }, input)).data).toBeNull();
  });
});
