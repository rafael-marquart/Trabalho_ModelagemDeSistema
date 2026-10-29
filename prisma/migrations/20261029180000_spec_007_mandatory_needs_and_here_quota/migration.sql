-- SPEC-007: the candidate marks which declared catalog needs are indispensable (eliminatory) for them.
ALTER TABLE "CandidateProfile" ADD COLUMN "mandatoryNeedOptionCodes" JSONB NOT NULL DEFAULT '[]';

-- SPEC-007 / OPEN-088: monthly count of requests sent to HERE by this installation, used to stop at a safety share of the free plan.
CREATE TABLE "HereUsage" (
    "month" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "HereUsage_pkey" PRIMARY KEY ("month", "service")
);
