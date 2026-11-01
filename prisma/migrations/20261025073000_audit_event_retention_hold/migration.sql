-- Preserve audit events that are under an applicable legal or operational hold.
-- Retention cleanup must never delete records explicitly marked for preservation.
ALTER TABLE "AuditEvent"
ADD COLUMN "retentionHold" BOOLEAN NOT NULL DEFAULT false;
