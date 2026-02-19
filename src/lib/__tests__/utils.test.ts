import { describe, it, expect } from "vitest";
import { cn, formatCurrency } from "@/lib/utils";

describe("cn", () => {
  it("merges multiple class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("returns empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

describe("formatCurrency", () => {
  it("formats a standard EUR amount", () => {
    expect(formatCurrency(1234.56)).toBe("€\u00a01.234,56");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("€\u00a00,00");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-50)).toBe("€\u00a0-50,00");
  });
});
