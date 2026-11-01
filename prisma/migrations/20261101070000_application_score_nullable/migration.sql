-- SPEC-011 (decision of 31/10/2026): an application may be registered without a score when data is missing.
-- The original SPEC-011 migration was edited after some databases had applied it with "score" NOT NULL;
-- this migration brings those databases in line. On databases where the column is already nullable it is a no-op.
ALTER TABLE "Application" ALTER COLUMN "score" DROP NOT NULL;
