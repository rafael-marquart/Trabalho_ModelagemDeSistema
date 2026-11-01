// Types for the retention routine shared by the npm script and the scheduled route (/api/cron/retencao).
import type { PrismaClient } from "@prisma/client";
export function purgeExpiredLoginSecurityRecords(prisma: PrismaClient, options?: { now?: Date; execute?: boolean }): Promise<{ attemptCutoff: Date; eligibleAttempts: number; eligibleBlocks: number; deletedAttempts: number; deletedBlocks: number; executed: boolean }>;
