import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockSignUp = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  })),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock next/navigation
const mockRedirect = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    mockRedirect(path);
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
}));

function createFormData(data: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(data)) {
    formData.set(key, value);
  }
  return formData;
}

describe("login actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signIn", () => {
    it("calls supabase signInWithPassword and redirects on success", async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      const { signIn } = await import("@/app/login/actions");
      const formData = createFormData({
        email: "test@example.com",
        password: "password123",
      });

      await expect(signIn(formData)).rejects.toThrow("NEXT_REDIRECT:/invoices");

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
      expect(mockRedirect).toHaveBeenCalledWith("/invoices");
    });

    it("returns error message on failed sign in", async () => {
      mockSignInWithPassword.mockResolvedValue({
        error: { message: "Invalid login credentials" },
      });

      const { signIn } = await import("@/app/login/actions");
      const formData = createFormData({
        email: "bad@example.com",
        password: "wrong",
      });

      const result = await signIn(formData);

      expect(result).toEqual({ error: "Invalid login credentials" });
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  describe("signUp", () => {
    it("calls supabase signUp and redirects on success", async () => {
      mockSignUp.mockResolvedValue({ error: null });

      const { signUp } = await import("@/app/login/actions");
      const formData = createFormData({
        email: "new@example.com",
        password: "newpassword123",
      });

      await expect(signUp(formData)).rejects.toThrow("NEXT_REDIRECT:/invoices");

      expect(mockSignUp).toHaveBeenCalledWith({
        email: "new@example.com",
        password: "newpassword123",
      });
    });

    it("returns error message on failed sign up", async () => {
      mockSignUp.mockResolvedValue({
        error: { message: "User already registered" },
      });

      const { signUp } = await import("@/app/login/actions");
      const formData = createFormData({
        email: "existing@example.com",
        password: "password123",
      });

      const result = await signUp(formData);

      expect(result).toEqual({ error: "User already registered" });
    });
  });

  describe("signOut", () => {
    it("calls supabase signOut and redirects to /login", async () => {
      mockSignOut.mockResolvedValue({ error: null });

      const { signOut } = await import("@/app/login/actions");

      await expect(signOut()).rejects.toThrow("NEXT_REDIRECT:/login");

      expect(mockSignOut).toHaveBeenCalled();
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });
  });
});
