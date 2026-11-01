// Types for the retention routine shared by the npm script and the scheduled route (/api/cron/retencao).
import type { PrismaClient } from "@prisma/client";
export function purgeExpiredCompatibilityResults(prisma: PrismaClient, options?: { now?: Date; execute?: boolean }): Promise<{ cutoff: Date; eligibleCount: number; deletedCount: number; executed: boolean }>;
