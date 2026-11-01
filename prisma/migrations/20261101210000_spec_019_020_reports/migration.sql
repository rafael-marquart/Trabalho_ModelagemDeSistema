-- SPEC-019/020: reports and their moderation.
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_STATUS_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_INFO_REQUESTED';
ALTER TYPE "NotificationType" ADD VALUE 'REPORT_CONCLUDED';

CREATE TYPE "ReportCategory" AS ENUM ('ACCESSIBILITY_INCOMPATIBILITY', 'FALSE_INCLUSION');
CREATE TYPE "ReportStatus" AS ENUM ('RECEBIDA', 'EM_ANALISE', 'AGUARDANDO_INFORMACOES', 'CONCLUIDA');
CREATE TYPE "ReportDecision" AS ENUM ('PROCEDENTE', 'PARCIALMENTE_PROCEDENTE', 'IMPROCEDENTE', 'INCONCLUSIVA');

CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterUserId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "evaluationId" TEXT,
    "category" "ReportCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT,
    "reporterFlaggedRisk" BOOLEAN NOT NULL DEFAULT false,
    "highPriority" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReportStatus" NOT NULL DEFAULT 'RECEBIDA',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "extensionReason" TEXT,
    "companyRequest" TEXT,
    "companyResponse" TEXT,
    "companyRespondedAt" TIMESTAMP(3),
    "decision" "ReportDecision",
    "reporterSummary" TEXT,
    "justification" TEXT,
    "measures" TEXT,
    "decidedByUserId" TEXT,
    "concludedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Report_status_highPriority_createdAt_idx" ON "Report"("status", "highPriority", "createdAt");
CREATE INDEX "Report_reporterUserId_createdAt_idx" ON "Report"("reporterUserId", "createdAt");
CREATE INDEX "Report_companyId_idx" ON "Report"("companyId");
-- OPEN-076: the same candidate cannot have two open reports about the same job.
CREATE UNIQUE INDEX "Report_one_open_per_reporter_job" ON "Report"("reporterUserId", "jobId") WHERE "status" <> 'CONCLUIDA';

CREATE TABLE "ReportEvent" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "fromStatus" "ReportStatus",
    "toStatus" "ReportStatus",
    "actorUserId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReportEvent_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ReportEvent_reportId_createdAt_idx" ON "ReportEvent"("reportId", "createdAt");
ALTER TABLE "ReportEvent" ADD CONSTRAINT "ReportEvent_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE FUNCTION report_event_immutable() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'ReportEvent rows are immutable';
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER "ReportEvent_no_change" BEFORE UPDATE OR DELETE ON "ReportEvent" FOR EACH ROW EXECUTE FUNCTION report_event_immutable();
