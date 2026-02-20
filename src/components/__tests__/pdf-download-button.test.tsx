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
      React.createElement("div", null, children),
    Page: ({ children }: React.PropsWithChildren) =>
      React.createElement("div", null, children),
    View: ({ children }: React.PropsWithChildren) =>
      React.createElement("div", null, children),
    Text: ({ children }: React.PropsWithChildren) =>
      React.createElement("span", null, children),
    Image: ({ src }: { src: string }) =>
      React.createElement("img", { src }),
    StyleSheet: {
      create: <T extends Record<string, Record<string, unknown>>>(
        styles: T
      ): T => styles,
    },
    PDFDownloadLink: ({
      fileName,
      children,
    }: {
      document: React.ReactNode;
      fileName: string;
      children: (props: { loading: boolean }) => React.ReactNode;
    }) =>
      React.createElement(
        "a",
        { "data-testid": "pdf-download-link", "data-filename": fileName },
        children({ loading: false })
      ),
  };
});

// Mock lucide-react icons
vi.mock("lucide-react", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const React = require("react");
  return {
    Download: (props: Record<string, unknown>) =>
      React.createElement("svg", {
        "data-testid": "download-icon",
        ...props,
      }),
  };
});

import { render, screen } from "@testing-library/react";
import { PdfDownloadButton } from "@/components/pdf-download-button";
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

describe("PdfDownloadButton", () => {
  it("renders a download button", () => {
    render(
      <PdfDownloadButton
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    expect(screen.getByText("Download PDF")).toBeDefined();
  });

  it("uses the correct filename based on invoice number", () => {
    render(
      <PdfDownloadButton
        invoice={mockInvoice}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    const link = screen.getByTestId("pdf-download-link");
    expect(link.getAttribute("data-filename")).toBe("invoice-INV-001.pdf");
  });

  it("generates correct filename for different invoice numbers", () => {
    const invoice2 = { ...mockInvoice, invoice_number: "INV-042" };
    render(
      <PdfDownloadButton
        invoice={invoice2}
        lineItems={mockLineItems}
        companySettings={mockCompanySettings}
      />
    );
    const link = screen.getByTestId("pdf-download-link");
    expect(link.getAttribute("data-filename")).toBe("invoice-INV-042.pdf");
  });
});
