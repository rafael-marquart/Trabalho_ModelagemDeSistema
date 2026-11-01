// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { deliverMock, routinesMock } = vi.hoisted(() => ({
  deliverMock: vi.fn(),
  routinesMock: { audit: vi.fn(), login: vi.fn(), compat: vi.fn(), notices: vi.fn(), evaluations: vi.fn() }
}));
vi.mock("@/lib/prisma", () => ({ prisma: { tag: "prisma" } }));
vi.mock("@/lib/notifications/service", () => ({ deliverDueNotifications: deliverMock }));
vi.mock("../../../../scripts/audit-retention.mjs", () => ({ purgeExpiredAuditEvents: routinesMock.audit }));
vi.mock("../../../../scripts/login-security-retention.mjs", () => ({ purgeExpiredLoginSecurityRecords: routinesMock.login }));
vi.mock("../../../../scripts/compatibility-retention.mjs", () => ({ purgeExpiredCompatibilityResults: routinesMock.compat }));
vi.mock("../../../../scripts/notification-retention.mjs", () => ({ purgeExpiredNotifications: routinesMock.notices }));
vi.mock("../../../../scripts/evaluation-retention.mjs", () => ({ anonymizeExpiredEvaluations: routinesMock.evaluations }));

import { GET as notifications } from "./notificacoes/route";
import { GET as retention } from "./retencao/route";

const SECRET = "test-cron-secret-1234567890";
const call = (authorization?: string) => new Request("https://example.test/api/cron", { headers: authorization ? { authorization } : {} });

describe("scheduled routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", SECRET);
    deliverMock.mockResolvedValue({ sent: 2, retrying: 1, failed: 0, skipped: 0 });
    for (const routine of Object.values(routinesMock)) routine.mockResolvedValue({ executed: true });
  });
  afterEach(() => vi.unstubAllEnvs());

  it("refuse callers without the secret and do nothing", async () => {
    expect((await notifications(call())).status).toBe(401);
    expect((await retention(call("Bearer wrong"))).status).toBe(401);
    expect(deliverMock).not.toHaveBeenCalled();
    expect(routinesMock.audit).not.toHaveBeenCalled();
  });

  it("run one notification round and report the counts", async () => {
    const response = await notifications(call(`Bearer ${SECRET}`));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true, sent: 2, retrying: 1, failed: 0, skipped: 0 });
    expect(deliverMock).toHaveBeenCalledWith({ limit: 50 });
  });

  it("run every retention routine for real (not as a simulation)", async () => {
    const response = await retention(call(`Bearer ${SECRET}`));
    expect(response.status).toBe(200);
    for (const routine of Object.values(routinesMock)) expect(routine).toHaveBeenCalledWith({ tag: "prisma" }, { execute: true });
  });

  it("keep running the other routines when one fails, and say which failed", async () => {
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    routinesMock.compat.mockRejectedValueOnce(new Error("timeout"));
    const response = await retention(call(`Bearer ${SECRET}`));
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body.results.compatibility).toEqual({ error: "timeout" });
    expect(routinesMock.evaluations).toHaveBeenCalled();
  });
});
