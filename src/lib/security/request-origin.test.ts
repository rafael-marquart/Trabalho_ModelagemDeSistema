import { afterEach, describe, expect, it } from "vitest";
import { rejectCrossOriginRequest } from "./request-origin";

const originalBaseUrl = process.env.APP_BASE_URL;
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = originalBaseUrl;
  if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
  else process.env.NODE_ENV = originalNodeEnv;
});

describe("rejectCrossOriginRequest", () => {
  it("allows same-origin browser requests", () => {
    process.env.APP_BASE_URL = "https://acessavagas.example";
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "https://acessavagas.example" }
    });

    expect(rejectCrossOriginRequest(request)).toBeNull();
  });

  it("rejects a different origin, including a different port", () => {
    process.env.APP_BASE_URL = "https://acessavagas.example";
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "https://acessavagas.example:444" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(403);
  });

  it("rejects malformed Origin values", () => {
    process.env.APP_BASE_URL = "https://acessavagas.example";
    const request = new Request("https://acessavagas.example/api/mutation", {
      headers: { origin: "not-an-origin" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(403);
  });

  it("fails closed in production when the canonical public origin is not configured", () => {
    delete process.env.APP_BASE_URL;
    process.env.NODE_ENV = "production";
    const request = new Request("https://attacker-controlled.example/api/mutation", {
      headers: { origin: "https://attacker-controlled.example" }
    });

    expect(rejectCrossOriginRequest(request)?.status).toBe(503);
  });

  it("allows requests without Origin for non-browser clients", () => {
    process.env.APP_BASE_URL = "https://acessavagas.example";
    const request = new Request("https://acessavagas.example/api/mutation");

    expect(rejectCrossOriginRequest(request)).toBeNull();
  });
});
