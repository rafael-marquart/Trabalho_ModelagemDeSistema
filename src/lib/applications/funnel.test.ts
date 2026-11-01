import { describe, expect, it } from "vitest";
import { canMove, FUNNEL_ORDER, moveKind, type Stage } from "./funnel";

describe("selection funnel transitions (RB-39)", () => {
  it("allows exactly the standardized moves for recruiters", () => {
    const allowed = FUNNEL_ORDER.flatMap(from => FUNNEL_ORDER.filter(to => canMove(from, to)).map(to => `${from}>${to}`));
    expect(allowed.sort()).toEqual([
      "ENTREVISTA>FINALISTA", "ENTREVISTA>RECUSADA", "FINALISTA>CONTRATADO", "FINALISTA>RECUSADA", "INSCRITO>TRIAGEM", "TRIAGEM>ENTREVISTA", "TRIAGEM>RECUSADA"
    ].sort());
  });
  it("refuses skipping stages, going back and leaving final stages", () => {
    const refused: [Stage, Stage][] = [["INSCRITO", "ENTREVISTA"], ["INSCRITO", "RECUSADA"], ["TRIAGEM", "INSCRITO"], ["CONTRATADO", "RECUSADA"], ["RECUSADA", "TRIAGEM"], ["CANCELADA", "TRIAGEM"], ["TRIAGEM", "CANCELADA"]];
    for (const [from, to] of refused) expect(canMove(from, to)).toBe(false);
  });
  it("names the kind of decision", () => {
    expect([moveKind("TRIAGEM"), moveKind("RECUSADA"), moveKind("CONTRATADO")]).toEqual(["ADVANCED", "REJECTED", "HIRED"]);
  });
});
