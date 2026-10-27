CREATE TYPE "AccessibilityDeclarationStatus" AS ENUM ('NOT_INFORMED', 'NO_NEEDS_DECLARED', 'NEEDS_DECLARED');

CREATE TABLE "CandidateProfile" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "education" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "skills" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "languages" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "professionalExperience" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "courses" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "certifications" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "professionalLinks" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "accessibilityDeclaration" "AccessibilityDeclarationStatus" NOT NULL DEFAULT 'NOT_INFORMED',
  "accessibilityNeeds" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "essentialAccessibilityResources" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CandidateProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CandidateProfile_userId_key" ON "CandidateProfile"("userId");
CREATE INDEX "CandidateProfile_updatedAt_idx" ON "CandidateProfile"("updatedAt");
ALTER TABLE "CandidateProfile" ADD CONSTRAINT "CandidateProfile_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
