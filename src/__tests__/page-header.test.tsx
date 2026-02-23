// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import { PageHeader } from "@/components/page-header";

describe("PageHeader", () => {
  afterEach(() => { cleanup(); });

  it("renders the title text", () => {
    const { getByText } = render(<PageHeader title="Invoices" />);
    expect(getByText("Invoices")).toBeInTheDocument();
  });

  it("renders title as a heading element", () => {
    const { getByRole } = render(<PageHeader title="Settings" />);
    const heading = getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Settings");
  });

  it("renders action buttons when provided", () => {
    const { getByText } = render(
      <PageHeader title="Invoices" actions={<button>New Invoice</button>} />
    );
    expect(getByText("New Invoice")).toBeInTheDocument();
  });

  it("renders without action buttons when none provided", () => {
    const { container } = render(<PageHeader title="Invoices" />);
    const header = container.querySelector("header");
    expect(header).toBeInTheDocument();
    // Should not have an actions container when no actions provided
    expect(header?.querySelectorAll("button")).toHaveLength(0);
  });

  it("renders breadcrumbs when provided", () => {
    const { getByText } = render(
      <PageHeader
        title="Invoice Detail"
        breadcrumbs={<nav>breadcrumb nav</nav>}
      />
    );
    expect(getByText("breadcrumb nav")).toBeInTheDocument();
  });

  it("does not render breadcrumb container when breadcrumbs not provided", () => {
    const { container } = render(<PageHeader title="Invoices" />);
    const header = container.querySelector("header");
    // Header should only contain the title row, not an extra breadcrumb wrapper
    expect(header?.children).toHaveLength(1);
  });

  it("applies Heading-page typography to title", () => {
    const { getByRole } = render(<PageHeader title="Invoices" />);
    const heading = getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-lg", "font-semibold", "tracking-tight");
  });
});
