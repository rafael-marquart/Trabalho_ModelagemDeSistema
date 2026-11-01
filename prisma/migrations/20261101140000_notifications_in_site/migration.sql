-- Decisions of 01/11/2026: in-site notifications with optional e-mail, and hiding finished applications.
ALTER TYPE "NotificationStatus" ADD VALUE 'SKIPPED';
ALTER TABLE "Notification" ADD COLUMN "readAt" TIMESTAMP(3);
DROP INDEX "Notification_recipientUserId_idx";
CREATE INDEX "Notification_recipientUserId_createdAt_idx" ON "Notification"("recipientUserId", "createdAt");
ALTER TABLE "Application" ADD COLUMN "hiddenByCandidateAt" TIMESTAMP(3);
