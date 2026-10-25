import { afterEach, describe, expect, it } from "vitest";
import { getPublicBaseUrl } from "./public-base-url";

const originalNodeEnv = process.env.NODE_ENV;
const originalBaseUrl = process.env.APP_BASE_URL;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
  if (originalBaseUrl === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = originalBaseUrl;
});

describe("getPublicBaseUrl", () => {
  const request = new Request("https://untrusted-host.example/path");

  it("uses the configured canonical origin and strips path", () => {
    process.env.NODE_ENV = "production";
    process.env.APP_BASE_URL = "https://acessavagas.example/base-path";

    expect(getPublicBaseUrl(request)).toBe("https://acessavagas.example");
  });

  it("fails closed in production when APP_BASE_URL is missing", () => {
    process.env.NODE_ENV = "production";
    delete process.env.APP_BASE_URL;

    expect(getPublicBaseUrl(request)).toBeNull();
  });

  it("does not accept invalid or non-http configured URLs", () => {
    process.env.NODE_ENV = "production";
    process.env.APP_BASE_URL = "javascript:alert(1)";

    expect(getPublicBaseUrl(request)).toBeNull();
  });

  it("uses request origin only outside production when no canonical URL is configured", () => {
    process.env.NODE_ENV = "test";
    delete process.env.APP_BASE_URL;

    expect(getPublicBaseUrl(request)).toBe("https://untrusted-host.example");
  });
});
