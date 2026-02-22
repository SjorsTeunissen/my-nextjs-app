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
import { ThemeSync } from "@/components/theme-sync";
import { NavSidebar } from "@/components/nav-sidebar";

// --- ThemeSync Tests ---
describe("ThemeSync", () => {
  afterEach(() => { cleanup(); });
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
  });

  it("does not call setTheme when initialTheme is null", () => {
    render(<ThemeSync initialTheme={null} />);
    expect(mockSetTheme).not.toHaveBeenCalled();
  });

  it("calls setTheme on mount when initialTheme differs from current theme", () => {
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
    render(<ThemeSync initialTheme="dark" />);
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("does not call setTheme when initialTheme matches current theme", () => {
    mockThemeState = { theme: "dark", setTheme: mockSetTheme };
    render(<ThemeSync initialTheme="dark" />);
    expect(mockSetTheme).not.toHaveBeenCalled();
  });
});

// --- NavSidebar Theme Toggle Tests ---
describe("NavSidebar theme toggle", () => {
  afterEach(() => { cleanup(); });
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
  });

  it("renders theme toggle button in sidebar footer between email and Sign Out", () => {
    const { getByTestId, getByText } = render(
      <NavSidebar userEmail="user@test.com" />
    );
    expect(getByText("user@test.com")).toBeInTheDocument();
    expect(getByText("Sign Out")).toBeInTheDocument();
    const toggleButton = getByTestId("theme-toggle");
    expect(toggleButton).toBeInTheDocument();
  });

  it("calls setTheme('dark') and saveThemePreference('dark') when clicking toggle in light mode", () => {
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar userEmail="user@test.com" />);
    fireEvent.click(getByTestId("theme-toggle"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
    expect(mockSaveThemePreference).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme('light') and saveThemePreference('light') when clicking toggle in dark mode", () => {
    mockThemeState = { theme: "dark", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar userEmail="user@test.com" />);
    fireEvent.click(getByTestId("theme-toggle"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(mockSaveThemePreference).toHaveBeenCalledWith("light");
  });

  it("shows Sun icon and 'Light' label when theme is light", () => {
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar userEmail="user@test.com" />);
    const button = getByTestId("theme-toggle");
    expect(button.textContent).toContain("Light");
  });

  it("shows Moon icon and 'Dark' label when theme is dark", () => {
    mockThemeState = { theme: "dark", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar userEmail="user@test.com" />);
    const button = getByTestId("theme-toggle");
    expect(button.textContent).toContain("Dark");
  });
});

// --- NavSidebar Collapse Tests ---
describe("NavSidebar collapse", () => {
  afterEach(() => { cleanup(); });
  beforeEach(() => {
    vi.clearAllMocks();
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
  });

  it("renders collapse toggle button", () => {
    const { getByTestId } = render(<NavSidebar userEmail="user@test.com" />);
    expect(getByTestId("sidebar-collapse-toggle")).toBeInTheDocument();
  });

  it("shows nav labels when expanded (default state)", () => {
    const { getByText } = render(<NavSidebar userEmail="user@test.com" />);
    expect(getByText("Invoices")).toBeInTheDocument();
    expect(getByText("Settings")).toBeInTheDocument();
  });

  it("hides nav labels when collapsed", () => {
    const { getByTestId, queryByText } = render(
      <NavSidebar userEmail="user@test.com" />
    );
    fireEvent.click(getByTestId("sidebar-collapse-toggle"));
    expect(queryByText("Invoices")).not.toBeInTheDocument();
    expect(queryByText("Settings")).not.toBeInTheDocument();
  });

  it("restores nav labels when expanded again", () => {
    const { getByTestId, getByText, queryByText } = render(
      <NavSidebar userEmail="user@test.com" />
    );
    // Collapse
    fireEvent.click(getByTestId("sidebar-collapse-toggle"));
    expect(queryByText("Invoices")).not.toBeInTheDocument();
    // Expand
    fireEvent.click(getByTestId("sidebar-collapse-toggle"));
    expect(getByText("Invoices")).toBeInTheDocument();
    expect(getByText("Settings")).toBeInTheDocument();
  });
});
