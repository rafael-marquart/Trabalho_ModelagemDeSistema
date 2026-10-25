import { afterEach, describe, expect, it } from "vitest";
import { rejectCrossOriginRequest } from "./request-origin";

const originalBaseUrl = process.env.APP_BASE_URL;

afterEach(() => {
  if (originalBaseUrl === undefined) delete process.env.APP_BASE_URL;
  else process.env.APP_BASE_URL = originalBaseUrl;
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

  it("allows requests without Origin for non-browser clients", () => {
    process.env.APP_BASE_URL = "https://acessavagas.example";
    const request = new Request("https://acessavagas.example/api/mutation");

    expect(rejectCrossOriginRequest(request)).toBeNull();
  });
});
