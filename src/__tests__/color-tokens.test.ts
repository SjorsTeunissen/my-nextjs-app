import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Parse globals.css and verify that accent/primary color tokens
 * use oklch values with non-zero chroma on the violet axis (~270-290).
 */

const cssPath = path.resolve(__dirname, "../app/globals.css");
const css = fs.readFileSync(cssPath, "utf-8");

/** Extract all `--token: oklch(...)` declarations from a CSS block */
function extractOklchTokens(block: string): Record<string, { l: number; c: number; h: number }> {
  const tokens: Record<string, { l: number; c: number; h: number }> = {};
  const re = /--([\w-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g;
  let match;
  while ((match = re.exec(block)) !== null) {
    tokens[match[1]] = {
      l: parseFloat(match[2]),
      c: parseFloat(match[3]),
      h: parseFloat(match[4]),
    };
  }
  return tokens;
}

/** Extract the :root { ... } block */
function extractRootBlock(source: string): string {
  const rootMatch = source.match(/:root\s*\{([^}]+)\}/);
  return rootMatch ? rootMatch[1] : "";
}

/** Extract the .dark { ... } block */
function extractDarkBlock(source: string): string {
  const darkMatch = source.match(/\.dark\s*\{([^}]+)\}/);
  return darkMatch ? darkMatch[1] : "";
}

// Tokens that should carry violet/purple chroma
const VIOLET_TOKENS = [
  "primary",
  "secondary",
  "accent",
  "ring",
  "sidebar-primary",
  "sidebar-accent",
  "sidebar-ring",
];

describe("Color tokens use violet/purple oklch values", () => {
  describe(":root (light mode)", () => {
    const rootBlock = extractRootBlock(css);
    const tokens = extractOklchTokens(rootBlock);

    it.each(VIOLET_TOKENS)("--%s has non-zero chroma", (name) => {
      const token = tokens[name];
      expect(token, `Token --${name} not found in :root`).toBeDefined();
      expect(token.c).toBeGreaterThan(0);
    });

    it.each(VIOLET_TOKENS)("--%s hue is on violet axis (270-290)", (name) => {
      const token = tokens[name];
      expect(token, `Token --${name} not found in :root`).toBeDefined();
      expect(token.h).toBeGreaterThanOrEqual(270);
      expect(token.h).toBeLessThanOrEqual(290);
    });
  });

  describe(".dark (dark mode)", () => {
    const darkBlock = extractDarkBlock(css);
    const tokens = extractOklchTokens(darkBlock);

    it.each(VIOLET_TOKENS)("--%s has non-zero chroma", (name) => {
      const token = tokens[name];
      expect(token, `Token --${name} not found in .dark`).toBeDefined();
      expect(token.c).toBeGreaterThan(0);
    });

    it.each(VIOLET_TOKENS)("--%s hue is on violet axis (270-290)", (name) => {
      const token = tokens[name];
      expect(token, `Token --${name} not found in .dark`).toBeDefined();
      expect(token.h).toBeGreaterThanOrEqual(270);
      expect(token.h).toBeLessThanOrEqual(290);
    });
  });
});
