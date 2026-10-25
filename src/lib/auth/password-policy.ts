import { z } from "zod";

export const passwordSchema = z.string()
  .min(10, "A senha deve ter pelo menos 10 caracteres.")
  .max(128, "A senha deve ter no máximo 128 caracteres.")
  .regex(/[a-z]/, "A senha deve conter uma letra minúscula.")
  .regex(/[A-Z]/, "A senha deve conter uma letra maiúscula.")
  .regex(/[0-9]/, "A senha deve conter um número.");

export const passwordConfirmationSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine(value => value.password === value.confirmPassword, {
  path: ["confirmPassword"],
  message: "As senhas não coincidem."
});