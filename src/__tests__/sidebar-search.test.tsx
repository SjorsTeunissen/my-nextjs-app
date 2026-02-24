// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, act, waitFor } from "@testing-library/react";

const mockSearchInvoices = vi.hoisted(() => vi.fn());

vi.mock("@/app/(app)/invoices/actions", () => ({
  searchInvoices: mockSearchInvoices,
}));

const mockPush = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

import { SidebarSearch } from "@/components/sidebar-search";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("SidebarSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchInvoices.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it("renders search input", () => {
    const { getByPlaceholderText } = render(<SidebarSearch />);
    expect(getByPlaceholderText("Search invoices...")).toBeInTheDocument();
  });

  it("calls searchInvoices with 300ms debounce on input change", async () => {
    mockSearchInvoices.mockResolvedValue([]);
    const { getByPlaceholderText } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");

    fireEvent.change(input, { target: { value: "INV" } });

    // Should not be called immediately
    expect(mockSearchInvoices).not.toHaveBeenCalled();

    // Wait for debounce + async resolution
    await waitFor(() => {
      expect(mockSearchInvoices).toHaveBeenCalledWith("INV");
    }, { timeout: 1000 });
  });

  it("debounces multiple keystrokes (only calls once with final value)", async () => {
    mockSearchInvoices.mockResolvedValue([]);
    const { getByPlaceholderText } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");

    // Type quickly
    fireEvent.change(input, { target: { value: "I" } });
    fireEvent.change(input, { target: { value: "IN" } });
    fireEvent.change(input, { target: { value: "INV" } });
    fireEvent.change(input, { target: { value: "INV-" } });
    fireEvent.change(input, { target: { value: "INV-001" } });

    await waitFor(() => {
      expect(mockSearchInvoices).toHaveBeenCalledWith("INV-001");
    }, { timeout: 1000 });

    // Should only have been called once with the final value
    expect(mockSearchInvoices).toHaveBeenCalledTimes(1);
  });

  it("displays matching invoices with number, client name, and total", async () => {
    mockSearchInvoices.mockResolvedValue([
      { id: "1", invoice_number: "INV-001", client_name: "Acme Corp", total: 1500 },
      { id: "2", invoice_number: "INV-002", client_name: "Beta Inc", total: 2500 },
    ]);

    const { getByPlaceholderText, getByText } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");

    fireEvent.change(input, { target: { value: "INV" } });

    await waitFor(() => {
      expect(getByText("INV-001")).toBeInTheDocument();
      expect(getByText("Acme Corp")).toBeInTheDocument();
      expect(getByText("INV-002")).toBeInTheDocument();
      expect(getByText("Beta Inc")).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it("navigates to invoice page when clicking a result", async () => {
    mockSearchInvoices.mockResolvedValue([
      { id: "abc-123", invoice_number: "INV-001", client_name: "Acme Corp", total: 1500 },
    ]);

    const { getByPlaceholderText, getByText } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");

    fireEvent.change(input, { target: { value: "INV" } });

    await waitFor(() => {
      expect(getByText("INV-001")).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.click(getByText("INV-001"));
    expect(mockPush).toHaveBeenCalledWith("/invoices");
  });

  it("clears search input and hides results on Escape", async () => {
    mockSearchInvoices.mockResolvedValue([
      { id: "1", invoice_number: "INV-001", client_name: "Acme Corp", total: 1500 },
    ]);

    const { getByPlaceholderText, getByText, queryByText } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");

    fireEvent.change(input, { target: { value: "INV" } });

    await waitFor(() => {
      expect(getByText("INV-001")).toBeInTheDocument();
    }, { timeout: 1000 });

    fireEvent.keyDown(input, { key: "Escape" });

    expect((input as HTMLInputElement).value).toBe("");
    expect(queryByText("INV-001")).not.toBeInTheDocument();
  });

  it("search input uses Input-bg styling", () => {
    const { getByPlaceholderText } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");
    expect(input.className).toContain("bg-[oklch(0.975_0.004_85)]");
  });

  it("search results dropdown uses Elevation-2 shadow and Surface-raised bg", async () => {
    mockSearchInvoices.mockResolvedValue([
      { id: "1", invoice_number: "INV-001", client_name: "Acme Corp", total: 1500 },
    ]);

    const { getByPlaceholderText, container } = render(<SidebarSearch />);
    const input = getByPlaceholderText("Search invoices...");

    fireEvent.change(input, { target: { value: "INV" } });

    await waitFor(() => {
      const resultsList = container.querySelector("ul");
      expect(resultsList).toBeInTheDocument();
      expect(resultsList?.className).toContain("shadow-[0_2px_8px_0_oklch(0_0_0/0.06)]");
      expect(resultsList?.className).toContain("bg-popover");
    }, { timeout: 1000 });
  });
});
