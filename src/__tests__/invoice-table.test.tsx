// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import type { Database } from "@/lib/types/database";

const { mockRefresh, mockBulkDelete, mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockRefresh: vi.fn(),
  mockBulkDelete: vi.fn().mockResolvedValue({ success: true }),
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

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

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

vi.mock("@/app/(app)/invoices/actions", () => ({
  quickUpdateInvoice: vi.fn().mockResolvedValue({ success: true }),
  bulkDeleteInvoices: mockBulkDelete,
}));

vi.mock("sonner", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
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

  it("renders empty state with icon, descriptive text, and CTA link", () => {
    const { getByText, container } = render(
      <InvoiceTable invoices={[]} />
    );

    expect(
      getByText("No invoices yet. Create your first invoice to get started.")
    ).toBeInTheDocument();

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();

    const ctaLink = getByText("Create Invoice").closest("a");
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink).toHaveAttribute("href", "/invoices/new");

    const table = container.querySelector("table");
    expect(table).not.toBeInTheDocument();
  });

  it("renders table with 3 rows and column headers including checkbox", () => {
    const invoices = [
      createInvoice({ id: "inv-1", invoice_number: "INV-001", client_name: "Acme Corp" }),
      createInvoice({ id: "inv-2", invoice_number: "INV-002", client_name: "Beta Inc" }),
      createInvoice({ id: "inv-3", invoice_number: "INV-003", client_name: "Gamma LLC" }),
    ];

    const { getByText, container } = render(
      <InvoiceTable invoices={invoices} />
    );

    expect(getByText("Invoice #")).toBeInTheDocument();
    expect(getByText("Client Name")).toBeInTheDocument();
    expect(getByText("Issue Date")).toBeInTheDocument();
    expect(getByText("Due Date")).toBeInTheDocument();
    expect(getByText("Total")).toBeInTheDocument();

    const rows = container.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(3);
  });

  it("formats total as EUR currency", () => {
    const { getByText } = render(
      <InvoiceTable invoices={[createInvoice({ total: 1500 })]} />
    );

    expect(getByText("€ 1.500,00")).toBeInTheDocument();
  });

  it("calls onRowSelect callback on row click", () => {
    const onRowSelect = vi.fn();
    const invoice = createInvoice({ id: "inv-abc-123" });

    const { container } = render(
      <InvoiceTable invoices={[invoice]} onRowSelect={onRowSelect} />
    );

    const row = container.querySelector("tbody tr");
    expect(row).toBeInTheDocument();
    fireEvent.click(row!);

    expect(onRowSelect).toHaveBeenCalledWith(invoice);
  });

  it("renders hover action buttons for quick-edit and view", () => {
    const { getByLabelText } = render(
      <InvoiceTable invoices={[createInvoice()]} />
    );

    expect(getByLabelText("Quick edit")).toBeInTheDocument();
    expect(getByLabelText("View invoice")).toBeInTheDocument();
  });

  it("sorts by client name ascending on column header click", () => {
    const invoices = [
      createInvoice({ id: "inv-1", client_name: "Gamma LLC" }),
      createInvoice({ id: "inv-2", client_name: "Acme Corp" }),
      createInvoice({ id: "inv-3", client_name: "Beta Inc" }),
    ];

    const { getByText, container } = render(
      <InvoiceTable invoices={invoices} />
    );

    fireEvent.click(getByText("Client Name"));

    const rows = container.querySelectorAll("tbody tr");
    const firstRowText = rows[0]?.textContent ?? "";
    const lastRowText = rows[2]?.textContent ?? "";

    expect(firstRowText).toContain("Acme Corp");
    expect(lastRowText).toContain("Gamma LLC");
  });

  it("sorts descending on second click of column header", () => {
    const invoices = [
      createInvoice({ id: "inv-1", client_name: "Gamma LLC" }),
      createInvoice({ id: "inv-2", client_name: "Acme Corp" }),
      createInvoice({ id: "inv-3", client_name: "Beta Inc" }),
    ];

    const { getByText, container } = render(
      <InvoiceTable invoices={invoices} />
    );

    fireEvent.click(getByText("Client Name"));
    fireEvent.click(getByText("Client Name"));

    const rows = container.querySelectorAll("tbody tr");
    const firstRowText = rows[0]?.textContent ?? "";
    const lastRowText = rows[2]?.textContent ?? "";

    expect(firstRowText).toContain("Gamma LLC");
    expect(lastRowText).toContain("Acme Corp");
  });

  it("shows select-all checkbox and bulk actions toolbar when all selected", () => {
    const invoices = [
      createInvoice({ id: "inv-1" }),
      createInvoice({ id: "inv-2" }),
    ];

    const { container, getByText } = render(
      <InvoiceTable invoices={invoices} />
    );

    const selectAllCheckbox = container.querySelector("thead [role=checkbox]");
    expect(selectAllCheckbox).toBeInTheDocument();
    fireEvent.click(selectAllCheckbox!);

    expect(getByText("Delete selected")).toBeInTheDocument();
    expect(getByText("Export CSV")).toBeInTheDocument();
  });

  it("calls bulkDeleteInvoices with selected invoice IDs on delete", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const invoices = [
      createInvoice({ id: "inv-1" }),
      createInvoice({ id: "inv-2" }),
      createInvoice({ id: "inv-3" }),
    ];

    const { container, getByText } = render(
      <InvoiceTable invoices={invoices} />
    );

    const checkboxes = container.querySelectorAll("tbody [role=checkbox]");
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(checkboxes[1]!);

    fireEvent.click(getByText("Delete selected"));

    expect(mockBulkDelete).toHaveBeenCalledWith(
      expect.arrayContaining(["inv-1", "inv-2"])
    );
  });

  it("shows toast.success on bulk delete success", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockBulkDelete.mockResolvedValueOnce({ success: true });

    const invoices = [
      createInvoice({ id: "inv-1" }),
      createInvoice({ id: "inv-2" }),
    ];

    const { container, getByText } = render(
      <InvoiceTable invoices={invoices} />
    );

    const selectAllCheckbox = container.querySelector("thead [role=checkbox]");
    fireEvent.click(selectAllCheckbox!);
    fireEvent.click(getByText("Delete selected"));

    await waitFor(() => {
      expect(mockToastSuccess).toHaveBeenCalledWith("2 invoices deleted");
    });
  });

  it("shows toast.error on bulk delete error", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    mockBulkDelete.mockResolvedValueOnce({ error: "Something went wrong" });

    const invoices = [
      createInvoice({ id: "inv-1" }),
    ];

    const { container, getByText } = render(
      <InvoiceTable invoices={invoices} />
    );

    const checkboxes = container.querySelectorAll("tbody [role=checkbox]");
    fireEvent.click(checkboxes[0]!);
    fireEvent.click(getByText("Delete selected"));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Failed to delete invoices");
    });
  });

  it("triggers CSV export when Export CSV is clicked", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:url");
    global.URL.createObjectURL = createObjectURL;

    const invoices = [
      createInvoice({ id: "inv-1", invoice_number: "INV-001", client_name: "Acme Corp", total: 1500 }),
      createInvoice({ id: "inv-2", invoice_number: "INV-002", client_name: "Beta Inc", total: 2000 }),
    ];

    const { container, getByText } = render(
      <InvoiceTable invoices={invoices} />
    );

    const selectAllCheckbox = container.querySelector("thead [role=checkbox]");
    fireEvent.click(selectAllCheckbox!);

    fireEvent.click(getByText("Export CSV"));

    expect(createObjectURL).toHaveBeenCalled();
  });

  it("rows have group/row class for hover action visibility", () => {
    const { container } = render(
      <InvoiceTable invoices={[createInvoice()]} />
    );

    const row = container.querySelector("tbody tr");
    expect(row?.className).toContain("group/row");
  });
});
