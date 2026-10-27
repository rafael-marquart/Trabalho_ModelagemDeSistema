CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'OPEN', 'PAUSED', 'CLOSED');
CREATE TYPE "JobModality" AS ENUM ('PRESENCIAL', 'HIBRIDO', 'REMOTO');
CREATE TYPE "JobOrigin" AS ENUM ('OWN');

CREATE TABLE "Job" (
  "id" TEXT NOT NULL,
  "companyId" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
  "origin" "JobOrigin" NOT NULL DEFAULT 'OWN',
  "title" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "requirements" TEXT NOT NULL DEFAULT '',
  "modality" "JobModality",
  "locationCity" TEXT NOT NULL DEFAULT '',
  "locationState" TEXT NOT NULL DEFAULT '',
  "locationAddress" TEXT NOT NULL DEFAULT '',
  "deadline" DATE,
  "salaryMin" DECIMAL(12,2),
  "salaryMax" DECIMAL(12,2),
  "accessibility" JSONB NOT NULL DEFAULT '{}',
  "publishedAt" TIMESTAMP(3),
  "closedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Job_companyId_status_idx" ON "Job"("companyId", "status");

ALTER TABLE "Job"
  ADD CONSTRAINT "Job_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT "Job_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
