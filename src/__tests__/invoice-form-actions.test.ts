import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockGetUser = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn((table: string) => {
      if (table === "invoices") {
        return {
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      if (table === "invoice_line_items") {
        return {
          insert: mockInsert,
          delete: mockDelete,
        };
      }
      return {};
    }),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

const sampleFormData = {
  invoice_number: "INV-001",
  issue_date: "2026-02-20",
  due_date: "2026-03-20",
  tax_rate: 21,
  client_name: "Acme Corp",
  client_address: "123 Main St",
  client_city: "Amsterdam",
  client_postal_code: "1000 AA",
  client_country: "Netherlands",
  client_email: "acme@example.com",
  client_phone: "+31 20 555 0100",
  client_vat_number: "NL123456789B01",
  line_items: [
    { description: "Web Development", quantity: 10, unit_price: 100, sort_order: 0 },
    { description: "Design", quantity: 5, unit_price: 80, sort_order: 1 },
  ],
};

describe("createInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
  });

  it("returns error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { createInvoice } = await import("@/app/(app)/invoices/actions");
    const result = await createInvoice(sampleFormData);

    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("inserts invoice with calculated totals", async () => {
    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { id: "new-invoice-id" },
      error: null,
    });

    const { createInvoice } = await import("@/app/(app)/invoices/actions");

    try {
      await createInvoice(sampleFormData);
    } catch {
      // redirect throws
    }

    // subtotal: (10*100) + (5*80) = 1400
    // taxAmount: 1400 * 0.21 = 294
    // total: 1400 + 294 = 1694
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_number: "INV-001",
        subtotal: 1400,
        tax_amount: 294,
        total: 1694,
        created_by: "user-123",
      })
    );
  });

  it("returns error when invoice insert fails", async () => {
    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: "Insert failed" },
    });

    const { createInvoice } = await import("@/app/(app)/invoices/actions");
    const result = await createInvoice(sampleFormData);

    expect(result).toEqual({ error: "Insert failed" });
  });

  it("calls revalidatePath and redirect after successful create", async () => {
    mockInsert.mockReturnValue({
      select: mockSelect,
    });
    mockSelect.mockReturnValue({
      single: mockSingle,
    });
    mockSingle.mockResolvedValue({
      data: { id: "new-invoice-id" },
      error: null,
    });

    // For line items insert: return success
    mockInsert.mockReturnValueOnce({
      select: mockSelect,
    });

    const { createInvoice } = await import("@/app/(app)/invoices/actions");
    const { revalidatePath } = await import("next/cache");
    const { redirect } = await import("next/navigation");

    try {
      await createInvoice(sampleFormData);
    } catch {
      // redirect may throw
    }

    expect(revalidatePath).toHaveBeenCalledWith("/invoices");
    expect(redirect).toHaveBeenCalledWith("/invoices");
  });
});

describe("updateInvoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
  });

  it("returns error when user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { updateInvoice } = await import("@/app/(app)/invoices/actions");
    const result = await updateInvoice("invoice-id", sampleFormData);

    expect(result).toEqual({ error: "Not authenticated" });
  });

  it("updates invoice and replaces line items", async () => {
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({ error: null });
    mockDelete.mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });
    // For line items insert
    mockInsert.mockResolvedValue({ error: null });

    const { updateInvoice } = await import("@/app/(app)/invoices/actions");
    const { revalidatePath } = await import("next/cache");
    const { redirect } = await import("next/navigation");

    try {
      await updateInvoice("invoice-id", sampleFormData);
    } catch {
      // redirect may throw
    }

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        invoice_number: "INV-001",
        subtotal: 1400,
        tax_amount: 294,
        total: 1694,
      })
    );
    expect(revalidatePath).toHaveBeenCalledWith("/invoices");
    expect(redirect).toHaveBeenCalledWith("/invoices");
  });

  it("returns error when invoice update fails", async () => {
    mockUpdate.mockReturnValue({
      eq: mockEq,
    });
    mockEq.mockResolvedValue({ error: { message: "Update failed" } });

    const { updateInvoice } = await import("@/app/(app)/invoices/actions");
    const result = await updateInvoice("invoice-id", sampleFormData);

    expect(result).toEqual({ error: "Update failed" });
  });
});
