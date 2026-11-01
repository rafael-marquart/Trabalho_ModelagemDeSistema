import { describe, expect, it } from "vitest";
import { availabilityOf, decideAction, locationText, salaryText } from "./detail";

const open = availabilityOf("OPEN", "2026-12-31", "2026-10-29");

describe("job detail presentation (SPEC-010)", () => {
  it("maps status and deadline to the SPEC-009 labels", () => {
    expect(open).toMatchObject({ code: "OPEN", label: "Aberta" });
    expect(availabilityOf("PAUSED", "2026-12-31", "2026-10-29")).toMatchObject({ code: "UNAVAILABLE", label: "Indisponível" });
    expect(availabilityOf("CLOSED", "2026-12-31", "2026-10-29")).toMatchObject({ code: "CLOSED", label: "Encerrada" });
    expect(availabilityOf("OPEN", "2026-10-01", "2026-10-29")).toMatchObject({ code: "UNAVAILABLE", message: "O prazo de inscrição terminou em 01/10/2026." });
  });
  it("blocks the next step when the job is not open or the candidate is not eligible", () => {
    expect(decideAction(availabilityOf("CLOSED", "", "2026-10-29"), { status: "COMPLETE" }).allowed).toBe(false);
    expect(decideAction(open, { status: "INCOMPATIBLE" })).toMatchObject({ allowed: false, message: expect.stringContaining("não é elegível") });
    expect(decideAction(open, { status: "INSUFFICIENT_DATA", critical: { pending: [{ needName: "Rampa" }] } })).toMatchObject({ allowed: false, message: expect.stringContaining("não foi concluída") });
    expect(decideAction(open, null).allowed).toBe(false);
  });
  it("requires a complete score to apply and says whose data is missing (OPEN-049)", () => {
    expect(decideAction(open, { status: "INSUFFICIENT_DATA", critical: { pending: [] }, missing: [{ responsible: "CANDIDATE" }] })).toMatchObject({ allowed: false, message: expect.stringContaining("seu perfil") });
    expect(decideAction(open, { status: "INSUFFICIENT_DATA", critical: { pending: [] }, missing: [{ responsible: "COMPANY" }] })).toMatchObject({ allowed: false, message: expect.stringContaining("empresa") });
    expect(decideAction(open, { status: "COMPLETE", score: 80 }).allowed).toBe(true);
  });
  it("shows an existing application instead of the apply action", () => {
    expect(decideAction(open, { status: "COMPLETE", score: 80 }, { appliedAt: "2026-10-31T15:00:00Z", stageLabel: "Inscrito" })).toMatchObject({ allowed: false, applied: true, message: expect.stringContaining("31/10/2026 às 12:00") });
  });
  it("never turns missing salary or location into a value (OPEN-045)", () => {
    expect(salaryText(null, null)).toBe("Não informada");
    expect(salaryText(3000, 4500)).toMatch(/^R\$\s?3\.000,00 a R\$\s?4\.500,00$/);
    expect(salaryText(3000, null)).toMatch(/^A partir de/);
    expect(salaryText(null, 4500)).toMatch(/^Até/);
    expect(locationText("", "", "")).toBe("Não informada");
    expect(locationText("São Paulo", "SP", "Av. Paulista, 1000")).toBe("Av. Paulista, 1000, São Paulo/SP");
  });
});
