// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { AppBreadcrumbs } from "@/components/breadcrumbs";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("AppBreadcrumbs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders breadcrumb items with correct labels", () => {
    const { getByText } = render(
      <AppBreadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
        ]}
      />
    );
    expect(getByText("Invoices")).toBeInTheDocument();
    expect(getByText("INV-001")).toBeInTheDocument();
  });

  it("renders parent items as links with correct href", () => {
    const { getByText } = render(
      <AppBreadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
        ]}
      />
    );
    const link = getByText("Invoices").closest("a");
    expect(link).toHaveAttribute("href", "/invoices");
  });

  it("renders current (last) item as plain text, not a link", () => {
    const { getByText } = render(
      <AppBreadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
        ]}
      />
    );
    const currentItem = getByText("INV-001");
    expect(currentItem.closest("a")).toBeNull();
    expect(currentItem).toHaveAttribute("aria-current", "page");
  });

  it("renders separator between items", () => {
    const { container } = render(
      <AppBreadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
        ]}
      />
    );
    const separators = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"]'
    );
    expect(separators).toHaveLength(1);
  });

  it("renders single item without separator", () => {
    const { container } = render(
      <AppBreadcrumbs items={[{ label: "Dashboard" }]} />
    );
    const separators = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"]'
    );
    expect(separators).toHaveLength(0);
  });

  it("renders with nav element with aria-label breadcrumb", () => {
    const { container } = render(
      <AppBreadcrumbs items={[{ label: "Dashboard" }]} />
    );
    const nav = container.querySelector('nav[aria-label="breadcrumb"]');
    expect(nav).toBeInTheDocument();
  });
});
