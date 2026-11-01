import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { classifyEmailError, sendEmail } from "@/lib/email";
import { getPublicBaseUrl } from "@/lib/security/public-base-url";
import { normalizePreferences } from "@/lib/accessibility-preferences/catalog";
import { notificationEmail, notificationSummary, type NotificationKind, type NotificationPayload } from "./messages";

// SPEC-017 (OPEN-066 to OPEN-068). Notifications are written in the same transaction as the event that causes them, so
// a confirmed event always leaves a pending notification and a failed send never undoes the event. Delivery happens
// right after the event and is retried with growing intervals; after the last attempt the failure is recorded.

type Tx = Prisma.TransactionClient;

/** Waits before attempts 2, 3, 4 and 5 (1 min, 5 min, 30 min, 2 h). The fifth failure is final. */
export const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 60 * 60_000];
export const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;
/** A row left in SENDING (process stopped mid-send) is picked up again after this long. */
const STUCK_MS = 10 * 60_000;

const json = (payload: NotificationPayload) => payload as Prisma.InputJsonValue;

export async function enqueueApplicationSubmitted(tx: Tx, input: { applicationId: string; jobId: string; candidateUserId: string; jobTitle: string; companyName: string }) {
  await tx.notification.create({ data: {
    type: "APPLICATION_SUBMITTED", recipientUserId: input.candidateUserId, applicationId: input.applicationId, jobId: input.jobId,
    payload: json({ jobTitle: input.jobTitle, companyName: input.companyName })
  } });
}

export async function enqueueStageChanged(tx: Tx, input: { applicationId: string; jobId: string; candidateUserId: string; jobTitle: string; companyName: string; toStage: string }) {
  await tx.notification.create({ data: {
    type: "APPLICATION_STAGE_CHANGED", recipientUserId: input.candidateUserId, applicationId: input.applicationId, jobId: input.jobId,
    payload: json({ jobTitle: input.jobTitle, companyName: input.companyName, toStage: input.toStage })
  } });
}

/**
 * The "recrutador responsável" for a job (OPEN-093, provisional): whoever created it, while still able to act for the
 * company (the company account, or a recruiter with an active link); otherwise the company account.
 */
export async function responsibleRecipient(tx: Tx, job: { companyId: string; createdByUserId: string }) {
  const company = await tx.company.findUnique({ where: { id: job.companyId }, select: { accountUserId: true } });
  if (!company) return null;
  if (job.createdByUserId === company.accountUserId) return { userId: company.accountUserId, area: "empresa" as const };
  const link = await tx.recruiterLink.findFirst({
    where: { companyId: job.companyId, recruiterId: job.createdByUserId, active: true, recruiter: { isActive: true } }, select: { id: true }
  });
  return link ? { userId: job.createdByUserId, area: "recrutador" as const } : { userId: company.accountUserId, area: "empresa" as const };
}

export async function enqueueApplicationCancelled(tx: Tx, input: { applicationId: string; jobId: string; candidateName: string }) {
  const job = await tx.job.findUnique({ where: { id: input.jobId }, select: { title: true, companyId: true, createdByUserId: true } });
  if (!job) return;
  const recipient = await responsibleRecipient(tx, job);
  if (!recipient) return;
  await tx.notification.create({ data: {
    type: "APPLICATION_CANCELLED", recipientUserId: recipient.userId, applicationId: input.applicationId, jobId: input.jobId,
    payload: json({ jobTitle: job.title || "Vaga sem título", candidateName: input.candidateName, recipientArea: recipient.area })
  } });
}

/** RB-42/OPEN-042: one e-mail per candidate still active when the job closes. */
export async function enqueueJobClosed(tx: Tx, input: { jobId: string; jobTitle: string; companyName: string; applications: { id: string; candidateUserId: string }[] }) {
  if (!input.applications.length) return;
  await tx.notification.createMany({ data: input.applications.map((application) => ({
    type: "JOB_CLOSED" as const, recipientUserId: application.candidateUserId, applicationId: application.id, jobId: input.jobId,
    payload: json({ jobTitle: input.jobTitle, companyName: input.companyName })
  })) });
}

/** 4xx answers and connection problems are temporary; a 5xx refusal of the address or message is final. */
export function isTemporary(error: unknown) {
  const failure = classifyEmailError(error);
  return !(failure.kind === "REJECTED" && (failure.responseCode ?? 0) >= 500);
}

const baseUrl = () => getPublicBaseUrl(new Request("http://localhost:3000"));

type Deps = { now?: Date; limit?: number; send?: typeof sendEmail };

/**
 * Sends the notifications that are due. Each row is claimed with a conditional update first, so two workers never send
 * the same e-mail. Returns how many were sent, rescheduled and failed for good.
 */
export async function deliverDueNotifications(deps: Deps = {}) {
  const now = deps.now ?? new Date();
  const send = deps.send ?? sendEmail;
  await prisma.notification.updateMany({ where: { status: "SENDING", updatedAt: { lt: new Date(now.getTime() - STUCK_MS) } }, data: { status: "PENDING" } });
  const due = await prisma.notification.findMany({
    where: { status: "PENDING", nextAttemptAt: { lte: now } }, orderBy: { nextAttemptAt: "asc" }, take: deps.limit ?? 20
  });
  const result = { sent: 0, retrying: 0, failed: 0, skipped: 0 };
  for (const row of due) {
    const claimed = await prisma.notification.updateMany({ where: { id: row.id, status: "PENDING" }, data: { status: "SENDING" } });
    if (claimed.count !== 1) continue;
    const attempts = row.attempts + 1;
    try {
      const recipient = await prisma.user.findUnique({ where: { id: row.recipientUserId }, select: { email: true, isActive: true, preference: { select: { preferences: true } } } });
      if (!recipient) throw Object.assign(new Error("RECIPIENT_NOT_FOUND"), { responseCode: 550 });
      // The notice is always in the site; the e-mail copy follows the recipient's choice (decision of 01/11/2026).
      if (normalizePreferences(recipient.preference?.preferences).EMAIL_NOTIFICATIONS === "OFF") {
        await prisma.notification.update({ where: { id: row.id }, data: { status: "SKIPPED", attempts: row.attempts } });
        result.skipped += 1;
        continue;
      }
      const url = baseUrl();
      if (!url) throw Object.assign(new Error("APP_BASE_URL"), { code: "CONFIG" });
      await send({ to: recipient.email, ...notificationEmail(row.type as NotificationKind, row.payload as NotificationPayload, { baseUrl: url, applicationId: row.applicationId, jobId: row.jobId }) });
      // "SENT" means the SMTP server accepted the message; delivery to the inbox is not confirmed (OPEN-068).
      await prisma.notification.update({ where: { id: row.id }, data: { status: "SENT", attempts, sentAt: new Date(), lastError: null } });
      result.sent += 1;
    } catch (error) {
      const failure = classifyEmailError(error);
      const reason = `${failure.kind}${failure.responseCode ? ` ${failure.responseCode}` : ""}`;
      if (isTemporary(error) && attempts < MAX_ATTEMPTS) {
        await prisma.notification.update({ where: { id: row.id }, data: { status: "PENDING", attempts, lastError: reason, nextAttemptAt: new Date(now.getTime() + RETRY_DELAYS_MS[attempts - 1]) } });
        result.retrying += 1;
      } else {
        await prisma.$transaction([
          prisma.notification.update({ where: { id: row.id }, data: { status: "FAILED", attempts, lastError: reason } }),
          prisma.auditEvent.create({ data: {
            actorUserId: null, eventType: "NOTIFICATION_DELIVERY_FAILED", subjectType: "Notification", subjectId: row.id,
            metadata: { type: row.type, attempts, reason, applicationId: row.applicationId, jobId: row.jobId }
          } })
        ]);
        result.failed += 1;
      }
    }
  }
  return result;
}

let running = false;
let again = false;

/**
 * Starts a delivery round without making the request wait for the SMTP server. A call during a round schedules one more
 * round right after it, so a notification created meanwhile is not left for the periodic worker.
 */
export function kickNotificationDelivery() {
  if (process.env.NOTIFICATIONS_WORKER === "off") return;
  if (running) { again = true; return; }
  running = true;
  void deliverDueNotifications()
    .catch((error) => console.error("[notificações] rodada de envio falhou:", error instanceof Error ? error.message : error))
    .finally(() => {
      running = false;
      if (again) { again = false; kickNotificationDelivery(); }
    });
}

// In-site notices (decision of 01/11/2026, revising OPEN-069): every notification row is also shown to its recipient in
// "Notificações", whatever happened to the e-mail copy. Only the recipient reads or marks their own notices.

export const NOTICES_SHOWN = 50;

export async function listNotices(userId: string) {
  const rows = await prisma.notification.findMany({
    where: { recipientUserId: userId }, orderBy: [{ createdAt: "desc" }, { id: "desc" }], take: NOTICES_SHOWN,
    select: { id: true, type: true, payload: true, applicationId: true, jobId: true, createdAt: true, readAt: true }
  });
  return rows.map((row) => ({
    id: row.id, createdAt: row.createdAt.toISOString(), read: row.readAt !== null,
    ...notificationSummary(row.type as NotificationKind, row.payload as NotificationPayload, { applicationId: row.applicationId, jobId: row.jobId })
  }));
}

export const countUnreadNotices = (userId: string) => prisma.notification.count({ where: { recipientUserId: userId, readAt: null } });

/** Marks one notice (only if it belongs to the user) or all of the user's notices as read. Returns how many changed. */
export async function markNoticesRead(userId: string, id?: string) {
  const changed = await prisma.notification.updateMany({ where: { recipientUserId: userId, readAt: null, ...(id ? { id } : {}) }, data: { readAt: new Date() } });
  return changed.count;
}
