// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];

const mockPush = vi.fn();

const mockGetInvoiceWithLineItems = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    invoice: null,
    lineItems: [],
  })
);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@/app/(app)/invoices/actions", () => ({
  getInvoiceWithLineItems: mockGetInvoiceWithLineItems,
}));

import { InvoiceDetailPanel } from "@/components/invoice-detail-panel";

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
    notes: "Payment within 30 days",
    created_at: "2026-01-15T10:00:00Z",
    created_by: "user-123",
    updated_at: null,
    ...overrides,
  };
}

function createLineItem(overrides: Partial<LineItem> = {}): LineItem {
  return {
    id: "li-1",
    invoice_id: "inv-1",
    description: "Web Development",
    quantity: 10,
    unit_price: 125,
    amount: 1250,
    sort_order: 0,
    created_at: "2026-01-15T10:00:00Z",
    ...overrides,
  };
}

describe("InvoiceDetailPanel", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render sheet content when no invoice is selected", () => {
    const { queryByTestId } = render(
      <InvoiceDetailPanel invoice={null} onClose={vi.fn()} />
    );

    expect(queryByTestId("invoice-detail-panel")).not.toBeInTheDocument();
  });

  it("renders sheet from right side when invoice is provided", async () => {
    const invoice = createInvoice();
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    const { findByTestId } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />
    );

    const panel = await findByTestId("invoice-detail-panel");
    expect(panel).toBeInTheDocument();
  });

  it("calls getInvoiceWithLineItems with invoice id on open", async () => {
    const invoice = createInvoice({ id: "inv-abc-123" });
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    render(<InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />);

    await waitFor(() => {
      expect(mockGetInvoiceWithLineItems).toHaveBeenCalledWith("inv-abc-123");
    });
  });

  it("displays invoice header with number, client name, dates, and total badge", async () => {
    const invoice = createInvoice({
      invoice_number: "INV-042",
      client_name: "Test Client Inc",
      issue_date: "2026-03-01",
      due_date: "2026-04-01",
      total: 2500,
    });
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    const { findByText, findByTestId } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />
    );

    expect(await findByText("INV-042")).toBeInTheDocument();
    expect(await findByText("Test Client Inc")).toBeInTheDocument();
    expect(await findByTestId("invoice-total-badge")).toBeInTheDocument();
  });

  it("displays client details section", async () => {
    const invoice = createInvoice({
      client_email: "test@example.com",
      client_phone: "+31 20 123 4567",
      client_address: "456 Oak Ave",
      client_city: "Rotterdam",
      client_postal_code: "3000 AB",
      client_country: "Netherlands",
    });
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    const { findByText } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />
    );

    expect(await findByText("test@example.com")).toBeInTheDocument();
    expect(await findByText("+31 20 123 4567")).toBeInTheDocument();
    expect(await findByText(/456 Oak Ave/)).toBeInTheDocument();
  });

  it("renders line items in a compact table", async () => {
    const invoice = createInvoice();
    const lineItems: LineItem[] = [
      createLineItem({
        id: "li-1",
        description: "Design Services",
        quantity: 5,
        unit_price: 100,
        amount: 500,
        sort_order: 0,
      }),
      createLineItem({
        id: "li-2",
        description: "Development Services",
        quantity: 10,
        unit_price: 150,
        amount: 1500,
        sort_order: 1,
      }),
    ];
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems,
    });

    const { findByText } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />
    );

    expect(await findByText("Design Services")).toBeInTheDocument();
    expect(await findByText("Development Services")).toBeInTheDocument();
  });

  it("displays notes section when invoice has notes", async () => {
    const invoice = createInvoice({ notes: "Please pay promptly" });
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    const { findByText } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />
    );

    expect(await findByText("Please pay promptly")).toBeInTheDocument();
  });

  it("navigates to edit page when Edit button is clicked", async () => {
    const invoice = createInvoice({ id: "inv-edit-test" });
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    const { findByText } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={vi.fn()} />
    );

    const editButton = await findByText("Edit");
    fireEvent.click(editButton);

    expect(mockPush).toHaveBeenCalledWith("/invoices/inv-edit-test");
  });

  it("calls onClose when close button is clicked", async () => {
    const invoice = createInvoice();
    const onClose = vi.fn();
    mockGetInvoiceWithLineItems.mockResolvedValue({
      invoice,
      lineItems: [],
    });

    const { findByLabelText } = render(
      <InvoiceDetailPanel invoice={invoice} onClose={onClose} />
    );

    const closeButton = await findByLabelText("Close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
  });
});
