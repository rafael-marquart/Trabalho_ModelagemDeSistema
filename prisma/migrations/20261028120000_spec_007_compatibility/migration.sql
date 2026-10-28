ALTER TABLE "Job" ADD COLUMN "technicalCriteria" JSONB NOT NULL DEFAULT '{}';

CREATE TABLE "CompatibilityResult" (
  "id" TEXT NOT NULL,
  "candidateUserId" TEXT NOT NULL,
  "jobId" TEXT NOT NULL,
  "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "rulesVersion" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "score" INTEGER,
  "snapshot" JSONB NOT NULL,
  "outcome" JSONB NOT NULL,
  CONSTRAINT "CompatibilityResult_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CompatibilityResult_candidateUserId_jobId_executedAt_idx" ON "CompatibilityResult"("candidateUserId", "jobId", "executedAt");
CREATE INDEX "CompatibilityResult_executedAt_idx" ON "CompatibilityResult"("executedAt");

ALTER TABLE "CompatibilityResult"
  ADD CONSTRAINT "CompatibilityResult_candidateUserId_fkey" FOREIGN KEY ("candidateUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "CompatibilityResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Results are immutable: updates are refused at the database level.
CREATE FUNCTION "compatibility_result_immutable"() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'CompatibilityResult rows are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "CompatibilityResult_no_update" BEFORE UPDATE ON "CompatibilityResult"
  FOR EACH ROW EXECUTE FUNCTION "compatibility_result_immutable"();
