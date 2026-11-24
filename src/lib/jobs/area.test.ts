import { describe, expect, it } from "vitest";
import { inferProfessionalArea, jobProfessionalArea } from "./area";

describe("professional area of external jobs", () => {
  it("classifies real Adzuna titles by keywords, ignoring 'PCD' and similar markers", () => {
    const cases: [string, string][] = [
      ["Estoquista - PCD - PCD", "Logística e operações"],
      ["Comprador/Almoxarife (Pessoas com Deficiência)", "Logística e operações"],
      ["Auxiliar Administrativo – PCD", "Administração"],
      ["Assistente Financeiro (Pessoas com Deficiência)", "Finanças e contabilidade"],
      ["Consultor de Vendas Pessoas com Deficiência", "Comercial e vendas"],
      ["Assistente de Negócios Pessoas com Deficiência", "Comercial e vendas"],
      ["Operador de Telemarketing PCD", "Atendimento ao cliente"],
      ["Garçom (Pessoas com Deficiência)", "Atendimento ao cliente"],
      ["Engenheiro(a) de Software Júnior", "Tecnologia da informação"],
      ["engenharia da computação", "Tecnologia da informação"],
      ["Analista de Dados Júnior", "Tecnologia da informação"],
      ["Analista de suporte", "Tecnologia da informação"],
      ["Engenheiro Civil", "Engenharia"],
      ["Técnico de Enfermagem", "Saúde"],
      ["Analista de RH", "Recursos humanos"],
      ["Monitor (PCD) - 684", "Educação"],
      ["PCD - RS", "Outra"]
    ];
    for (const [title, area] of cases) expect(inferProfessionalArea(title), title).toBe(area);
  });
  it("matches short acronyms only as whole words", () => {
    expect(inferProfessionalArea("Analista de TI")).toBe("Tecnologia da informação");
    expect(inferProfessionalArea("Sacoleiro")).toBe("Outra");
    expect(inferProfessionalArea("Tintureiro")).toBe("Outra");
  });
  it("keeps the area chosen by the company and infers only for external jobs", () => {
    expect(jobProfessionalArea({ origin: "OWN", title: "Estoquista", professionalArea: "Saúde" })).toBe("Saúde");
    expect(jobProfessionalArea({ origin: "OWN", title: "Estoquista", professionalArea: "" })).toBe("");
    expect(jobProfessionalArea({ origin: "EXTERNAL", title: "Estoquista", professionalArea: "" })).toBe("Logística e operações");
    expect(jobProfessionalArea({ origin: "EXTERNAL", title: "Estoquista", professionalArea: null })).toBe("Logística e operações");
  });
});
