import { timingSafeEqual } from "node:crypto";

/**
 * Scheduled routes (/api/cron/...) run only for a caller that knows CRON_SECRET, sent as "Authorization: Bearer <secret>".
 * Vercel Cron sends exactly this header when the project has CRON_SECRET; the GitHub Actions scheduler sends it too.
 * Without a configured secret (at least 16 characters) every call is refused.
 */
export function isAuthorizedCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret || secret.length < 16) return false;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
