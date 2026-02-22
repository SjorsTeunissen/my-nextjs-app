// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, screen, waitFor } from "@testing-library/react";

// cmdk uses ResizeObserver and scrollIntoView which jsdom does not provide
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
Element.prototype.scrollIntoView = vi.fn();

// --- Mocks ---
const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// --- Import (after mocks) ---
import { CommandPalette } from "@/components/command-palette";

// Helper to open the palette via keyboard
function openPalette() {
  fireEvent.keyDown(document, { key: "k", ctrlKey: true });
}

describe("CommandPalette", () => {
  afterEach(() => {
    cleanup();
  });
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render the dialog content when closed (default state)", () => {
    render(<CommandPalette />);
    expect(screen.queryByPlaceholderText("Search pages...")).not.toBeInTheDocument();
  });

  it("opens the command palette when Ctrl+K is pressed", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
    });
  });

  it("opens the command palette when Meta+K is pressed", async () => {
    render(<CommandPalette />);
    fireEvent.keyDown(document, { key: "k", metaKey: true });
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
    });
  });

  it("closes the command palette when Escape is pressed", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
    });
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("Search pages...")).not.toBeInTheDocument();
    });
  });

  it("lists all navigable pages when opened", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByText("Invoices")).toBeInTheDocument();
      expect(screen.getByText("New Invoice")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
  });

  it("filters results as the user types", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText("Search pages...");
    fireEvent.change(input, { target: { value: "Settings" } });
    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
      // cmdk hides non-matching items via aria-hidden
      const invoicesItem = screen.queryByText("Invoices");
      if (invoicesItem) {
        const cmdkItem = invoicesItem.closest("[cmdk-item]");
        expect(cmdkItem).toHaveAttribute("aria-hidden", "true");
      }
    });
  });

  it("shows empty state when no results match", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByPlaceholderText("Search pages...")).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText("Search pages...");
    fireEvent.change(input, { target: { value: "zzzznotfound" } });
    await waitFor(() => {
      expect(screen.getByText("No results found.")).toBeInTheDocument();
    });
  });

  it("navigates to /invoices when Invoices item is selected", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByText("Invoices")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Invoices"));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/invoices");
    });
  });

  it("navigates to /invoices/new when New Invoice item is selected", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByText("New Invoice")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("New Invoice"));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/invoices/new");
    });
  });

  it("navigates to /settings when Settings item is selected", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Settings"));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/settings");
    });
  });

  it("closes the dialog after navigating", async () => {
    render(<CommandPalette />);
    openPalette();
    await waitFor(() => {
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("Settings"));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/settings");
      expect(screen.queryByPlaceholderText("Search pages...")).not.toBeInTheDocument();
    });
  });
});
