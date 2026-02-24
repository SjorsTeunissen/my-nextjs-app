/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Breadcrumbs } from "../breadcrumbs";

afterEach(() => {
  cleanup();
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => <a href={href}>{children}</a>,
}));

describe("Breadcrumbs", () => {
  it("renders all items with separators", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Invoices", href: "/invoices" },
          { label: "Edit" },
        ]}
      />
    );

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Invoices")).toBeInTheDocument();
    expect(screen.getByText("Edit")).toBeInTheDocument();
  });

  it("renders items with href as links", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Current" },
        ]}
      />
    );

    const homeLink = screen.getByText("Home").closest("a");
    expect(homeLink).toHaveAttribute("href", "/");
  });

  it("renders non-last items without href as plain text, not links", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
          { label: "Edit" },
        ]}
      />
    );

    // Middle item without href should render as BreadcrumbPage (span), not a link
    const middleItem = screen.getByText("INV-001");
    expect(middleItem.closest("a")).toBeNull();
    expect(middleItem.tagName).toBe("SPAN");

    // First item with href should be a link
    const firstItem = screen.getByText("Invoices");
    expect(firstItem.closest("a")).toHaveAttribute("href", "/invoices");

    // Last item should also be plain text
    const lastItem = screen.getByText("Edit");
    expect(lastItem.closest("a")).toBeNull();
    expect(lastItem.tagName).toBe("SPAN");
  });

  it("renders a single item as the current page", () => {
    render(<Breadcrumbs items={[{ label: "Dashboard" }]} />);

    const item = screen.getByText("Dashboard");
    expect(item.tagName).toBe("SPAN");
    expect(item).toHaveAttribute("aria-current", "page");
  });
});
