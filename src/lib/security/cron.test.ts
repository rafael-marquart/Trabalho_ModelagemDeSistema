import { afterEach, describe, expect, it, vi } from "vitest";
import { isAuthorizedCron } from "./cron";

const call = (authorization?: string) => new Request("https://example.test/api/cron/x", { headers: authorization ? { authorization } : {} });

describe("scheduled route authorization", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("refuses every call while no strong secret is configured", () => {
    vi.stubEnv("CRON_SECRET", "");
    expect(isAuthorizedCron(call("Bearer "))).toBe(false);
    vi.stubEnv("CRON_SECRET", "short");
    expect(isAuthorizedCron(call("Bearer short"))).toBe(false);
  });

  it("accepts only the exact bearer secret", () => {
    vi.stubEnv("CRON_SECRET", "a-long-enough-cron-secret");
    expect(isAuthorizedCron(call())).toBe(false);
    expect(isAuthorizedCron(call("Bearer wrong-secret-of-some-size"))).toBe(false);
    expect(isAuthorizedCron(call("a-long-enough-cron-secret"))).toBe(false);
    expect(isAuthorizedCron(call("Bearer a-long-enough-cron-secret"))).toBe(true);
  });
});
