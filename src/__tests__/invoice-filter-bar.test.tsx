// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent, act } from "@testing-library/react";
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

  it("calls onFiltersChange with client name after debounce", () => {
    const onFiltersChange = vi.fn();

    const { getByPlaceholderText } = render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={onFiltersChange} />
    );

    const input = getByPlaceholderText("Client name...");
    fireEvent.change(input, { target: { value: "Acme" } });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ clientName: "Acme" })
    );
  });

  it("calls onFiltersChange with date range", () => {
    const onFiltersChange = vi.fn();

    const { getByLabelText } = render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={onFiltersChange} />
    );

    fireEvent.change(getByLabelText("From date"), {
      target: { value: "2024-01-01" },
    });

    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ issueDateFrom: "2024-01-01" })
    );
  });

  it("calls onFiltersChange with amount range", () => {
    const onFiltersChange = vi.fn();

    const { getByPlaceholderText } = render(
      <InvoiceFilterBar filters={emptyFilters} onFiltersChange={onFiltersChange} />
    );

    fireEvent.change(getByPlaceholderText("Min"), {
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

    const { getByText } = render(
      <InvoiceFilterBar filters={activeFilters} onFiltersChange={onFiltersChange} />
    );

    expect(getByText(/Acme/)).toBeInTheDocument();
    expect(getByText(/2024-01-01/)).toBeInTheDocument();
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

    const { getAllByLabelText } = render(
      <InvoiceFilterBar filters={activeFilters} onFiltersChange={onFiltersChange} />
    );

    const dismissButtons = getAllByLabelText("Remove filter");
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

    const { getByText } = render(
      <InvoiceFilterBar filters={activeFilters} onFiltersChange={onFiltersChange} />
    );

    fireEvent.click(getByText("Clear all"));

    expect(onFiltersChange).toHaveBeenCalledWith(emptyFilters);
  });
});
