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
  return value.replace(/\\D/g, "");
}