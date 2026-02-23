import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * Parse globals.css and verify that color tokens use the Ink & Ledger
 * oklch palette values from .interface-design/system.md.
 */

const cssPath = path.resolve(__dirname, "../app/globals.css");
const css = fs.readFileSync(cssPath, "utf-8");

/** Extract all `--token: oklch(...)` declarations from a CSS block.
 *  Handles both `oklch(L C H)` and `oklch(L C H / alpha%)` syntax. */
function extractOklchTokens(
  block: string
): Record<string, string> {
  const tokens: Record<string, string> = {};
  const re = /--([\w-]+):\s*(oklch\([^)]+\))/g;
  let match;
  while ((match = re.exec(block)) !== null) {
    tokens[match[1]] = match[2];
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

// Expected light mode (:root) Ink & Ledger values
const LIGHT_EXPECTED: Record<string, string> = {
  background: "oklch(0.985 0.005 85)",
  foreground: "oklch(0.205 0.015 260)",
  card: "oklch(0.995 0.003 85)",
  "card-foreground": "oklch(0.205 0.015 260)",
  popover: "oklch(1.0 0.0 0)",
  "popover-foreground": "oklch(0.205 0.015 260)",
  primary: "oklch(0.40 0.12 260)",
  "primary-foreground": "oklch(0.985 0.005 85)",
  secondary: "oklch(0.95 0.02 260)",
  "secondary-foreground": "oklch(0.205 0.015 260)",
  muted: "oklch(0.97 0.003 85)",
  "muted-foreground": "oklch(0.45 0.01 260)",
  accent: "oklch(0.95 0.02 260)",
  "accent-foreground": "oklch(0.205 0.015 260)",
  destructive: "oklch(0.55 0.20 25)",
  border: "oklch(0.88 0.005 85)",
  input: "oklch(0.85 0.006 85)",
  ring: "oklch(0.40 0.12 260)",
  sidebar: "oklch(0.985 0.005 85)",
  "sidebar-foreground": "oklch(0.205 0.015 260)",
  "sidebar-primary": "oklch(0.40 0.12 260)",
  "sidebar-primary-foreground": "oklch(0.985 0.005 85)",
  "sidebar-accent": "oklch(0.95 0.02 260)",
  "sidebar-accent-foreground": "oklch(0.205 0.015 260)",
  "sidebar-border": "oklch(0.88 0.005 85)",
  "sidebar-ring": "oklch(0.40 0.12 260)",
};

// Expected dark mode (.dark) Ink & Ledger values
const DARK_EXPECTED: Record<string, string> = {
  background: "oklch(0.16 0.008 260)",
  foreground: "oklch(0.93 0.005 85)",
  card: "oklch(0.20 0.010 260)",
  "card-foreground": "oklch(0.93 0.005 85)",
  popover: "oklch(0.24 0.010 260)",
  "popover-foreground": "oklch(0.93 0.005 85)",
  primary: "oklch(0.65 0.14 260)",
  "primary-foreground": "oklch(0.16 0.008 260)",
  secondary: "oklch(0.22 0.03 260)",
  "secondary-foreground": "oklch(0.93 0.005 85)",
  muted: "oklch(0.22 0.015 260)",
  "muted-foreground": "oklch(0.72 0.008 85)",
  accent: "oklch(0.22 0.03 260)",
  "accent-foreground": "oklch(0.93 0.005 85)",
  destructive: "oklch(0.65 0.16 25)",
  border: "oklch(1 0 0 / 10%)",
  input: "oklch(1 0 0 / 12%)",
  ring: "oklch(0.65 0.14 260)",
  sidebar: "oklch(0.16 0.008 260)",
  "sidebar-foreground": "oklch(0.93 0.005 85)",
  "sidebar-primary": "oklch(0.65 0.14 260)",
  "sidebar-primary-foreground": "oklch(0.16 0.008 260)",
  "sidebar-accent": "oklch(0.22 0.03 260)",
  "sidebar-accent-foreground": "oklch(0.93 0.005 85)",
  "sidebar-border": "oklch(1 0 0 / 10%)",
  "sidebar-ring": "oklch(0.65 0.14 260)",
};

describe("Color tokens use Ink & Ledger oklch palette", () => {
  describe(":root (light mode)", () => {
    const rootBlock = extractRootBlock(css);
    const tokens = extractOklchTokens(rootBlock);

    it.each(Object.entries(LIGHT_EXPECTED))(
      "--%s matches expected Ink & Ledger value",
      (name, expected) => {
        expect(tokens[name], `Token --${name} not found in :root`).toBeDefined();
        expect(tokens[name]).toBe(expected);
      }
    );
  });

  describe(".dark (dark mode)", () => {
    const darkBlock = extractDarkBlock(css);
    const tokens = extractOklchTokens(darkBlock);

    it.each(Object.entries(DARK_EXPECTED))(
      "--%s matches expected Ink & Ledger value",
      (name, expected) => {
        expect(tokens[name], `Token --${name} not found in .dark`).toBeDefined();
        expect(tokens[name]).toBe(expected);
      }
    );
  });

  describe("structural integrity", () => {
    it("preserves @theme inline block", () => {
      expect(css).toContain("@theme inline");
    });

    it("preserves filter-badge-in keyframes", () => {
      expect(css).toContain("@keyframes filter-badge-in");
    });

    it("preserves prefers-reduced-motion query", () => {
      expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    });

    it("preserves section-expand animation", () => {
      expect(css).toContain(".section-expand");
    });
  });
});
