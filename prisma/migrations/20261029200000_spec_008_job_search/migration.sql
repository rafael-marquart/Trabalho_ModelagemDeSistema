-- SPEC-008: professional area used by the search filter (OPEN-036).
ALTER TABLE "Job" ADD COLUMN "professionalArea" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Job_status_origin_idx" ON "Job"("status", "origin");

-- SPEC-008 / D-01: fingerprint of the analysis inputs; rows stay immutable (the update trigger still applies).
ALTER TABLE "CompatibilityResult" ADD COLUMN "inputHash" TEXT;
