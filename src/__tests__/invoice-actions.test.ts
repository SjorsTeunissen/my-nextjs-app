import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: mockSelect,
      delete: mockDelete,
    })),
  })),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("invoice actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
  });

  describe("getNextInvoiceNumber", () => {
    it("returns INV-001 when no invoices exist", async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const { getNextInvoiceNumber } = await import(
        "@/app/(app)/invoices/actions"
      );
      const result = await getNextInvoiceNumber();

      expect(result).toBe("INV-001");
    });

    it("returns INV-006 when highest existing number is INV-005", async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: { invoice_number: "INV-005" },
        error: null,
      });

      const { getNextInvoiceNumber } = await import(
        "@/app/(app)/invoices/actions"
      );
      const result = await getNextInvoiceNumber();

      expect(result).toBe("INV-006");
    });

    it("returns INV-100 when highest existing number is INV-099", async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: { invoice_number: "INV-099" },
        error: null,
      });

      const { getNextInvoiceNumber } = await import(
        "@/app/(app)/invoices/actions"
      );
      const result = await getNextInvoiceNumber();

      expect(result).toBe("INV-100");
    });

    it("queries invoice_number ordered descending with limit 1", async () => {
      mockSelect.mockReturnValue({ order: mockOrder });
      mockOrder.mockReturnValue({ limit: mockLimit });
      mockLimit.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const { getNextInvoiceNumber } = await import(
        "@/app/(app)/invoices/actions"
      );
      await getNextInvoiceNumber();

      expect(mockSelect).toHaveBeenCalledWith("invoice_number");
      expect(mockOrder).toHaveBeenCalledWith("invoice_number", {
        ascending: false,
      });
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe("deleteInvoice", () => {
    it("deletes an invoice by id", async () => {
      mockDelete.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({ error: null });

      const { deleteInvoice } = await import(
        "@/app/(app)/invoices/actions"
      );
      const result = await deleteInvoice("invoice-123");

      expect(mockEq).toHaveBeenCalledWith("id", "invoice-123");
      expect(result).toEqual({ success: true });
    });

    it("returns error when delete fails", async () => {
      mockDelete.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({
        error: { message: "Delete failed" },
      });

      const { deleteInvoice } = await import(
        "@/app/(app)/invoices/actions"
      );
      const result = await deleteInvoice("invoice-123");

      expect(result).toEqual({ error: "Delete failed" });
    });

    it("returns error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const { deleteInvoice } = await import(
        "@/app/(app)/invoices/actions"
      );
      const result = await deleteInvoice("invoice-123");

      expect(result).toEqual({ error: "Not authenticated" });
    });

    it("calls revalidatePath after successful delete", async () => {
      mockDelete.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({ error: null });

      const { deleteInvoice } = await import(
        "@/app/(app)/invoices/actions"
      );
      const { revalidatePath } = await import("next/cache");

      await deleteInvoice("invoice-123");

      expect(revalidatePath).toHaveBeenCalledWith("/invoices");
    });
  });
});
