CREATE TYPE "CandidateDocumentCategory" AS ENUM ('COURSE', 'CERTIFICATION');

CREATE TABLE "CandidateProfileDocument" (
  "id" TEXT NOT NULL,
  "candidateProfileId" TEXT NOT NULL,
  "category" "CandidateDocumentCategory" NOT NULL,
  "displayName" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "storedName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CandidateProfileDocument_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "CandidateProfileDocument_candidateProfileId_fkey"
    FOREIGN KEY ("candidateProfileId") REFERENCES "CandidateProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "CandidateProfileDocument_storedName_key" ON "CandidateProfileDocument"("storedName");
CREATE INDEX "CandidateProfileDocument_candidateProfileId_category_createdAt_idx"
  ON "CandidateProfileDocument"("candidateProfileId", "category", "createdAt");
