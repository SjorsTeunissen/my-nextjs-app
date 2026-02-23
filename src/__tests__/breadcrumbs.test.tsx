// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { Breadcrumbs } from "@/components/breadcrumbs";

describe("Breadcrumbs", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders breadcrumb items with links for parent items", () => {
    const { getByRole } = render(
      <Breadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
        ]}
      />
    );
    const link = getByRole("link", { name: "Invoices" });
    expect(link).toHaveAttribute("href", "/invoices");
  });

  it("renders last item as plain text (not a link)", () => {
    const { getByText } = render(
      <Breadcrumbs
        items={[
          { label: "Invoices", href: "/invoices" },
          { label: "INV-001" },
        ]}
      />
    );
    const currentPage = getByText("INV-001");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage.tagName).not.toBe("A");
  });

  it("renders single item as plain text without separator", () => {
    const { getByText, container } = render(
      <Breadcrumbs items={[{ label: "Dashboard" }]} />
    );
    expect(getByText("Dashboard")).toBeInTheDocument();
    const separators = container.querySelectorAll(
      '[data-slot="breadcrumb-separator"]'
    );
    expect(separators).toHaveLength(0);
  });

  it("renders separator between items", () => {
    const { container } = render(
      <Breadcrumbs
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
});
