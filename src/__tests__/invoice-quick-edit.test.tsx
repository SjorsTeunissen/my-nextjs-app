// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Database } from "@/lib/types/database";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

const mockQuickUpdate = vi.fn().mockResolvedValue({ success: true });

vi.mock("@/app/(app)/invoices/actions", () => ({
  quickUpdateInvoice: (...args: unknown[]) => mockQuickUpdate(...args),
}));

import { InvoiceQuickEdit } from "@/components/invoice-quick-edit";

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

describe("InvoiceQuickEdit", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the quick edit trigger button", () => {
    const { getByLabelText } = render(
      <InvoiceQuickEdit invoice={createInvoice()} />
    );

    expect(getByLabelText("Quick edit")).toBeInTheDocument();
  });

  it("opens popover with form fields when trigger is clicked", async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText } = render(
      <InvoiceQuickEdit invoice={createInvoice()} />
    );

    await user.click(getByLabelText("Quick edit"));

    expect(getByText("Quick Edit")).toBeInTheDocument();
    expect(getByLabelText("Client Name")).toBeInTheDocument();
    expect(getByLabelText("Issue Date")).toBeInTheDocument();
    expect(getByLabelText("Due Date")).toBeInTheDocument();
    expect(getByLabelText("Total")).toBeInTheDocument();
    expect(getByText("Save")).toBeInTheDocument();
  });

  it("populates fields with current invoice values", async () => {
    const user = userEvent.setup();
    const invoice = createInvoice({
      client_name: "Test Client",
      issue_date: "2026-03-01",
      due_date: "2026-04-01",
      total: 999.99,
    });

    const { getByLabelText } = render(
      <InvoiceQuickEdit invoice={invoice} />
    );

    await user.click(getByLabelText("Quick edit"));

    expect(getByLabelText("Client Name")).toHaveValue("Test Client");
    expect(getByLabelText("Issue Date")).toHaveValue("2026-03-01");
    expect(getByLabelText("Due Date")).toHaveValue("2026-04-01");
    expect(getByLabelText("Total")).toHaveValue(999.99);
  });

  it("allows editing field values", async () => {
    const user = userEvent.setup();
    const { getByLabelText } = render(
      <InvoiceQuickEdit invoice={createInvoice()} />
    );

    await user.click(getByLabelText("Quick edit"));

    const clientInput = getByLabelText("Client Name");
    await user.clear(clientInput);
    await user.type(clientInput, "New Client");

    expect(clientInput).toHaveValue("New Client");
  });

  it("calls quickUpdateInvoice on save with updated values", async () => {
    const user = userEvent.setup();
    const invoice = createInvoice({ id: "inv-save-test" });
    const { getByLabelText, getByText } = render(
      <InvoiceQuickEdit invoice={invoice} />
    );

    await user.click(getByLabelText("Quick edit"));

    const clientInput = getByLabelText("Client Name");
    await user.clear(clientInput);
    await user.type(clientInput, "Updated Corp");

    await user.click(getByText("Save"));

    await waitFor(() => {
      expect(mockQuickUpdate).toHaveBeenCalledWith("inv-save-test", {
        client_name: "Updated Corp",
        issue_date: "2026-01-15",
        due_date: "2026-02-15",
        total: 1512.5,
      });
    });
  });

  it("closes popover after successful save", async () => {
    const user = userEvent.setup();
    const { getByLabelText, getByText, queryByText } = render(
      <InvoiceQuickEdit invoice={createInvoice()} />
    );

    await user.click(getByLabelText("Quick edit"));
    expect(getByText("Quick Edit")).toBeInTheDocument();

    await user.click(getByText("Save"));

    await waitFor(() => {
      expect(queryByText("Quick Edit")).not.toBeInTheDocument();
    });
  });
});
