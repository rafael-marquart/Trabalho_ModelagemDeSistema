import { describe, expect, it } from "vitest";
import { isValidCnpj, normalizeCnpj } from "./cnpj";

describe("CNPJ length validation", () => {
  it("normalizes standard punctuation and accepts exactly 14 digits", () => {
    expect(normalizeCnpj("11.222.333/0001-81")).toBe("11222333000181");
    expect(isValidCnpj("11.222.333/0001-81")).toBe(true);
    expect(isValidCnpj("00000000000000")).toBe(true);
    expect(isValidCnpj("12345678901234")).toBe(true);
  });

  it("rejects values with fewer or more than 14 digits", () => {
    expect(isValidCnpj("1122233300018")).toBe(false);
    expect(isValidCnpj("112223330001811")).toBe(false);
    expect(isValidCnpj("12-34")).toBe(false);
  });

  it("rejects letters and unsupported characters rather than silently removing them", () => {
    expect(isValidCnpj("AB11222333000181")).toBe(false);
    expect(isValidCnpj("11222333000181!")).toBe(false);
  });
});
