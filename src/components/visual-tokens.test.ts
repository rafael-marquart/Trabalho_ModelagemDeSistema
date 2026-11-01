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
      muted: "#5C5369",
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

  it("keeps secondary text at WCAG AA (4.5:1) on every light background", () => {
    // #6D647A reached only 4.16:1 on the page background (axe-core in the browser, 01/11/2026).
    for (const background of ["background", "surface", "purple-soft"]) {
      expect(contrast(token(lightBlock, "muted"), token(lightBlock, background)), "muted on " + background).toBeGreaterThanOrEqual(4.5);
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

describe("high contrast tokens (SPEC-003, OPEN-012)", () => {
  const block = (selector: string) => {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = css.match(new RegExp(escaped + "\\s*\\{([\\s\\S]*?)\\}"))?.[1];
    if (!match) throw new Error("Missing block " + selector);
    return match;
  };
  const light = block(':root[data-contrast="high"]');
  const dark = block(':root[data-contrast="high"][data-theme="dark"]');

  it.each([["light", light], ["dark", dark]])("keeps text, links, errors and states at 7:1 or better (%s)", (_name, tokens) => {
    const background = token(tokens, "background");
    const surface = token(tokens, "surface");
    for (const name of ["ink", "muted", "purple", "purple-dark", "danger", "status-success-text", "status-pending-text", "status-neutral-text"]) {
      expect(contrast(token(tokens, name), background), name + " on background").toBeGreaterThanOrEqual(7);
      expect(contrast(token(tokens, name), surface), name + " on surface").toBeGreaterThanOrEqual(7);
    }
    expect(contrast(token(tokens, "focus-ring"), background)).toBeGreaterThanOrEqual(3);
    expect(contrast(token(tokens, "line"), background)).toBeGreaterThanOrEqual(3);
  });

  it("keeps primary button text readable in both themes", () => {
    expect(contrast("#FFFFFF", token(light, "purple"))).toBeGreaterThanOrEqual(7);
    expect(contrast("#000000", token(dark, "purple"))).toBeGreaterThanOrEqual(7);
  });

  it("offers the same palette when the system asks for more contrast", () => {
    expect(css).toMatch(/@media \(prefers-contrast: more\) \{\s*:root\[data-contrast="auto"\]/);
  });
});
