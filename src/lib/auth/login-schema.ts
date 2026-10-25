import { z } from "zod";

export const loginSchema = z.object({
  profile: z.enum(["candidate", "company"]),
  identifier: z.string().trim().min(1).max(160),
  password: z.string().min(1).max(1024),
  rememberMe: z.boolean().default(false)
});

export type LoginInput = z.infer<typeof loginSchema>;

export function normalizeIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string): boolean {
  const cpf = normalizeCpf(value);
  if (cpf.length !== 11 || /^([0-9])\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);
  const calculateDigit = (length: number, weightStart: number) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) {
      sum += digits[index] * (weightStart - index);
    }
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9, 10) === digits[9] && calculateDigit(10, 11) === digits[10];
}
