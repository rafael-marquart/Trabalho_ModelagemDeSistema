ALTER TABLE "RecruiterInvitation"
  ADD COLUMN "recipientName" TEXT,
  ADD COLUMN "recipientEmail" TEXT;

-- Historical invitations did not store the values entered by the company.
-- Backfill a neutral label instead of copying the recipient's profile name.
-- The email is the address used to create the invitation and is needed for resend.
UPDATE "RecruiterInvitation" AS invitation
SET
  "recipientName" = 'Recrutador convidado',
  "recipientEmail" = recipient."email"
FROM "User" AS recipient
WHERE invitation."recipientUserId" = recipient."id";

ALTER TABLE "RecruiterInvitation"
  ALTER COLUMN "recipientName" SET NOT NULL,
  ALTER COLUMN "recipientEmail" SET NOT NULL;
