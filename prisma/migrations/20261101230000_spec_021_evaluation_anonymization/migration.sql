-- SPEC-021: when an evaluation is anonymized after one year, its submission date is reduced to the year, so the rows
-- kept for the aggregate distribution cannot be matched to a person by timing. Only that anonymization may change it.
CREATE OR REPLACE FUNCTION interview_evaluation_no_edit() RETURNS trigger AS $$
DECLARE
  anonymizing boolean := OLD."anonymizedAt" IS NULL AND NEW."anonymizedAt" IS NOT NULL;
BEGIN
  IF NEW."accessibilityRating" <> OLD."accessibilityRating" OR NEW."inclusionRating" <> OLD."inclusionRating"
     OR NEW."companyId" <> OLD."companyId"
     OR (NEW."submittedAt" <> OLD."submittedAt" AND NOT (anonymizing AND NEW."submittedAt" = date_trunc('year', OLD."submittedAt")))
     OR (NEW."comment" IS DISTINCT FROM OLD."comment" AND NEW."comment" IS NOT NULL)
     OR (NEW."candidateUserId" IS DISTINCT FROM OLD."candidateUserId" AND NEW."candidateUserId" IS NOT NULL)
     OR (NEW."applicationId" IS DISTINCT FROM OLD."applicationId" AND NEW."applicationId" IS NOT NULL)
     OR (NEW."interviewId" IS DISTINCT FROM OLD."interviewId" AND NEW."interviewId" IS NOT NULL) THEN
    RAISE EXCEPTION 'InterviewEvaluation cannot be edited';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
