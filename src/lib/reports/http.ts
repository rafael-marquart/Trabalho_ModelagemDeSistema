import { NextResponse } from "next/server";
import type { z } from "zod";
import { getCurrentUser } from "@/lib/auth/session";

export const issuesOf = (error: z.ZodError) => Object.fromEntries(error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]));
export const invalid = (error: z.ZodError) => NextResponse.json({ message: "Confira os campos indicados.", issues: issuesOf(error) }, { status: 400 });
export const unauthorized = (message = "Acesso não autorizado.") => NextResponse.json({ message }, { status: 401 });

/** SPEC-020: moderation is only for the platform administrator (never a recruiter or company account). */
export async function requireAdmin() {
  const user = await getCurrentUser();
  return user && user.role === "ADMIN" && user.isActive ? user : null;
}
export async function requireCandidate() {
  const user = await getCurrentUser();
  return user && user.role === "CANDIDATE" && user.isActive ? user : null;
}
