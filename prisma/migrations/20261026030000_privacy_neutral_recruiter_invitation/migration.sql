-- Allow eligibility-neutral invitation requests without linking them to an account.
ALTER TABLE "RecruiterInvitation" ALTER COLUMN "recipientUserId" DROP NOT NULL;
