import { describe, expect, it } from "vitest";
import { loginSchema, normalizeCpf, normalizeIdentifier } from "./login-schema";

describe("loginSchema", () => {
  it("accepts candidate login with email and remember-me preference", () => {
    expect(loginSchema.safeParse({
      profile: "candidate",
      identifier: "candidato@example.com",
      password: "valid-password",
      rememberMe: true
    }).success).toBe(true);
  });

  it("accepts company login", () => {
    expect(loginSchema.safeParse({
      profile: "company",
      identifier: "rh@example.com",
      password: "valid-password"
    }).success).toBe(true);
  });

  it("rejects unknown profiles and empty credentials", () => {
    expect(loginSchema.safeParse({ profile: "admin", identifier: "x", password: "y" }).success).toBe(false);
    expect(loginSchema.safeParse({ profile: "candidate", identifier: " ", password: "" }).success).toBe(false);
  });
});

describe("identifier normalization", () => {
  it("normalizes email-like identifiers without case differences", () => {
    expect(normalizeIdentifier("  Pessoa@Exemplo.COM ")).toBe("pessoa@exemplo.com");
  });

  it("keeps only digits in CPF", () => {
    expect(normalizeCpf("123.456.789-00")).toBe("12345678900");
  });
});