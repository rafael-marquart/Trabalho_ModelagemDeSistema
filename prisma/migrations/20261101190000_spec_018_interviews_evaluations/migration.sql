-- SPEC-018 (decision of 01/11/2026): interviews in the funnel and post-interview evaluations.
ALTER TYPE "NotificationType" ADD VALUE 'INTERVIEW_SCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERVIEW_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'INTERVIEW_CANCELLED';

CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "InterviewModality" AS ENUM ('PRESENCIAL', 'ONLINE');

CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "modality" "InterviewModality" NOT NULL,
    "locationOrLink" TEXT NOT NULL,
    "accessibilityResources" TEXT NOT NULL DEFAULT '',
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Interview_applicationId_status_idx" ON "Interview"("applicationId", "status");
-- At most one scheduled interview per application at a time.
CREATE UNIQUE INDEX "Interview_one_scheduled_per_application" ON "Interview"("applicationId") WHERE "status" = 'SCHEDULED';
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "InterviewEvaluation" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT,
    "applicationId" TEXT,
    "candidateUserId" TEXT,
    "companyId" TEXT NOT NULL,
    "accessibilityRating" INTEGER NOT NULL,
    "inclusionRating" INTEGER NOT NULL,
    "comment" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anonymizedAt" TIMESTAMP(3),
    CONSTRAINT "InterviewEvaluation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InterviewEvaluation_ratings_range" CHECK ("accessibilityRating" BETWEEN 1 AND 5 AND "inclusionRating" BETWEEN 1 AND 5)
);
CREATE UNIQUE INDEX "InterviewEvaluation_interviewId_key" ON "InterviewEvaluation"("interviewId");
CREATE INDEX "InterviewEvaluation_companyId_idx" ON "InterviewEvaluation"("companyId");
CREATE INDEX "InterviewEvaluation_submittedAt_idx" ON "InterviewEvaluation"("submittedAt");
ALTER TABLE "InterviewEvaluation" ADD CONSTRAINT "InterviewEvaluation_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- A submitted evaluation is never edited (OPEN-071/072); only the one-year anonymization may clear the personal links.
CREATE FUNCTION interview_evaluation_no_edit() RETURNS trigger AS $$
BEGIN
  IF NEW."accessibilityRating" <> OLD."accessibilityRating" OR NEW."inclusionRating" <> OLD."inclusionRating"
     OR NEW."companyId" <> OLD."companyId" OR NEW."submittedAt" <> OLD."submittedAt"
     OR (NEW."comment" IS DISTINCT FROM OLD."comment" AND NEW."comment" IS NOT NULL)
     OR (NEW."candidateUserId" IS DISTINCT FROM OLD."candidateUserId" AND NEW."candidateUserId" IS NOT NULL)
     OR (NEW."applicationId" IS DISTINCT FROM OLD."applicationId" AND NEW."applicationId" IS NOT NULL)
     OR (NEW."interviewId" IS DISTINCT FROM OLD."interviewId" AND NEW."interviewId" IS NOT NULL) THEN
    RAISE EXCEPTION 'InterviewEvaluation cannot be edited';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "InterviewEvaluation_no_edit" BEFORE UPDATE ON "InterviewEvaluation" FOR EACH ROW EXECUTE FUNCTION interview_evaluation_no_edit();
