/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// Mock @react-pdf/renderer with lowercase HTML elements for jsdom
vi.mock("@react-pdf/renderer", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    Document: ({ children }: React.PropsWithChildren) =>
      React.createElement("div", { "data-testid": "pdf-document" }, children),
    Page: ({ children }: React.PropsWithChildren) =>
      React.createElement("div", { "data-testid": "pdf-page" }, children),
    View: ({ children }: React.PropsWithChildren) =>
      React.createElement("div", null, children),
    Text: ({ children }: React.PropsWithChildren) =>
      React.createElement("span", null, children),
    Image: ({ src }: { src: string }) =>
      React.createElement("img", { src, "data-testid": "pdf-image" }),
    StyleSheet: {
      create: <T extends Record<string, Record<string, unknown>>>(styles: T): T => styles,
    },
  };
});

import { render, screen } from "@testing-library/react";
import { InvoicePdf } from "@/components/invoice-pdf";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];
type CompanySettings = Database["public"]["Tables"]["company_settings"]["Row"];

const mockInvoice: Invoice = {
  id: "inv-1",
  invoice_number: "INV-001",
  issue_date: "2026-01-15",
  due_date: "2026-02-15",
  client_name: "Acme Corp",
  client_address: "123 Main St",
  client_city: "Amsterdam",
  client_postal_code: "1012 AB",
  client_country: "Netherlands",
  client_email: "info@acme.com",
  client_phone: "+31 20 1234567",
  client_vat_number: "NL123456789B01",
  subtotal: 1000,
  tax_rate: 21,
  tax_amount: 210,
  total: 1210,
  notes: null,
  created_at: "2026-01-15T00:00:00Z",
  created_by: "user-1",
  updated_at: null,
};

const mockLineItems: LineItem[] = [
  {
    id: "li-1",
    invoice_id: "inv-1",
    description: "Web Development",
    quantity: 10,
    unit_price: 100,
    amount: 1000,
    sort_order: 0,
    created_at: "2026-01-15T00:00:00Z",
  },
];

const mockCompanySettings: CompanySettings = {
  id: "cs-1",
  company_name: "SerionTech",
  address_line1: "Tech Park 1",
  address_line2: null,
  city: "Rotterdam",
  postal_code: "3000 AA",
  country: "Netherlands",
  email: "info@seriontech.com",
  phone: "+31 10 9876543",
  vat_number: "NL987654321B01",
  bank_name: "ING Bank",
  bank_iban: "NL12INGB0001234567",
  bank_bic: "INGBNL2A",
  logo_url: "https://example.com/logo.png",
  default_tax_rate: 21,
  updated_at: null,
  updated_by: null,
};

describe("InvoicePdf", () => {
  it("renders the company name", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("SerionTech")).toBeDefined();
  });

  it("renders the company address", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("Tech Park 1")).toBeDefined();
    expect(screen.getByText("3000 AA Rotterdam")).toBeDefined();
  });

  it("renders the client name and address", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("Acme Corp")).toBeDefined();
    expect(screen.getByText("123 Main St")).toBeDefined();
    expect(screen.getByText("1012 AB Amsterdam")).toBeDefined();
  });

  it("renders invoice metadata", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("INV-001")).toBeDefined();
    expect(screen.getByText("2026-01-15")).toBeDefined();
    expect(screen.getByText("2026-02-15")).toBeDefined();
  });

  it("renders line items table with description, qty, unit price, amount", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("Web Development")).toBeDefined();
    expect(screen.getByText("10")).toBeDefined();
  });

  it("renders subtotal, tax, and total", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    // formatCurrency uses nl-NL EUR formatting: "€ 1.000,00"
    // Subtotal and line item amount both show € 1.000,00 so use getAllByText
    const subtotalMatches = screen.getAllByText(/1\.000,00/);
    expect(subtotalMatches.length).toBeGreaterThanOrEqual(2); // line item amount + subtotal
    expect(screen.getByText(/€\s*210,00/)).toBeDefined();
    expect(screen.getByText(/€\s*1\.210,00/)).toBeDefined();
  });

  it("renders bank details", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("ING Bank")).toBeDefined();
    expect(screen.getByText("NL12INGB0001234567")).toBeDefined();
    expect(screen.getByText("INGBNL2A")).toBeDefined();
  });

  it("renders logo image when logo_url is set", () => {
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    const images = screen.getAllByTestId("pdf-image");
    expect(images.length).toBeGreaterThan(0);
    expect(images[0].getAttribute("src")).toBe("https://example.com/logo.png");
  });

  it("does not render logo image when logo_url is null", () => {
    const settingsWithoutLogo = { ...mockCompanySettings, logo_url: null };
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={settingsWithoutLogo}
      />
    );
    const images = screen.queryAllByTestId("pdf-image");
    expect(images.length).toBe(0);
  });

  it("renders multiple line items", () => {
    const multipleItems: LineItem[] = [
      ...mockLineItems,
      {
        id: "li-2",
        invoice_id: "inv-1",
        description: "Design Work",
        quantity: 5,
        unit_price: 80,
        amount: 400,
        sort_order: 1,
        created_at: "2026-01-15T00:00:00Z",
      },
    ];
    render(
      <InvoicePdf
        invoice={mockInvoice}
        lineItems={multipleItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("Web Development")).toBeDefined();
    expect(screen.getByText("Design Work")).toBeDefined();
  });
});
