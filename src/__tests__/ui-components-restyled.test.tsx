// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";

describe("Button restyled", () => {
  it("uses rounded-sm (Radius-sm = 4px)", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\brounded-sm\b/);
    expect(btn.className).not.toMatch(/\brounded-md\b/);
  });

  it("default variant uses bg-primary (navy)", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bbg-primary\b/);
  });

  it("default size uses h-8", () => {
    const { container } = render(<Button>Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bh-8\b/);
  });

  it("sm size uses h-7", () => {
    const { container } = render(<Button size="sm">Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bh-7\b/);
  });

  it("lg size uses h-9", () => {
    const { container } = render(<Button size="lg">Click</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bh-9\b/);
  });

  it("icon size uses size-8", () => {
    const { container } = render(<Button size="icon">X</Button>);
    const btn = container.querySelector("[data-slot='button']")!;
    expect(btn.className).toMatch(/\bsize-8\b/);
  });

  it("preserves all variant names", () => {
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
  it("Card uses rounded-md, Elevation-1 shadow, gap-4, py-4", () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.querySelector("[data-slot='card']")!;
    expect(card.className).toMatch(/\brounded-md\b/);
    expect(card.className).not.toMatch(/\brounded-lg\b/);
    expect(card.className).toContain("shadow-[0_1px_2px_0_oklch(0_0_0/0.04)]");
    expect(card.className).not.toMatch(/\bshadow-xs\b/);
    expect(card.className).toMatch(/\bgap-4\b/);
    expect(card.className).toMatch(/\bpy-4\b/);
  });

  it("CardHeader uses gap-1.5, px-4", () => {
    const { container } = render(<Card><CardHeader>H</CardHeader></Card>);
    const header = container.querySelector("[data-slot='card-header']")!;
    expect(header.className).toMatch(/\bgap-1\.5\b/);
    expect(header.className).toMatch(/\bpx-4\b/);
    expect(header.className).not.toMatch(/\bpx-6\b/);
  });

  it("CardTitle includes text-sm font-semibold", () => {
    const { container } = render(<Card><CardHeader><CardTitle>T</CardTitle></CardHeader></Card>);
    const title = container.querySelector("[data-slot='card-title']")!;
    expect(title.className).toMatch(/\btext-sm\b/);
    expect(title.className).toMatch(/\bfont-semibold\b/);
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
  it("uses rounded-sm (Radius-sm = 4px)", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).toMatch(/\brounded-sm\b/);
    expect(input.className).not.toMatch(/\brounded-md\b/);
  });

  it("uses bg-input/30 for warm inset feel", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).toContain("bg-input/30");
  });

  it("uses h-8", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).toMatch(/\bh-8\b/);
  });

  it("uses focus-visible:ring-[2px]", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("[data-slot='input']")!;
    expect(input.className).toContain("focus-visible:ring-[2px]");
    expect(input.className).not.toContain("focus-visible:ring-[3px]");
  });
});

describe("Badge restyled", () => {
  it("uses rounded-sm (Radius-sm = 4px)", () => {
    const { container } = render(<Badge>Tag</Badge>);
    const badge = container.querySelector("[data-slot='badge']")!;
    expect(badge.className).toMatch(/\brounded-sm\b/);
    expect(badge.className).not.toMatch(/\brounded-full\b/);
  });

  it("success variant uses ledger-green colors", () => {
    const { container } = render(<Badge variant="success">Paid</Badge>);
    const badge = container.querySelector("[data-slot='badge']")!;
    expect(badge.className).toContain("bg-[oklch(0.95_0.03_155)]");
    expect(badge.className).toContain("text-[oklch(0.52_0.14_155)]");
  });

  it("destructive variant uses stamp-red tinted bg", () => {
    const { container } = render(<Badge variant="destructive">Overdue</Badge>);
    const badge = container.querySelector("[data-slot='badge']")!;
    expect(badge.className).toContain("bg-[oklch(0.95_0.03_25)]");
    expect(badge.className).toContain("text-[oklch(0.55_0.20_25)]");
  });

  it("warning variant uses amber colors", () => {
    const { container } = render(<Badge variant="warning">Due Soon</Badge>);
    const badge = container.querySelector("[data-slot='badge']")!;
    expect(badge.className).toContain("bg-[oklch(0.95_0.04_75)]");
    expect(badge.className).toContain("text-[oklch(0.65_0.16_75)]");
  });

  it("preserves existing variant names", () => {
    const variants = ["default", "secondary", "destructive", "success", "warning", "outline", "ghost", "link"] as const;
    for (const variant of variants) {
      const { container } = render(<Badge variant={variant}>V</Badge>);
      const badge = container.querySelector("[data-slot='badge']")!;
      expect(badge).toBeTruthy();
    }
  });
});

describe("Table restyled", () => {
  it("TableRow uses h-11 (44px ledger-line)", () => {
    const { container } = render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Cell</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
    const tr = container.querySelector("[data-slot='table-row']")!;
    expect(tr.className).toMatch(/\bh-11\b/);
  });

  it("TableHead uses h-11 and sticky positioning", () => {
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
    expect(th.className).toMatch(/\bh-11\b/);
    expect(th.className).not.toMatch(/\bh-8\b/);
    expect(th.className).toMatch(/\bsticky\b/);
    expect(th.className).toMatch(/\btop-0\b/);
    expect(th.className).toMatch(/\bbg-background\b/);
  });

  it("TableHead uses Heading-label typography (uppercase, tracking-wider)", () => {
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
    expect(th.className).toMatch(/\btext-xs\b/);
    expect(th.className).toMatch(/\buppercase\b/);
    expect(th.className).toMatch(/\btracking-wider\b/);
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
  });
});

describe("Skeleton restyled", () => {
  it("uses bg-muted for warm accent pulse", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("[data-slot='skeleton']")!;
    expect(skeleton.className).toMatch(/\bbg-muted\b/);
    expect(skeleton.className).not.toMatch(/\bbg-accent\b/);
  });

  it("uses animate-pulse and rounded-md", () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector("[data-slot='skeleton']")!;
    expect(skeleton.className).toMatch(/\banimate-pulse\b/);
    expect(skeleton.className).toMatch(/\brounded-md\b/);
  });
});

describe("Separator restyled", () => {
  it("uses bg-border for warm border color", async () => {
    // Separator requires radix-ui which uses "use client" directive
    // We import dynamically to avoid SSR issues in test
    const { Separator } = await import("@/components/ui/separator");
    const { container } = render(<Separator />);
    const sep = container.querySelector("[data-slot='separator']")!;
    expect(sep.className).toMatch(/\bbg-border\b/);
  });
});
