import { describe, expect, it } from "vitest";
import { containsTerm, matchesCriterion, significantWords } from "./text";

describe("criterion matching", () => {
  it("ignores filler words around the skill", () => {
    expect(significantWords("ter cursado engenharia de softwer")).toEqual(["engenharia", "softwer"]);
    expect(matchesCriterion("engenharia de softwer", "ter cursado engenharia de softwer")).toBe(true);
    expect(matchesCriterion("Engenharia de Software", "Conhecimento em engenharia de software")).toBe(true);
  });
  it("still requires every significant word as a whole word", () => {
    expect(matchesCriterion("Engenharia civil", "ter cursado engenharia de software")).toBe(false);
    expect(matchesCriterion("JavaScript", "Java")).toBe(false);
    expect(containsTerm("Java e SQL", "java")).toBe(true);
  });
  it("does not match a criterion made only of filler", () => {
    expect(matchesCriterion("qualquer coisa", "ter conhecimento")).toBe(false);
  });
});
