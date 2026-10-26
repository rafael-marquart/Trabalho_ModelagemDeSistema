import { describe, expect, it } from "vitest";
import { createOneTimeToken, hashOneTimeToken } from "./tokens";

describe("one-time tokens", () => {
  it("generates a random token and stores only a stable digest", () => {
    const first = createOneTimeToken();
    const second = createOneTimeToken();

    expect(first.token).not.toBe(second.token);
    expect(first.tokenHash).toBe(hashOneTimeToken(first.token));
    expect(first.tokenHash).not.toBe(first.token);
    expect(first.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("hashes the same token consistently", () => {
    expect(hashOneTimeToken("example-token")).toBe(hashOneTimeToken("example-token"));
    expect(hashOneTimeToken("example-token")).not.toBe(hashOneTimeToken("another-token"));
  });
});
