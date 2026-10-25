import { describe, expect, it } from "vitest";
import { passwordConfirmationSchema, passwordSchema } from "./password-policy";

describe("passwordSchema", () => {
  it("accepts a password with minimum length, upper/lowercase and a number", () => {
    expect(passwordSchema.safeParse("AcessaVagas123").success).toBe(true);
  });

  it("does not require a symbol", () => {
    expect(passwordSchema.safeParse("SenhaForte123").success).toBe(true);
  });

  it("rejects passwords missing a required character class or minimum length", () => {
    expect(passwordSchema.safeParse("curta1A").success).toBe(false);
    expect(passwordSchema.safeParse("somenteletras").success).toBe(false);
    expect(passwordSchema.safeParse("SEMNUMEROABC").success).toBe(false);
    expect(passwordSchema.safeParse("semminuscula123").success).toBe(false);
  });

  it("rejects passwords longer than the documented implementation limit", () => {
    expect(passwordSchema.safeParse("A".repeat(127) + "1a").success).toBe(false);
  });
});

describe("passwordConfirmationSchema", () => {
  it("requires matching password confirmation", () => {
    expect(passwordConfirmationSchema.safeParse({
      password: "SenhaForte123",
      confirmPassword: "SenhaForte123"
    }).success).toBe(true);
    expect(passwordConfirmationSchema.safeParse({
      password: "SenhaForte123",
      confirmPassword: "SenhaDiferente123"
    }).success).toBe(false);
  });
});
