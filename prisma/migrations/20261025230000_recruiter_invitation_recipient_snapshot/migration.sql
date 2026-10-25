ALTER TABLE "RecruiterInvitation"
  ADD COLUMN "recipientName" TEXT,
  ADD COLUMN "recipientEmail" TEXT;

-- Backfill historical invitations once. New invitations will persist only the
-- name and email supplied by the inviting company, rather than reading live
-- personal data from the recipient account when the invitation is listed.
UPDATE "RecruiterInvitation" AS invitation
SET
  "recipientName" = recipient."fullName",
  "recipientEmail" = recipient."email"
FROM "User" AS recipient
WHERE invitation."recipientUserId" = recipient."id";

ALTER TABLE "RecruiterInvitation"
  ALTER COLUMN "recipientName" SET NOT NULL,
  ALTER COLUMN "recipientEmail" SET NOT NULL;
