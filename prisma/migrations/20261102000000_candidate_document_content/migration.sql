-- Candidate documents are stored in the database (serverless hosting has no persistent disk). Existing documents keep
-- their files in the local upload folder and are still served from there.
CREATE TABLE "CandidateDocumentContent" (
    "documentId" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,

    CONSTRAINT "CandidateDocumentContent_pkey" PRIMARY KEY ("documentId")
);

ALTER TABLE "CandidateDocumentContent" ADD CONSTRAINT "CandidateDocumentContent_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "CandidateProfileDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
