// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup } from "@testing-library/react";
import type { Database } from "@/lib/types/database";

// Mock server actions
vi.mock("@/app/(app)/invoices/actions", () => ({
  createInvoice: vi.fn(),
  updateInvoice: vi.fn(),
}));

import { InvoiceForm } from "@/components/invoice-form";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];

function createInvoiceData(overrides: Partial<Invoice> = {}): Invoice {
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
    issue_date: "2026-02-20",
    due_date: "2026-03-20",
    subtotal: 1000,
    tax_rate: 21,
    tax_amount: 210,
    total: 1210,
    notes: null,
    created_at: "2026-02-20T10:00:00Z",
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
    unit_price: 100,
    amount: 1000,
    sort_order: 0,
    created_at: "2026-02-20T10:00:00Z",
    ...overrides,
  };
}

afterEach(() => {
  cleanup();
});

describe("InvoiceForm", () => {
  it("renders 'New Invoice' title when creating", () => {
    const { getByText } = render(
      <InvoiceForm defaultInvoiceNumber="INV-001" defaultTaxRate={21} />
    );

    expect(getByText("New Invoice")).toBeInTheDocument();
  });

  it("renders 'Edit Invoice' title when editing", () => {
    const { getByText } = render(
      <InvoiceForm
        invoice={createInvoiceData()}
        lineItems={[createLineItem()]}
        defaultInvoiceNumber="INV-001"
        defaultTaxRate={21}
      />
    );

    expect(getByText("Edit Invoice")).toBeInTheDocument();
  });

  it("pre-fills invoice number from defaultInvoiceNumber", () => {
    const { getByDisplayValue } = render(
      <InvoiceForm defaultInvoiceNumber="INV-005" defaultTaxRate={21} />
    );

    expect(getByDisplayValue("INV-005")).toBeInTheDocument();
  });

  it("pre-fills tax rate from defaultTaxRate", () => {
    const { getByDisplayValue } = render(
      <InvoiceForm defaultInvoiceNumber="INV-001" defaultTaxRate={21} />
    );

    expect(getByDisplayValue("21")).toBeInTheDocument();
  });

  it("pre-fills form fields when editing an existing invoice", () => {
    const { getByDisplayValue } = render(
      <InvoiceForm
        invoice={createInvoiceData({
          client_name: "Client A",
          invoice_number: "INV-003",
        })}
        lineItems={[createLineItem()]}
        defaultInvoiceNumber="INV-003"
        defaultTaxRate={21}
      />
    );

    expect(getByDisplayValue("Client A")).toBeInTheDocument();
    expect(getByDisplayValue("INV-003")).toBeInTheDocument();
  });

  it("pre-fills line items when editing", () => {
    const { getByDisplayValue } = render(
      <InvoiceForm
        invoice={createInvoiceData()}
        lineItems={[
          createLineItem({
            description: "Web Development",
            quantity: 10,
            unit_price: 100,
          }),
        ]}
        defaultInvoiceNumber="INV-001"
        defaultTaxRate={21}
      />
    );

    expect(getByDisplayValue("Web Development")).toBeInTheDocument();
  });

  it("renders all client detail fields", () => {
    const { getByLabelText } = render(
      <InvoiceForm defaultInvoiceNumber="INV-001" defaultTaxRate={21} />
    );

    expect(getByLabelText("Client Name")).toBeInTheDocument();
    expect(getByLabelText("Address")).toBeInTheDocument();
    expect(getByLabelText("City")).toBeInTheDocument();
    expect(getByLabelText("Postal Code")).toBeInTheDocument();
    expect(getByLabelText("Country")).toBeInTheDocument();
    expect(getByLabelText("Email")).toBeInTheDocument();
    expect(getByLabelText("Phone")).toBeInTheDocument();
    expect(getByLabelText("VAT Number")).toBeInTheDocument();
  });

  it("renders invoice detail fields", () => {
    const { getByLabelText } = render(
      <InvoiceForm defaultInvoiceNumber="INV-001" defaultTaxRate={21} />
    );

    expect(getByLabelText("Invoice Number")).toBeInTheDocument();
    expect(getByLabelText("Issue Date")).toBeInTheDocument();
    expect(getByLabelText("Due Date")).toBeInTheDocument();
    expect(getByLabelText("Tax Rate (%)")).toBeInTheDocument();
  });

  it("renders Save button", () => {
    const { getByText } = render(
      <InvoiceForm defaultInvoiceNumber="INV-001" defaultTaxRate={21} />
    );

    expect(getByText("Save")).toBeInTheDocument();
  });

  it("starts with one empty line item when creating", () => {
    const { getAllByLabelText } = render(
      <InvoiceForm defaultInvoiceNumber="INV-001" defaultTaxRate={21} />
    );

    // Should have one Description input
    const descriptionInputs = getAllByLabelText("Description");
    expect(descriptionInputs).toHaveLength(1);
  });
});
