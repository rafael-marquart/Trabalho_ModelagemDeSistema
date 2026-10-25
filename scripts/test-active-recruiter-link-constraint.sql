-- Smoke test for the PostgreSQL partial unique index that limits a recruiter to one active company link.
INSERT INTO "User" ("id", "email", "fullName", "passwordHash", "role", "updatedAt")
VALUES
  ('ci-company-user', 'ci-company@example.test', 'CI Company', 'not-a-real-hash', 'COMPANY', CURRENT_TIMESTAMP),
  ('ci-recruiter-user', 'ci-recruiter@example.test', 'CI Recruiter', 'not-a-real-hash', 'RECRUITER', CURRENT_TIMESTAMP);

INSERT INTO "Company" ("id", "legalName", "officialId", "contactEmail", "accountUserId", "updatedAt")
VALUES ('ci-company', 'CI Company Ltd', 'CI-OFFICIAL-ID', 'contact@example.test', 'ci-company-user', CURRENT_TIMESTAMP);

INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId")
VALUES ('ci-active-link-1', 'ci-company', 'ci-recruiter-user');

DO $$
BEGIN
  BEGIN
    INSERT INTO "RecruiterLink" ("id", "companyId", "recruiterId")
    VALUES ('ci-active-link-2', 'ci-company', 'ci-recruiter-user');
    RAISE EXCEPTION 'Expected the partial unique index to reject a second active recruiter link';
  EXCEPTION
    WHEN unique_violation THEN
      RAISE NOTICE 'Partial unique index correctly rejected a second active recruiter link';
  END;
END $$;
