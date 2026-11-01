import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({ prismaMock: {
  notification: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn(), updateMany: vi.fn(), count: vi.fn(), update: vi.fn((args: { data: Record<string, unknown> }) => args) },
  user: { findUnique: vi.fn() }, company: { findUnique: vi.fn() }, recruiterLink: { findFirst: vi.fn() }, job: { findUnique: vi.fn() },
  auditEvent: { create: vi.fn((args: { data: Record<string, unknown> }) => args) },
  $transaction: vi.fn(async (ops: unknown[]) => ops)
} }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
const { afterMock } = vi.hoisted(() => ({ afterMock: vi.fn() }));
vi.mock("next/server", async () => ({ ...(await vi.importActual<typeof import("next/server")>("next/server")), after: afterMock }));
vi.mock("@/lib/email", async () => {
  const actual = await vi.importActual<typeof import("@/lib/email")>("@/lib/email");
  return { ...actual, sendEmail: vi.fn() };
});
import { countUnreadNotices, deliverDueNotifications, kickNotificationDelivery, enqueueApplicationCancelled, enqueueJobClosed, listNotices, markNoticesRead, MAX_ATTEMPTS, RETRY_DELAYS_MS, responsibleRecipient } from "./service";
import { notificationEmail, notificationSummary } from "./messages";

const tx = prismaMock as never;
const now = new Date("2026-11-01T12:00:00Z");
const row = (over: Record<string, unknown> = {}) => ({
  id: "n1", type: "APPLICATION_STAGE_CHANGED", recipientUserId: "cand", applicationId: "a1", jobId: "j1",
  payload: { jobTitle: "Analista", companyName: "Loja", toStage: "ENTREVISTA" }, status: "PENDING", attempts: 0, ...over
});

describe("notifications (SPEC-017)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_BASE_URL = "https://acessavagas.example";
    prismaMock.notification.updateMany.mockResolvedValue({ count: 1 });
    prismaMock.user.findUnique.mockResolvedValue({ email: "ana@example.com", isActive: true });
  });

  it("sends to the job creator while they can act for the company, otherwise to the company account", async () => {
    prismaMock.company.findUnique.mockResolvedValue({ accountUserId: "company-user" });
    expect(await responsibleRecipient(tx, { companyId: "c1", createdByUserId: "company-user" })).toEqual({ userId: "company-user", area: "empresa" });
    prismaMock.recruiterLink.findFirst.mockResolvedValueOnce({ id: "l1" });
    expect(await responsibleRecipient(tx, { companyId: "c1", createdByUserId: "rec" })).toEqual({ userId: "rec", area: "recrutador" });
    prismaMock.recruiterLink.findFirst.mockResolvedValueOnce(null);
    expect(await responsibleRecipient(tx, { companyId: "c1", createdByUserId: "former-rec" })).toEqual({ userId: "company-user", area: "empresa" });
  });

  it("records the cancellation for the responsible recruiter and one closing notice per active candidate", async () => {
    prismaMock.job.findUnique.mockResolvedValue({ title: "Analista", companyId: "c1", createdByUserId: "rec" });
    prismaMock.company.findUnique.mockResolvedValue({ accountUserId: "company-user" });
    prismaMock.recruiterLink.findFirst.mockResolvedValue({ id: "l1" });
    await enqueueApplicationCancelled(tx, { applicationId: "a1", jobId: "j1", candidateName: "Ana Lima" });
    expect(prismaMock.notification.create.mock.calls[0][0].data).toMatchObject({ type: "APPLICATION_CANCELLED", recipientUserId: "rec", payload: { candidateName: "Ana Lima", recipientArea: "recrutador" } });
    await enqueueJobClosed(tx, { jobId: "j1", jobTitle: "Analista", companyName: "Loja", applications: [{ id: "a1", candidateUserId: "c-1" }, { id: "a2", candidateUserId: "c-2" }] });
    const rows = prismaMock.notification.createMany.mock.calls[0][0].data;
    expect(rows.map((item: { recipientUserId: string }) => item.recipientUserId)).toEqual(["c-1", "c-2"]);
    await enqueueJobClosed(tx, { jobId: "j1", jobTitle: "Analista", companyName: "Loja", applications: [] });
    expect(prismaMock.notification.createMany).toHaveBeenCalledTimes(1);
  });

  it("claims, sends and marks a notification as accepted by the server", async () => {
    prismaMock.notification.findMany.mockResolvedValue([row()]);
    const send = vi.fn().mockResolvedValue(undefined);
    expect(await deliverDueNotifications({ now, send })).toEqual({ sent: 1, retrying: 0, failed: 0, skipped: 0 });
    expect(prismaMock.notification.updateMany).toHaveBeenCalledWith({ where: { id: "n1", status: "PENDING" }, data: { status: "SENDING" } });
    expect(send.mock.calls[0][0]).toMatchObject({ to: "ana@example.com", subject: "Sua candidatura mudou: Em entrevista — Acessa Vagas" });
    expect(send.mock.calls[0][0].text).toContain("https://acessavagas.example/candidato/candidaturas/a1");
    expect(prismaMock.notification.update.mock.calls[0][0]).toMatchObject({ where: { id: "n1" }, data: { status: "SENT", attempts: 1 } });
  });

  it("skips a row another worker already claimed", async () => {
    prismaMock.notification.findMany.mockResolvedValue([row()]);
    prismaMock.notification.updateMany.mockResolvedValueOnce({ count: 0 }).mockResolvedValueOnce({ count: 0 });
    const send = vi.fn();
    expect(await deliverDueNotifications({ now, send })).toEqual({ sent: 0, retrying: 0, failed: 0, skipped: 0 });
    expect(send).not.toHaveBeenCalled();
  });

  it("retries temporary failures with growing intervals and records the final failure", async () => {
    const send = vi.fn().mockRejectedValue(Object.assign(new Error("down"), { code: "ECONNECTION" }));
    prismaMock.notification.findMany.mockResolvedValueOnce([row({ attempts: 0 })]);
    expect(await deliverDueNotifications({ now, send })).toEqual({ sent: 0, retrying: 1, failed: 0, skipped: 0 });
    const retry = prismaMock.notification.update.mock.calls[0][0].data;
    expect(retry).toMatchObject({ status: "PENDING", attempts: 1, lastError: "CONNECTION" });
    expect((retry.nextAttemptAt as Date).getTime() - now.getTime()).toBe(RETRY_DELAYS_MS[0]);

    prismaMock.notification.findMany.mockResolvedValueOnce([row({ attempts: MAX_ATTEMPTS - 1 })]);
    expect(await deliverDueNotifications({ now, send })).toEqual({ sent: 0, retrying: 0, failed: 1, skipped: 0 });
    expect(prismaMock.notification.update.mock.calls[1][0].data).toMatchObject({ status: "FAILED", attempts: MAX_ATTEMPTS });
    expect(prismaMock.auditEvent.create.mock.calls[0][0].data).toMatchObject({ eventType: "NOTIFICATION_DELIVERY_FAILED", metadata: { reason: "CONNECTION", attempts: MAX_ATTEMPTS } });
    expect(JSON.stringify(prismaMock.auditEvent.create.mock.calls)).not.toContain("ana@example.com");
  });

  it("keeps the notice in the site but skips the e-mail when the recipient turned it off", async () => {
    prismaMock.notification.findMany.mockResolvedValue([row()]);
    prismaMock.user.findUnique.mockResolvedValue({ email: "ana@example.com", isActive: true, preference: { preferences: { EMAIL_NOTIFICATIONS: "OFF" } } });
    const send = vi.fn();
    expect(await deliverDueNotifications({ now, send })).toEqual({ sent: 0, retrying: 0, failed: 0, skipped: 1 });
    expect(send).not.toHaveBeenCalled();
    expect(prismaMock.notification.update.mock.calls[0][0].data).toMatchObject({ status: "SKIPPED" });
  });

  it("lists, counts and marks only the person's own notices", async () => {
    prismaMock.notification.findMany.mockResolvedValue([{ id: "n1", type: "JOB_CLOSED", payload: { jobTitle: "Analista", companyName: "Loja" }, applicationId: "a1", jobId: "j1", createdAt: now, readAt: null }]);
    const notices = await listNotices("cand");
    expect(prismaMock.notification.findMany.mock.calls[0][0].where).toEqual({ recipientUserId: "cand" });
    expect(notices[0]).toMatchObject({ id: "n1", read: false, title: "Vaga encerrada", href: "/candidato/candidaturas/a1" });
    prismaMock.notification.count.mockResolvedValue(3);
    expect(await countUnreadNotices("cand")).toBe(3);
    expect(prismaMock.notification.count).toHaveBeenCalledWith({ where: { recipientUserId: "cand", readAt: null } });
    await markNoticesRead("cand", "n1");
    expect(prismaMock.notification.updateMany).toHaveBeenLastCalledWith({ where: { recipientUserId: "cand", readAt: null, id: "n1" }, data: { readAt: expect.any(Date) } });
    await markNoticesRead("cand");
    expect(prismaMock.notification.updateMany).toHaveBeenLastCalledWith({ where: { recipientUserId: "cand", readAt: null }, data: { readAt: expect.any(Date) } });
  });

  it("does not retry a permanent refusal (5xx)", async () => {
    prismaMock.notification.findMany.mockResolvedValue([row()]);
    const send = vi.fn().mockRejectedValue(Object.assign(new Error("no such user"), { code: "EENVELOPE", responseCode: 550 }));
    expect(await deliverDueNotifications({ now, send })).toEqual({ sent: 0, retrying: 0, failed: 1, skipped: 0 });
  });
});

describe("notification content", () => {
  const link = { baseUrl: "https://app.example", applicationId: "a1", jobId: "j1" };
  it("points the candidate to the official state and never mentions other people", () => {
    const closed = notificationEmail("JOB_CLOSED", { jobTitle: "Analista", companyName: "Loja" }, link);
    expect(closed.text).toContain("não receberá novas candidaturas");
    expect(closed.text).toContain("continua registrada e não foi excluída");
    expect(closed.text).toContain("https://app.example/candidato/candidaturas/a1");
    const refused = notificationEmail("APPLICATION_STAGE_CHANGED", { jobTitle: "Analista", companyName: "Loja", toStage: "RECUSADA" }, link);
    expect(refused.subject).toBe("Sua candidatura mudou: Recusada — Acessa Vagas");
    expect(refused.text).toContain("a situação oficial é a que aparece na plataforma");
  });
  it("sends the recruiter to the funnel of the right area", () => {
    const email = notificationEmail("APPLICATION_CANCELLED", { jobTitle: "Analista", candidateName: "Ana Lima", recipientArea: "recrutador" }, link);
    expect(email.text).toContain("https://app.example/recrutador/vagas/j1/candidaturas/a1");
    expect(email.text).toContain("Ana Lima cancelou a candidatura para Analista");
  });
  it("tells the candidate the interview details, in Brasília time", () => {
    const payload = { jobTitle: "Analista", companyName: "Loja", scheduledAt: "2026-11-10T17:30:00.000Z", modality: "ONLINE", locationOrLink: "https://meet.example/x", accessibilityResources: "Intérprete de Libras" };
    const scheduled = notificationEmail("INTERVIEW_SCHEDULED", payload, link);
    expect(scheduled.subject).toBe("Entrevista agendada: Analista — Acessa Vagas");
    expect(scheduled.text).toContain("terça-feira, 10/11/2026, às 14:30 (horário de Brasília)");
    expect(scheduled.text).toContain("Link: https://meet.example/x");
    expect(scheduled.text).toContain("Recursos de acessibilidade previstos: Intérprete de Libras");
    expect(notificationEmail("INTERVIEW_CANCELLED", payload, link).text).toContain("Sua candidatura continua no processo seletivo");
  });
  it("tells the reporter the result and the company only that it must look at Denúncias", () => {
    const toReporter = notificationSummary("REPORT_CONCLUDED", { reportId: "r1", area: "candidato", jobTitle: "Analista", decisionLabel: "Procedente", summary: "Confirmado." }, {});
    expect(toReporter).toMatchObject({ title: "Sua denúncia foi concluída", href: "/candidato/denuncias/r1" });
    expect(toReporter.body).toContain("Procedente. Confirmado.");
    const toCompany = notificationSummary("REPORT_INFO_REQUESTED", { reportId: "r1", area: "empresa", jobTitle: "Analista" }, {});
    expect(toCompany.href).toBe("/empresa/denuncias");
    expect(notificationEmail("REPORT_CONCLUDED", { reportId: "r1", area: "empresa", jobTitle: "Analista", decisionLabel: "Improcedente" }, link).text).toContain("https://app.example/empresa/denuncias");
  });

  describe("starting a delivery round", () => {
    beforeEach(() => { vi.clearAllMocks(); afterMock.mockReset(); });

    it("inside a request, hands the round to after() so a serverless function stays alive until it ends", async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      afterMock.mockImplementation(() => undefined);
      kickNotificationDelivery();
      expect(afterMock).toHaveBeenCalledTimes(1);
      expect(prismaMock.notification.findMany).not.toHaveBeenCalled();
      await afterMock.mock.calls[0][0]();
      expect(prismaMock.notification.findMany).toHaveBeenCalledTimes(1);
    });

    it("outside a request (server start, scripts), runs the round in the background", async () => {
      prismaMock.notification.findMany.mockResolvedValue([]);
      afterMock.mockImplementation(() => { throw new Error("after() was called outside a request scope"); });
      kickNotificationDelivery();
      await vi.waitFor(() => expect(prismaMock.notification.findMany).toHaveBeenCalledTimes(1));
    });

    it("does nothing when another process delivers the notifications", () => {
      process.env.NOTIFICATIONS_WORKER = "off";
      try {
        kickNotificationDelivery();
        expect(afterMock).not.toHaveBeenCalled();
      } finally {
        delete process.env.NOTIFICATIONS_WORKER;
      }
    });
  });
});
