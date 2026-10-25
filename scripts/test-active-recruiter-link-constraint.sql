-- Smoke tests for the PostgreSQL partial unique index that limits a recruiter to one active company link.
INSERT INTO "User" ("id", "email", "fullName", "passwordHash", "role", "updatedAt")
VALUES
  ('ci-company-user', 'ci-company@example.test', 'CI Company', 'not-a-real-hash', 'COMPANY', CURRENT_TIMESTAMP),
  ('ci-company-user-2', 'ci-company-2@example.test', 'CI Company 2', 'not-a-real-hash', 'COMPANY', CURRENT_TIMESTAMP),
  ('ci-recruiter-user', 'ci-recruiter@example.test', 'CI Recruiter', 'not-a-real-hash', 'RECRUITER', CURRENT_TIMESTAMP);

INSERT INTO "Company" ("id", "legalName", "officialId", "contactEmail", "accountUserId", "updatedAt")
VALUES
  ('ci-company', 'CI Company Ltd', 'CI-OFFICIAL-ID', 'contact@example.test', 'ci-company-user', CURRENT_TIMESTAMP),
  ('ci-company-2', 'CI Company 2 Ltd', 'CI-OFFICIAL-ID-2', 'contact-2@example.test', 'ci-company-user-2', CURRENT_TIMESTAMP);

INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId")
VALUES ('ci-active-link-1', 'ci-company', 'ci-recruiter-user');

DO $$
BEGIN
  BEGIN
    INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId")
    VALUES ('ci-active-link-2', 'ci-company', 'ci-recruiter-user');
    RAISE EXCEPTION 'Expected the index to reject a duplicate active link for the same company';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Partial unique index rejected a second active link for the same company';
  END;

  BEGIN
    INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId")
    VALUES ('ci-active-link-cross-company', 'ci-company-2', 'ci-recruiter-user');
    RAISE EXCEPTION 'Expected the index to reject active links to two different companies';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Partial unique index rejected simultaneous active links across companies';
  END;
END $$;

-- End the first link and verify that the historical row can remain while a new
-- active link is created for a different company.
UPDATE "RecruiterLink"
SET "active" = false, "endedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'ci-active-link-1';

INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId")
VALUES ('ci-active-link-3', 'ci-company-2', 'ci-recruiter-user');

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM "RecruiterLink"
    WHERE "id" = 'ci-active-link-1' AND "active" = false AND "endedAt" IS NOT NULL
  ) THEN
    RAISE EXCEPTION 'Expected the ended recruiter link to remain as history';
  END IF;

  IF (
    SELECT COUNT(*) FROM "RecruiterLink"
    WHERE "recruiterId" = 'ci-recruiter-user' AND "active" = true
  ) <> 1 THEN
    RAISE EXCEPTION 'Expected exactly one active recruiter link after the previous link ended';
  END IF;

  RAISE NOTICE 'Inactive link history is retained and a new active company link is allowed';
END $$;
