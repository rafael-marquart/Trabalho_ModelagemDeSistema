import { describe, expect, it } from "vitest";
import { isValidCpf, loginSchema, normalizeCpf, normalizeIdentifier } from "./login-schema";

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

  it("accepts recruiter login", () => {
    expect(loginSchema.safeParse({ profile: "recruiter", identifier: "recrutador@example.com", password: "valid-password" }).success).toBe(true);
  });

  it("rejects unknown profiles and empty credentials", () => {
    expect(loginSchema.safeParse({ profile: "superuser", identifier: "x", password: "y" }).success).toBe(false);
    expect(loginSchema.safeParse({ profile: "candidate", identifier: " ", password: "" }).success).toBe(false);
  });

  it("accepts the admin profile, which is only reachable from the unlisted /admin/login page", () => {
    expect(loginSchema.safeParse({ profile: "admin", identifier: "admin@example.com", password: "y" }).success).toBe(true);
  });
});

describe("identifier normalization", () => {
  it("normalizes email-like identifiers without case differences", () => {
    expect(normalizeIdentifier("  Pessoa@Exemplo.COM ")).toBe("pessoa@exemplo.com");
  });

  it("keeps only digits in CPF", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725");
  });
});

describe("CPF validation", () => {
  it("accepts a CPF with valid check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true);
  });

  it("rejects invalid check digits, repeated digits, and wrong lengths", () => {
    expect(isValidCpf("123.456.789-00")).toBe(false);
    expect(isValidCpf("111.111.111-11")).toBe(false);
    expect(isValidCpf("5299822472")).toBe(false);
  });
});
