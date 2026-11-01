-- SPEC-011: applications (CANDIDATURA).
CREATE TYPE "ApplicationStage" AS ENUM ('INSCRITO', 'TRIAGEM', 'ENTREVISTA', 'FINALISTA', 'CONTRATADO', 'RECUSADA', 'CANCELADA');

CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "candidateUserId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "stage" "ApplicationStage" NOT NULL DEFAULT 'INSCRITO',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "score" INTEGER NOT NULL,
    "compatibilityResultId" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Application_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Application_score_range" CHECK ("score" BETWEEN 0 AND 100)
);
CREATE INDEX "Application_jobId_stage_idx" ON "Application"("jobId", "stage");
CREATE INDEX "Application_candidateUserId_appliedAt_idx" ON "Application"("candidateUserId", "appliedAt");
-- RB-14: at most one active application per candidate and job; refused or cancelled ones do not count.
CREATE UNIQUE INDEX "Application_one_active_per_job" ON "Application"("candidateUserId", "jobId") WHERE "stage" NOT IN ('RECUSADA', 'CANCELADA');

ALTER TABLE "Application" ADD CONSTRAINT "Application_candidateUserId_fkey" FOREIGN KEY ("candidateUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Application" ADD CONSTRAINT "Application_compatibilityResultId_fkey" FOREIGN KEY ("compatibilityResultId") REFERENCES "CompatibilityResult"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
