-- Profile photo of candidates and recruiters (OPEN-101), stored in the database (no persistent disk on the hosting).
CREATE TABLE "UserPhoto" (
    "userId" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "mimeType" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPhoto_pkey" PRIMARY KEY ("userId")
);

ALTER TABLE "UserPhoto" ADD CONSTRAINT "UserPhoto_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
