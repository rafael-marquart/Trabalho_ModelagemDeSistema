import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const css = readFileSync(resolve(process.cwd(), "src/app/globals.css"), "utf8");
const lightBlock = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1];
const darkBlock = css.match(/:root\[data-theme="dark"\]\s*\{([\s\S]*?)\}/)?.[1];

if (!lightBlock || !darkBlock) throw new Error("Theme token blocks are missing from globals.css");

function token(block: string, name: string) {
  const value = block.match(new RegExp("--" + name + ":\\s*(#[0-9a-f]{6})", "i"))?.[1];
  if (!value) throw new Error("Missing CSS token: " + name);
  return value.toUpperCase();
}

function luminance(hex: string) {
  const channels = hex.slice(1).match(/.{2}/g)?.map(pair => Number.parseInt(pair, 16) / 255);
  if (!channels || channels.length !== 3) throw new Error("Invalid hex color: " + hex);
  const linear = channels.map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

function contrast(first: string, second: string) {
  const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

describe("approved visual tokens and focus contrast", () => {
  it("keeps the refined light theme palette consistent with the implemented design", () => {
    const expected: Record<string, string> = {
      ink: "#261B38",
      muted: "#6D647A",
      purple: "#6B29BF",
      "purple-dark": "#4A148C",
      "purple-soft": "#E1D5F0",
      line: "#C9BCD9",
      surface: "#F0EBF5",
      background: "#E2DCE9",
      danger: "#B42318"
    };

    for (const [name, value] of Object.entries(expected)) {
      expect(token(lightBlock, name)).toBe(value);
    }
  });

  it("uses focus indicators with at least 3:1 contrast in light and dark themes", () => {
    expect(css.match(/outline:\s*3px solid var\(--focus-ring\)/g)?.length).toBeGreaterThanOrEqual(2);
    expect(token(lightBlock, "focus-ring")).toBe("#6B29BF");
    expect(token(darkBlock, "focus-ring")).toBe("#C5A9FF");
    expect(contrast(token(lightBlock, "focus-ring"), token(lightBlock, "background"))).toBeGreaterThanOrEqual(3);
    expect(contrast(token(lightBlock, "focus-ring"), token(lightBlock, "surface"))).toBeGreaterThanOrEqual(3);
    expect(contrast(token(darkBlock, "focus-ring"), token(darkBlock, "background"))).toBeGreaterThanOrEqual(3);
    expect(contrast(token(darkBlock, "focus-ring"), token(darkBlock, "surface"))).toBeGreaterThanOrEqual(3);
  });
});
