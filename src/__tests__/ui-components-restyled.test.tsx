// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

/**
 * Render-based tests verifying restyled component classes for Linear-compact aesthetic.
 */

describe("Button restyled", () => {
  it("default size uses h-8", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bh-8\b/);
    expect(btn.className).not.toMatch(/\bh-9\b/);
  });

  it("sm size uses h-7", () => {
    const { container } = render(<Button size="sm">Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bh-7\b/);
    expect(btn.className).not.toMatch(/\bh-8\b/);
  });

  it("lg size uses h-9", () => {
    const { container } = render(<Button size="lg">Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bh-9\b/);
    expect(btn.className).not.toMatch(/\bh-10\b/);
  });

  it("icon size uses size-8", () => {
    const { container } = render(<Button size="icon">X</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bsize-8\b/);
    expect(btn.className).not.toMatch(/\bsize-9\b/);
  });

  it("preserves all variant names", () => {
    // Just verify they render without error
    const variants = ["default", "destructive", "outline", "secondary", "ghost", "link"] as const;
    for (const variant of variants) {
      const { container } = render(<Button variant={variant}>V</Button>);
      const btn = container.querySelector("[data-slot='button']")!;
      expect(btn).toBeTruthy();
    }
  });

  it("preserves data-slot, data-variant, data-size attributes", () => {
    const { container } = render(<Button variant="outline" size="sm">V</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.getAttribute("data-slot")).toBe("button");
    expect(btn.getAttribute("data-variant")).toBe("outline");
    expect(btn.getAttribute("data-size")).toBe("sm");
  });

  it("exports buttonVariants", async () => {
    const mod = await import("@/components/ui/button");
    expect(mod.buttonVariants).toBeDefined();
  });
});

describe("Card restyled", () => {
  it("Card uses gap-4, rounded-lg, py-4, shadow-xs", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector("[data-slot='card']")!;
    expect(card.className).toMatch(/\bgap-4\b/);
    expect(card.className).toMatch(/\brounded-lg\b/);
    expect(card.className).toMatch(/\bpy-4\b/);
    expect(card.className).toMatch(/\bshadow-xs\b/);
    expect(card.className).not.toMatch(/\bgap-6\b/);
    expect(card.className).not.toMatch(/\brounded-xl\b/);
    expect(card.className).not.toMatch(/\bpy-6\b/);
    expect(card.className).not.toMatch(/\bshadow-sm\b/);
  });

  it("CardHeader uses gap-1.5, px-4", () => {
    const { container } = render(<Card><CardHeader>H</CardHeader></Card>);
    const header = container.querySelector("[data-slot='card-header']")!;
    expect(header.className).toMatch(/\bgap-1\.5\b/);
    expect(header.className).toMatch(/\bpx-4\b/);
    expect(header.className).not.toMatch(/\bgap-2\b/);
    expect(header.className).not.toMatch(/\bpx-6\b/);
  });

  it("CardTitle includes text-sm", () => {
    const { container } = render(<Card><CardHeader><CardTitle>T</CardTitle></CardHeader></Card>);
    const title = container.querySelector("[data-slot='card-title']")!;
    expect(title.className).toMatch(/\btext-sm\b/);
  });

  it("CardDescription uses text-xs", () => {
    const { container } = render(<Card><CardHeader><CardDescription>D</CardDescription></CardHeader></Card>);
    const desc = container.querySelector("[data-slot='card-description']")!;
    expect(desc.className).toMatch(/\btext-xs\b/);
    expect(desc.className).not.toMatch(/\btext-sm\b/);
  });

  it("CardContent uses px-4", () => {
    const { container } = render(<Card><CardContent>C</CardContent></Card>);
    const content = container.querySelector("[data-slot='card-content']")!;
    expect(content.className).toMatch(/\bpx-4\b/);
    expect(content.className).not.toMatch(/\bpx-6\b/);
  });

  it("CardFooter uses px-4", () => {
    const { container } = render(<Card><CardFooter>F</CardFooter></Card>);
    const footer = container.querySelector("[data-slot='card-footer']")!;
    expect(footer.className).toMatch(/\bpx-4\b/);
    expect(footer.className).not.toMatch(/\bpx-6\b/);
  });
});

describe("Input restyled", () => {
  it("uses h-8", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).toMatch(/\bh-8\b/);
    expect(input.className).not.toMatch(/\bh-9\b/);
  });

  it("does not have shadow-xs", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).not.toMatch(/\bshadow-xs\b/);
  });

  it("uses focus-visible:ring-[2px]", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).toContain("focus-visible:ring-[2px]");
    expect(input.className).not.toContain("focus-visible:ring-[3px]");
  });
});

describe("Table restyled", () => {
  it("TableHead uses h-8", () => {
    const { container } = render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Header</TableHead>
          </TableRow>
        </TableHeader>
      </Table>
    );
    const th = container.querySelector("[data-slot='table-head']")!;
    expect(th.className).toMatch(/\bh-8\b/);
    expect(th.className).not.toMatch(/\bh-10\b/);
  });

  it("TableCell uses px-2 py-1.5", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const td = container.querySelector("[data-slot='table-cell']")!;
    expect(td.className).toMatch(/\bpx-2\b/);
    expect(td.className).toMatch(/\bpy-1\.5\b/);
    // Should not have the old p-2 shorthand
    expect(td.className).not.toMatch(/\bp-2\b/);
  });
});
