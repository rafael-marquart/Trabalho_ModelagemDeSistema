import { describe, expect, it } from "vitest";
import { isValidCnpj, normalizeCnpj } from "./cnpj";

describe("CNPJ validation", () => {
  it("normalizes punctuation and accepts a CNPJ with valid check digits", () => {
    expect(normalizeCnpj("11.222.333/0001-81")).toBe("11222333000181");
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
  });

  it("rejects incorrect check digits, repeated digits, and wrong lengths", () => {
    expect(isValidCnpj("11.222.333/0001-80")).toBe(false);
    expect(isValidCnpj("00.000.000/0000-00")).toBe(false);
    expect(isValidCnpj("1122233300018")).toBe(false);
  });
});
