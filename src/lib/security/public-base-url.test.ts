import { afterEach, describe, expect, it, vi } from "vitest";
import { getPublicBaseUrl } from "./public-base-url";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getPublicBaseUrl", () => {
  const request = new Request("https://untrusted-host.example/path");

  it("uses the configured canonical origin and strips path", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.APP_BASE_URL = "https://acessavagas.example/base-path";

    expect(getPublicBaseUrl(request)).toBe("https://acessavagas.example");
  });

  it("fails closed in production when APP_BASE_URL is missing", () => {
    vi.stubEnv("NODE_ENV", "production");
    delete process.env.APP_BASE_URL;

    expect(getPublicBaseUrl(request)).toBeNull();
  });

  it("does not accept invalid or non-http configured URLs", () => {
    vi.stubEnv("NODE_ENV", "production");
    process.env.APP_BASE_URL = "javascript:alert(1)";

    expect(getPublicBaseUrl(request)).toBeNull();
  });

  it("uses request origin only outside production when no canonical URL is configured", () => {
    vi.stubEnv("NODE_ENV", "test");
    delete process.env.APP_BASE_URL;

    expect(getPublicBaseUrl(request)).toBe("https://untrusted-host.example");
  });
});
