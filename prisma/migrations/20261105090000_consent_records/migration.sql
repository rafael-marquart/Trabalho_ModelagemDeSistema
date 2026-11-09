-- Terms of Use / Privacy Policy acceptance and the specific consent for accessibility data (LGPD art. 11, I).
CREATE TYPE "ConsentKind" AS ENUM ('TERMS_AND_PRIVACY', 'ACCESSIBILITY_DATA');

CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" "ConsentKind" NOT NULL,
    "version" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ConsentRecord_userId_kind_createdAt_idx" ON "ConsentRecord"("userId", "kind", "createdAt");

ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- The consent history is append-only: a new row records each acceptance or withdrawal; existing rows never change.
CREATE OR REPLACE FUNCTION consent_record_no_update() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ConsentRecord cannot be edited';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "ConsentRecord_no_update" BEFORE UPDATE ON "ConsentRecord" FOR EACH ROW EXECUTE FUNCTION consent_record_no_update();
