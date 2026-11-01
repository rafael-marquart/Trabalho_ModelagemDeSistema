import { afterEach, describe, expect, it, vi } from "vitest";
import { rejectCrossOriginRequest } from "./request-origin";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("rejectCrossOriginRequest", () => {
  it("allows same-origin browser requests", () => {
    vi.stubEnv("APP_BASE_URL", "https://acessavagas.example");
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "https://acessavagas.example" }
    });

    expect(rejectCrossOriginRequest(request)).toBeNull();
  });

  it("rejects a different origin, including a different port", () => {
    vi.stubEnv("APP_BASE_URL", "https://acessavagas.example");
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "https://acessavagas.example:444" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(403);
  });

  it("rejects malformed Origin values", () => {
    vi.stubEnv("APP_BASE_URL", "https://acessavagas.example");
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "not-an-origin" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(403);
  });

  it("fails closed in production when the canonical public origin is not configured", () => {
    vi.stubEnv("APP_BASE_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    const request = new Request("https://attacker-controlled.example/api/mutation", {
      headers: { origin: "https://attacker-controlled.example" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(503);
  });

  it("fails closed in production when APP_BASE_URL uses HTTP", () => {
    vi.stubEnv("APP_BASE_URL", "http://acessavagas.example");
    vi.stubEnv("NODE_ENV", "production");
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "https://acessavagas.example" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(503);
  });

  it("allows requests without Origin for non-browser clients", () => {
    vi.stubEnv("APP_BASE_URL", "https://acessavagas.example");
    const request = new Request("https://acessavagas.example/api/mutation");

    expect(rejectCrossOriginRequest(request)).toBeNull();
  });
});
