import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/ssr
const mockGetUser = vi.fn();
vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock next/server
const mockRedirect = vi.fn();
vi.mock("next/server", () => {
  class MockNextResponse {
    cookies: { set: ReturnType<typeof vi.fn> };
    constructor() {
      this.cookies = { set: vi.fn() };
    }
    static next({ request }: { request: unknown }) {
      const res = new MockNextResponse();
      Object.assign(res, { _request: request });
      return res;
    }
    static redirect(url: URL) {
      mockRedirect(url);
      const res = new MockNextResponse();
      Object.assign(res, { _redirectUrl: url });
      return res;
    }
  }
  return { NextResponse: MockNextResponse };
});

function createMockRequest(pathname: string) {
  const url = new URL(`http://localhost:3000${pathname}`);
  return {
    cookies: {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
    nextUrl: {
      pathname,
      clone() {
        return new URL(url);
      },
    },
  };
}

describe("middleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { middleware } = await import("@/middleware");
    const request = createMockRequest("/invoices");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await middleware(request as any);

    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/login");
    expect(response).toBeDefined();
  });

  it("allows unauthenticated users to access /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { middleware } = await import("@/middleware");
    const request = createMockRequest("/login");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await middleware(request as any);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("allows authenticated users to access protected routes", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "123", email: "test@example.com" } },
    });

    const { middleware } = await import("@/middleware");
    const request = createMockRequest("/invoices");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await middleware(request as any);

    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users from /settings to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const { middleware } = await import("@/middleware");
    const request = createMockRequest("/settings");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await middleware(request as any);

    expect(mockRedirect).toHaveBeenCalled();
    const redirectUrl = mockRedirect.mock.calls[0][0];
    expect(redirectUrl.pathname).toBe("/login");
  });
});
