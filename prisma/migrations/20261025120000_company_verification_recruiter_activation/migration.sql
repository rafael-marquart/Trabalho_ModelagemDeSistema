ALTER TABLE "User" ADD COLUMN "pendingActivation" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Company" ADD COLUMN "officialIdValidatedAt" TIMESTAMP(3);
ALTER TABLE "Company" ADD COLUMN "officialIdValidatedBy" TEXT;
