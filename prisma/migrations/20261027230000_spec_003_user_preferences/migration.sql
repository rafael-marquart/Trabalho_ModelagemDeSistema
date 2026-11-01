CREATE TABLE "UserPreference" (
  "userId" TEXT NOT NULL,
  "preferences" JSONB NOT NULL DEFAULT '{}',
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserPreference"
  ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
