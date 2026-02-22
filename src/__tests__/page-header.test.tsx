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
});
