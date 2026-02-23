// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";

// --- Mocks ---
const { mockSetTheme, mockSaveThemePreference } = vi.hoisted(() => ({
  mockSetTheme: vi.fn(),
  mockSaveThemePreference: vi.fn(),
}));

let mockThemeState: { theme: string; setTheme: typeof mockSetTheme } = {
  theme: "light",
  setTheme: mockSetTheme,
};

vi.mock("next-themes", () => ({
  useTheme: () => mockThemeState,
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/invoices",
}));

vi.mock("@/app/login/actions", () => ({
  signOut: vi.fn(),
}));

vi.mock("@/app/(app)/settings/theme-actions", () => ({
  saveThemePreference: mockSaveThemePreference,
}));

// --- Imports (after mocks) ---
import { MobileSidebar } from "@/components/mobile-sidebar";
import { navSections } from "@/lib/nav-config";

describe("MobileSidebar", () => {
  afterEach(() => { cleanup(); });
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
  });

  it("renders the hamburger menu button", () => {
    const { getByTestId } = render(<MobileSidebar userEmail="user@test.com" />);
    expect(getByTestId("mobile-menu-button")).toBeInTheDocument();
  });

  it("opens Sheet when hamburger button is clicked", () => {
    const { getByTestId, getByText } = render(
      <MobileSidebar userEmail="user@test.com" />
    );
    fireEvent.click(getByTestId("mobile-menu-button"));
    expect(getByText("Invoices")).toBeInTheDocument();
    expect(getByText("Settings")).toBeInTheDocument();
  });

  it("shows navigation links in the Sheet", () => {
    const { getByTestId, getByText } = render(
      <MobileSidebar userEmail="user@test.com" />
    );
    fireEvent.click(getByTestId("mobile-menu-button"));
    const invoicesLink = getByText("Invoices");
    const settingsLink = getByText("Settings");
    expect(invoicesLink.closest("a")).toHaveAttribute("href", "/invoices");
    expect(settingsLink.closest("a")).toHaveAttribute("href", "/settings");
  });

  it("shows user email in the Sheet", () => {
    const { getByTestId, getByText } = render(
      <MobileSidebar userEmail="user@test.com" />
    );
    fireEvent.click(getByTestId("mobile-menu-button"));
    expect(getByText("user@test.com")).toBeInTheDocument();
  });
});

describe("MobileSidebar Ink & Ledger styling", () => {
  afterEach(() => { cleanup(); });
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
  });

  it("nav items match shared nav-config", () => {
    const { getByTestId, getByText } = render(
      <MobileSidebar userEmail="user@test.com" />
    );
    fireEvent.click(getByTestId("mobile-menu-button"));
    const allItems = navSections.flatMap((s) => s.items);
    for (const item of allItems) {
      expect(getByText(item.label)).toBeInTheDocument();
    }
  });

  it("nav items use warm hover styling (hover:bg-muted/50)", () => {
    const { getByTestId, getByText } = render(
      <MobileSidebar userEmail="user@test.com" />
    );
    fireEvent.click(getByTestId("mobile-menu-button"));
    const invoicesLink = getByText("Invoices").closest("a");
    expect(invoicesLink?.className).toContain("hover:bg-muted/50");
    expect(invoicesLink?.className).not.toContain("hover:bg-sidebar-accent");
  });
});
