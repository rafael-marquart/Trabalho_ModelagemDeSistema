-- SPEC-013: funnel history of each application.
CREATE TABLE "ApplicationStageEvent" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStage" "ApplicationStage",
    "toStage" "ApplicationStage" NOT NULL,
    "kind" TEXT NOT NULL,
    "actorUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApplicationStageEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ApplicationStageEvent_applicationId_createdAt_idx" ON "ApplicationStageEvent"("applicationId", "createdAt");
ALTER TABLE "ApplicationStageEvent" ADD CONSTRAINT "ApplicationStageEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Earlier events are preserved: the history cannot be edited or removed.
CREATE FUNCTION application_stage_event_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ApplicationStageEvent rows are immutable';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "ApplicationStageEvent_no_change" BEFORE UPDATE OR DELETE ON "ApplicationStageEvent"
FOR EACH ROW EXECUTE FUNCTION application_stage_event_immutable();

-- Applications registered before this history existed get their initial event.
INSERT INTO "ApplicationStageEvent" ("id", "applicationId", "fromStage", "toStage", "kind", "actorUserId", "createdAt")
SELECT 'init_' || "id", "id", NULL, 'INSCRITO', 'SUBMITTED', "candidateUserId", "appliedAt" FROM "Application";
