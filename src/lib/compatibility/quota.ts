// Safety cap on HERE usage (SPEC-007 / OPEN-088): requests stop at a share of the free monthly allowance and resume
// automatically when the calendar month (UTC, as billed by HERE) changes. Only requests sent by this installation are counted.
export type HereService = "geocode" | "routing" | "transit";

/** Free monthly transactions of the HERE plan in use, as shown on the account's pricing page (overridable by env). */
export const FREE_MONTHLY_LIMITS: Record<HereService, number> = { geocode: 30000, routing: 5000, transit: 5000 };
export const DEFAULT_QUOTA_PERCENT = 60;

export type QuotaGuard = { tryConsume(service: HereService): Promise<boolean> };

const envNumber = (value: string | undefined) => {
  const parsed = Number(value);
  return value !== undefined && value.trim() !== "" && Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export function quotaCap(service: HereService, env: Record<string, string | undefined> = process.env): number {
  const limit = envNumber(env[`HERE_LIMIT_${service.toUpperCase()}`]) ?? FREE_MONTHLY_LIMITS[service];
  const percent = Math.min(envNumber(env.HERE_QUOTA_PERCENT) ?? DEFAULT_QUOTA_PERCENT, 100);
  return Math.floor((limit * percent) / 100);
}

export function usageMonth(now: Date = new Date()): string {
  return now.toISOString().slice(0, 7);
}

type RawClient = { $queryRaw<T = unknown>(query: TemplateStringsArray, ...values: unknown[]): Promise<T> };

/** Atomically counts one request if the month's cap was not reached; returns false (and counts nothing) once it was. */
export function createDbQuotaGuard(db: RawClient, options: { now?: () => Date; env?: Record<string, string | undefined> } = {}): QuotaGuard {
  return {
    async tryConsume(service) {
      const cap = quotaCap(service, options.env);
      if (cap <= 0) return false;
      const month = usageMonth(options.now?.() ?? new Date());
      const rows = await db.$queryRaw<{ count: number }[]>`
        INSERT INTO "HereUsage" ("month", "service", "count", "updatedAt") VALUES (${month}, ${service}, 1, now())
        ON CONFLICT ("month", "service") DO UPDATE SET "count" = "HereUsage"."count" + 1, "updatedAt" = now()
        WHERE "HereUsage"."count" < ${cap}
        RETURNING "count"`;
      return rows.length > 0;
    }
  };
}
