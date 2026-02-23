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
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/(app)/invoices/actions", () => ({
  searchInvoices: vi.fn().mockResolvedValue([]),
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

  const defaultProps = {
    userEmail: "user@test.com",
    companyName: "Acme Corp",
    logoUrl: null as string | null,
    collapsed: false,
    onToggleCollapse: vi.fn(),
  };

  it("renders theme toggle button in sidebar footer", () => {
    const { getByTestId } = render(<NavSidebar {...defaultProps} />);
    expect(getByTestId("theme-toggle")).toBeInTheDocument();
  });

  it("calls setTheme('dark') and saveThemePreference('dark') when clicking toggle in light mode", () => {
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar {...defaultProps} />);
    fireEvent.click(getByTestId("theme-toggle"));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
    expect(mockSaveThemePreference).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme('light') and saveThemePreference('light') when clicking toggle in dark mode", () => {
    mockThemeState = { theme: "dark", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar {...defaultProps} />);
    fireEvent.click(getByTestId("theme-toggle"));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
    expect(mockSaveThemePreference).toHaveBeenCalledWith("light");
  });

  it("shows Sun icon and 'Light' label when theme is light", () => {
    mockThemeState = { theme: "light", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar {...defaultProps} />);
    const button = getByTestId("theme-toggle");
    expect(button.textContent).toContain("Light");
  });

  it("shows Moon icon and 'Dark' label when theme is dark", () => {
    mockThemeState = { theme: "dark", setTheme: mockSetTheme };
    const { getByTestId } = render(<NavSidebar {...defaultProps} />);
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

  const defaultProps = {
    userEmail: "user@test.com",
    companyName: "Acme Corp",
    logoUrl: null as string | null,
    collapsed: false,
    onToggleCollapse: vi.fn(),
  };

  it("renders collapse toggle button", () => {
    const { getByTestId } = render(<NavSidebar {...defaultProps} />);
    expect(getByTestId("sidebar-collapse-toggle")).toBeInTheDocument();
  });

  it("shows nav labels when expanded (collapsed=false)", () => {
    const { getByText, getAllByText } = render(<NavSidebar {...defaultProps} />);
    expect(getByText("Invoices")).toBeInTheDocument();
    // "Settings" appears as both section header and nav link
    const settingsElements = getAllByText("Settings");
    expect(settingsElements.length).toBeGreaterThanOrEqual(2);
  });

  it("hides nav labels when collapsed (collapsed=true)", () => {
    const { queryByText } = render(
      <NavSidebar {...defaultProps} collapsed={true} />
    );
    expect(queryByText("Invoices")).not.toBeInTheDocument();
    expect(queryByText("Settings")).not.toBeInTheDocument();
  });

  it("shows workspace header with company name when expanded", () => {
    const { getByText } = render(<NavSidebar {...defaultProps} />);
    expect(getByText("Acme Corp")).toBeInTheDocument();
  });

  it("shows workspace header with logo when logoUrl is provided", () => {
    const { getByAltText } = render(
      <NavSidebar {...defaultProps} logoUrl="/logo.png" />
    );
    const logo = getByAltText("Acme Corp");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", "/logo.png");
  });

  it("shows Main and Settings section headers", () => {
    const { getByText, getAllByText } = render(<NavSidebar {...defaultProps} />);
    expect(getByText("Main")).toBeInTheDocument();
    // "Settings" appears as both section header button and nav link
    const settingsElements = getAllByText("Settings");
    expect(settingsElements.length).toBeGreaterThanOrEqual(2);
  });

  it("collapses section when clicking section header", () => {
    const { getByText, queryByText, getAllByText } = render(<NavSidebar {...defaultProps} />);
    // Click "Main" section header to collapse it
    fireEvent.click(getByText("Main"));
    // "Invoices" nav item should be hidden
    expect(queryByText("Invoices")).not.toBeInTheDocument();
    // "Settings" section should still show its nav link
    const settingsElements = getAllByText("Settings");
    expect(settingsElements.length).toBeGreaterThanOrEqual(1);
  });

  it("calls onToggleCollapse when collapse button is clicked", () => {
    const onToggle = vi.fn();
    const { getByTestId } = render(
      <NavSidebar {...defaultProps} onToggleCollapse={onToggle} />
    );
    fireEvent.click(getByTestId("sidebar-collapse-toggle"));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
