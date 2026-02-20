import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockUpsert = vi.fn();
const mockSingle = vi.fn();
const mockEq = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  })),
}));

describe("theme actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
    });
    // Default chain: from -> select -> eq -> single
    mockFrom.mockReturnValue({
      select: mockSelect,
      upsert: mockUpsert,
    });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({
      data: { theme: "dark" },
      error: null,
    });
    mockUpsert.mockResolvedValue({ error: null });
  });

  describe("saveThemePreference", () => {
    it("saves theme preference successfully", async () => {
      const { saveThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await saveThemePreference("dark");

      expect(result).toEqual({ success: true });
      expect(mockFrom).toHaveBeenCalledWith("user_preferences");
      expect(mockUpsert).toHaveBeenCalledWith(
        {
          user_id: "user-123",
          theme: "dark",
          updated_at: expect.any(String),
        },
        { onConflict: "user_id" }
      );
    });

    it("saves 'light' theme successfully", async () => {
      const { saveThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await saveThemePreference("light");

      expect(result).toEqual({ success: true });
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "light" }),
        { onConflict: "user_id" }
      );
    });

    it("saves 'system' theme successfully", async () => {
      const { saveThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await saveThemePreference("system");

      expect(result).toEqual({ success: true });
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ theme: "system" }),
        { onConflict: "user_id" }
      );
    });

    it("rejects invalid theme value", async () => {
      const { saveThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await saveThemePreference("invalid");

      expect(result).toEqual({ error: "Invalid theme value" });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("returns error when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const { saveThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await saveThemePreference("light");

      expect(result).toEqual({ error: "Not authenticated" });
      expect(mockFrom).not.toHaveBeenCalled();
    });

    it("returns error when Supabase upsert fails", async () => {
      mockUpsert.mockResolvedValue({
        error: { message: "Database upsert failed" },
      });

      const { saveThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await saveThemePreference("dark");

      expect(result).toEqual({ error: "Database upsert failed" });
    });
  });

  describe("getThemePreference", () => {
    it("returns theme when preference exists", async () => {
      const { getThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await getThemePreference();

      expect(result).toBe("dark");
      expect(mockFrom).toHaveBeenCalledWith("user_preferences");
      expect(mockSelect).toHaveBeenCalledWith("theme");
      expect(mockEq).toHaveBeenCalledWith("user_id", "user-123");
    });

    it("returns null when no preference exists", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: null,
      });

      const { getThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await getThemePreference();

      expect(result).toBeNull();
    });

    it("returns null when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({
        data: { user: null },
      });

      const { getThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await getThemePreference();

      expect(result).toBeNull();
    });

    it("returns null when Supabase query fails", async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: "Database query failed" },
      });

      const { getThemePreference } = await import(
        "@/app/(app)/settings/theme-actions"
      );

      const result = await getThemePreference();

      expect(result).toBeNull();
    });
  });
});
