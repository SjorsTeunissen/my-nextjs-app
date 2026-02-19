import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockGetUser = vi.fn();
const mockSelect = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSingle = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: vi.fn(() => ({
      select: mockSelect,
      update: mockUpdate,
    })),
    storage: {
      from: vi.fn(() => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      })),
    },
  })),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

function createFormData(data: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.set(key, value);
  }
  return formData;
}

describe("settings actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    // Default chain: select -> single
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: { id: "settings-row-id" },
      error: null,
    });
    // Default chain: update -> eq
    mockUpdate.mockReturnValue({ eq: mockEq });
    mockEq.mockResolvedValue({ error: null });
  });

  describe("saveCompanySettings", () => {
    const validFormData = {
      company_name: "Acme Corp",
      address_line1: "123 Main St",
      address_line2: "Suite 100",
      city: "Amsterdam",
      postal_code: "1000 AA",
      country: "Netherlands",
      email: "info@acme.com",
      phone: "+31 20 123 4567",
      bank_name: "ING Bank",
      bank_iban: "NL91ABNA0417164300",
      bank_bic: "INGBNL2A",
      vat_number: "NL123456789B01",
      default_tax_rate: "21",
    };

    it("saves company settings successfully", async () => {
      const { saveCompanySettings } = await import(
        "@/app/(app)/settings/actions"
      );
      const formData = createFormData(validFormData);

      const result = await saveCompanySettings(null, formData);

      expect(result).toEqual({ success: true });
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: "Acme Corp",
          address_line1: "123 Main St",
          address_line2: "Suite 100",
          city: "Amsterdam",
          postal_code: "1000 AA",
          country: "Netherlands",
          email: "info@acme.com",
          phone: "+31 20 123 4567",
          bank_name: "ING Bank",
          bank_iban: "NL91ABNA0417164300",
          bank_bic: "INGBNL2A",
          vat_number: "NL123456789B01",
          default_tax_rate: 21,
          updated_by: "user-123",
        })
      );
      expect(mockEq).toHaveBeenCalledWith("id", "settings-row-id");
    });

    it("parses default_tax_rate as a number", async () => {
      const { saveCompanySettings } = await import(
        "@/app/(app)/settings/actions"
      );
      const formData = createFormData({
        ...validFormData,
        default_tax_rate: "19.5",
      });

      await saveCompanySettings(null, formData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          default_tax_rate: 19.5,
        })
      );
    });

    it("calls revalidatePath on success", async () => {
      const { saveCompanySettings } = await import(
        "@/app/(app)/settings/actions"
      );
      const { revalidatePath } = await import("next/cache");
      const formData = createFormData(validFormData);

      await saveCompanySettings(null, formData);

      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("sets updated_at and updated_by fields", async () => {
      const { saveCompanySettings } = await import(
        "@/app/(app)/settings/actions"
      );
      const formData = createFormData(validFormData);

      await saveCompanySettings(null, formData);

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_by: "user-123",
          updated_at: expect.any(String),
        })
      );
    });

    it("returns error when update fails", async () => {
      mockEq.mockResolvedValue({
        error: { message: "Database update failed" },
      });

      const { saveCompanySettings } = await import(
        "@/app/(app)/settings/actions"
      );
      const formData = createFormData(validFormData);

      const result = await saveCompanySettings(null, formData);

      expect(result).toEqual({ error: "Database update failed" });
    });

    it("returns error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const { saveCompanySettings } = await import(
        "@/app/(app)/settings/actions"
      );
      const formData = createFormData(validFormData);

      const result = await saveCompanySettings(null, formData);

      expect(result).toEqual({ error: "Not authenticated" });
    });
  });

  describe("uploadLogo", () => {
    function createFileFormData(
      name: string,
      type: string,
      sizeInBytes: number
    ) {
      const buffer = new ArrayBuffer(sizeInBytes);
      const file = new File([buffer], name, { type });
      const formData = new FormData();
      formData.set("logo", file);
      return formData;
    }

    it("uploads a valid PNG logo successfully", async () => {
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://storage.example.com/logo.png" },
      });
      // For the update after upload
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({ error: null });

      const { uploadLogo } = await import("@/app/(app)/settings/actions");
      const formData = createFileFormData("logo.png", "image/png", 1024);

      const result = await uploadLogo(formData);

      expect(result).toEqual({
        success: true,
        logoUrl: "https://storage.example.com/logo.png",
      });
      expect(mockUpload).toHaveBeenCalled();
    });

    it("rejects files larger than 2MB", async () => {
      const { uploadLogo } = await import("@/app/(app)/settings/actions");
      const formData = createFileFormData(
        "huge.png",
        "image/png",
        3 * 1024 * 1024
      );

      const result = await uploadLogo(formData);

      expect(result).toEqual({
        error: "File size must be less than 2MB",
      });
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("rejects invalid file types", async () => {
      const { uploadLogo } = await import("@/app/(app)/settings/actions");
      const formData = createFileFormData("doc.pdf", "application/pdf", 1024);

      const result = await uploadLogo(formData);

      expect(result).toEqual({
        error: "Only PNG and JPEG images are allowed",
      });
      expect(mockUpload).not.toHaveBeenCalled();
    });

    it("returns error when storage upload fails", async () => {
      mockUpload.mockResolvedValue({
        error: { message: "Storage upload failed" },
      });

      const { uploadLogo } = await import("@/app/(app)/settings/actions");
      const formData = createFileFormData("logo.png", "image/png", 1024);

      const result = await uploadLogo(formData);

      expect(result).toEqual({ error: "Storage upload failed" });
    });

    it("calls revalidatePath after successful upload", async () => {
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://storage.example.com/logo.png" },
      });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({ error: null });

      const { uploadLogo } = await import("@/app/(app)/settings/actions");
      const { revalidatePath } = await import("next/cache");
      const formData = createFileFormData("logo.png", "image/png", 1024);

      await uploadLogo(formData);

      expect(revalidatePath).toHaveBeenCalledWith("/settings");
    });

    it("accepts JPEG files", async () => {
      mockUpload.mockResolvedValue({ error: null });
      mockGetPublicUrl.mockReturnValue({
        data: { publicUrl: "https://storage.example.com/logo.jpg" },
      });
      mockUpdate.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({ error: null });

      const { uploadLogo } = await import("@/app/(app)/settings/actions");
      const formData = createFileFormData("logo.jpg", "image/jpeg", 1024);

      const result = await uploadLogo(formData);

      expect(result).toEqual({
        success: true,
        logoUrl: "https://storage.example.com/logo.jpg",
      });
    });
  });
});
