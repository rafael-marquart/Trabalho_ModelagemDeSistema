-- SPEC-006: external jobs (RB-10, RB-33) and the traceability of each ingestion run (OPEN-027).
ALTER TYPE "JobOrigin" ADD VALUE 'EXTERNAL';

CREATE TYPE "ExternalImportStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'PARTIAL', 'FAILED');
CREATE TYPE "ExternalRecordResult" AS ENUM ('PROCESSED', 'REJECTED', 'DUPLICATE', 'FAILED');

-- An external job has no company account nor creator; an own job keeps both (checked below).
ALTER TABLE "Job" ALTER COLUMN "companyId" DROP NOT NULL;
ALTER TABLE "Job" ALTER COLUMN "createdByUserId" DROP NOT NULL;

ALTER TABLE "Job"
  ADD COLUMN "externalSource" TEXT,
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "externalUrl" TEXT,
  ADD COLUMN "externalUrlKey" TEXT,
  ADD COLUMN "externalCompanyName" TEXT,
  ADD COLUMN "externalDedupKey" TEXT,
  ADD COLUMN "externalFieldOrigins" JSONB,
  ADD COLUMN "externalFetchedAt" TIMESTAMP(3);

-- Only the old enum value appears here: a value added by ALTER TYPE cannot be used in the same transaction.
ALTER TABLE "Job" ADD CONSTRAINT "Job_own_has_company"
  CHECK ("origin" <> 'OWN' OR ("companyId" IS NOT NULL AND "createdByUserId" IS NOT NULL));
ALTER TABLE "Job" ADD CONSTRAINT "Job_external_is_traceable"
  CHECK ("origin" = 'OWN' OR ("externalSource" IS NOT NULL AND "externalId" IS NOT NULL AND "externalUrl" IS NOT NULL AND "externalCompanyName" IS NOT NULL));

-- First layer of the deduplication (OPEN-028): one job per external identifier in the same source.
CREATE UNIQUE INDEX "Job_externalSource_externalId_key" ON "Job"("externalSource", "externalId");
CREATE INDEX "Job_externalUrlKey_idx" ON "Job"("externalUrlKey");
CREATE INDEX "Job_externalDedupKey_idx" ON "Job"("externalDedupKey");

CREATE TABLE "ExternalImportRun" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "startedByUserId" TEXT,
    "status" "ExternalImportStatus" NOT NULL DEFAULT 'RUNNING',
    "callLimit" INTEGER NOT NULL,
    "callsMade" INTEGER NOT NULL DEFAULT 0,
    "queries" JSONB NOT NULL DEFAULT '[]',
    "received" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "rejected" INTEGER NOT NULL DEFAULT 0,
    "duplicates" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "ExternalImportRun_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ExternalImportRun_source_startedAt_idx" ON "ExternalImportRun"("source", "startedAt");
-- At most one run of a source at a time, so two runs cannot spend the call budget twice.
CREATE UNIQUE INDEX "ExternalImportRun_one_running" ON "ExternalImportRun"("source") WHERE "status" = 'RUNNING';

CREATE TABLE "ExternalImportRecord" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "phrase" TEXT NOT NULL,
    "externalId" TEXT,
    "title" TEXT NOT NULL DEFAULT '',
    "result" "ExternalRecordResult" NOT NULL,
    "reason" TEXT,
    "usedLlm" BOOLEAN NOT NULL DEFAULT false,
    "jobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalImportRecord_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ExternalImportRecord_runId_idx" ON "ExternalImportRecord"("runId");

ALTER TABLE "ExternalImportRecord" ADD CONSTRAINT "ExternalImportRecord_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ExternalImportRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ExternalImportRecord" ADD CONSTRAINT "ExternalImportRecord_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
