// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import type { Database } from "@/lib/types/database";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

// Mock next/link
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

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

// Mock the quick update action
vi.mock("@/app/(app)/invoices/actions", () => ({
  quickUpdateInvoice: vi.fn().mockResolvedValue({ success: true }),
}));

import { InvoiceTable } from "@/components/invoice-table";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

function createInvoice(overrides: Partial<Invoice> = {}): Invoice {
  return {
    id: "inv-1",
    invoice_number: "INV-001",
    client_name: "Acme Corp",
    client_address: "123 Main St",
    client_city: "Amsterdam",
    client_country: "Netherlands",
    client_email: "acme@example.com",
    client_phone: "+31 20 555 0100",
    client_postal_code: "1000 AA",
    client_vat_number: "NL123456789B01",
    issue_date: "2026-01-15",
    due_date: "2026-02-15",
    subtotal: 1250,
    tax_rate: 21,
    tax_amount: 262.5,
    total: 1512.5,
    notes: null,
    created_at: "2026-01-15T10:00:00Z",
    created_by: "user-123",
    updated_at: null,
    ...overrides,
  };
}

describe("InvoiceTable", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty state with icon and descriptive text when no invoices", () => {
    const { getByText, container } = render(
      <InvoiceTable invoices={[]} />
    );

    expect(
      getByText("No invoices yet. Create your first invoice to get started.")
    ).toBeInTheDocument();

    // Should render FileText icon (svg)
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    // Table should not be rendered
    const table = container.querySelector("table");
    expect(table).not.toBeInTheDocument();
  });

  it("renders table with 3 rows and 5 column headers plus actions column", () => {
    const invoices = [
      createInvoice({ id: "inv-1", invoice_number: "INV-001", client_name: "Acme Corp" }),
      createInvoice({ id: "inv-2", invoice_number: "INV-002", client_name: "Beta Inc" }),
      createInvoice({ id: "inv-3", invoice_number: "INV-003", client_name: "Gamma LLC" }),
    ];

    const { getByText, container } = render(
      <InvoiceTable invoices={invoices} />
    );

    // Check 5 visible column headers
    expect(getByText("Invoice #")).toBeInTheDocument();
    expect(getByText("Client Name")).toBeInTheDocument();
    expect(getByText("Issue Date")).toBeInTheDocument();
    expect(getByText("Due Date")).toBeInTheDocument();
    expect(getByText("Total")).toBeInTheDocument();

    // Check 3 data rows
    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(3);
  });

  it("formats total as EUR currency", () => {
    const { getByText } = render(
      <InvoiceTable
        invoices={[createInvoice({ total: 1500 })]}
      />
    );

    expect(getByText("€ 1.500,00")).toBeInTheDocument();
  });

  it("navigates to invoice detail page on row click via router.push", () => {
    const { container } = render(
      <InvoiceTable
        invoices={[createInvoice({ id: "inv-abc-123" })]}
      />
    );

    const row = container.querySelector("tbody tr");
    expect(row).toBeInTheDocument();
    fireEvent.click(row!);

    expect(mockPush).toHaveBeenCalledWith("/invoices/inv-abc-123");
  });

  it("renders hover action buttons for quick-edit and view", () => {
    const { getByLabelText } = render(
      <InvoiceTable invoices={[createInvoice()]} />
    );

    expect(getByLabelText("Quick edit")).toBeInTheDocument();
    expect(getByLabelText("View invoice")).toBeInTheDocument();
  });

  it("view invoice link points to correct detail page", () => {
    const { getByLabelText } = render(
      <InvoiceTable
        invoices={[createInvoice({ id: "inv-view-test" })]}
      />
    );

    const viewLink = getByLabelText("View invoice").closest("a");
    expect(viewLink).toHaveAttribute("href", "/invoices/inv-view-test");
  });

  it("formats dates with nl-NL locale", () => {
    const { getByText } = render(
      <InvoiceTable
        invoices={[
          createInvoice({
            issue_date: "2026-01-15",
            due_date: "2026-02-15",
          }),
        ]}
      />
    );

    expect(getByText("15-1-2026")).toBeInTheDocument();
    expect(getByText("15-2-2026")).toBeInTheDocument();
  });

  it("rows have group/row class for hover action visibility", () => {
    const { container } = render(
      <InvoiceTable invoices={[createInvoice()]} />
    );

    const row = container.querySelector("tbody tr");
    expect(row?.className).toContain("group/row");
  });
});
