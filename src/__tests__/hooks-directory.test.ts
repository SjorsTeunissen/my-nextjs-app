import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("src/hooks directory", () => {
  it("exists", () => {
    const hooksDir = path.resolve(__dirname, "../hooks");
    expect(fs.existsSync(hooksDir)).toBe(true);
  });

  it("is a directory", () => {
    const hooksDir = path.resolve(__dirname, "../hooks");
    const stat = fs.statSync(hooksDir);
    expect(stat.isDirectory()).toBe(true);
  });
});
