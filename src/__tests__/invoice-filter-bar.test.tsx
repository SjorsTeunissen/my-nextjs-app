// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  InvoiceFilterBar,
  type InvoiceFilters,
} from "@/components/invoice-filter-bar";

const emptyFilters: InvoiceFilters = {
  clientName: "",
  issueDateFrom: "",
  issueDateTo: "",
  totalMin: "",
  totalMax: "",
};

describe("InvoiceFilterBar", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders compact filter trigger buttons", () => {
    render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={vi.fn()} />
    );

    expect(screen.getByText("Client")).toBeInTheDocument();
    expect(screen.getByText("Date")).toBeInTheDocument();
    expect(screen.getByText("Amount")).toBeInTheDocument();
  });

  it("calls onFiltersChange with client name after debounce", async () => {
    const onFiltersChange = vi.fn();

    render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={onFiltersChange} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Client"));
    });

    const input = screen.getByPlaceholderText("Client name...");
    fireEvent.change(input, { target: { value: "Acme" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: "Acme" })
    );
  });

  it("calls onFiltersChange with date range", async () => {
    const onFiltersChange = vi.fn();

    render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={onFiltersChange} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Date"));
    });

    fireEvent.change(screen.getByLabelText("From date"), {
      target: { value: "2024-01-01" },
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ issueDateFrom: "2024-01-01" })
    );
  });

  it("calls onFiltersChange with amount range", async () => {
    const onFiltersChange = vi.fn();

    render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={onFiltersChange} />
    );

    await act(async () => {
      fireEvent.click(screen.getByText("Amount"));
    });

    fireEvent.change(screen.getByPlaceholderText("Min"), {
      target: { value: "1000" },
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ totalMin: "1000" })
    );
  });

  it("shows active filters as dismissible badges", () => {
    const onFiltersChange = vi.fn();
    const activeFilters: InvoiceFilters = {
      clientName: "Acme",
      issueDateFrom: "2024-01-01",
      issueDateTo: "",
      totalMin: "",
      totalMax: "",
    };

    render(
      <InvoiceFilterBar filters={activeFilters} onFiltersChange={onFiltersChange} />
    );

    expect(screen.getByText(/Acme/)).toBeInTheDocument();
    expect(screen.getByText(/2024-01-01/)).toBeInTheDocument();
  });

  it("removes individual filter when dismiss badge is clicked", () => {
    const onFiltersChange = vi.fn();
    const activeFilters: InvoiceFilters = {
      clientName: "Acme",
      issueDateFrom: "",
      issueDateTo: "",
      totalMin: "1000",
      totalMax: "",
    };

    render(
      <InvoiceFilterBar filters={activeFilters} onFiltersChange={onFiltersChange} />
    );

    const dismissButtons = screen.getAllByLabelText("Remove filter");
    fireEvent.click(dismissButtons[0]!);

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: "" })
    );
  });

  it("clears all filters when Clear all is clicked", () => {
    const onFiltersChange = vi.fn();
    const activeFilters: InvoiceFilters = {
      clientName: "Acme",
      issueDateFrom: "2024-01-01",
      issueDateTo: "2024-06-30",
      totalMin: "500",
      totalMax: "2000",
    };

    render(
      <InvoiceFilterBar filters={activeFilters} onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(screen.getByText("Clear all"));

    expect(onFiltersChange).toHaveBeenCalledWith(emptyFilters);
  });
});
