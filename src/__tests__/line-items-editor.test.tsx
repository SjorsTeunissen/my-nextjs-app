// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { LineItemsEditor, type LineItemRow } from "@/components/line-items-editor";

afterEach(() => {
  cleanup();
});

function createItem(overrides: Partial<LineItemRow> = {}): LineItemRow {
  return {
    id: "item-1",
    description: "Web Development",
    quantity: 10,
    unit_price: 100,
    ...overrides,
  };
}

describe("LineItemsEditor", () => {
  it("renders a line item row with description, quantity, unit price, and calculated amount", () => {
    const items = [createItem()];
    const { getByDisplayValue, getAllByText } = render(
      <LineItemsEditor items={items} taxRate={21} onChange={vi.fn()} />
    );

    expect(getByDisplayValue("Web Development")).toBeInTheDocument();
    expect(getByDisplayValue("10")).toBeInTheDocument();
    expect(getByDisplayValue("100")).toBeInTheDocument();
    // amount = 10 * 100 = 1000 -> appears as row amount and subtotal
    const amountCells = getAllByText(/1\.000,00/);
    expect(amountCells.length).toBeGreaterThanOrEqual(1);
  });

  it("shows correct subtotal, tax, and total for a single item", () => {
    const items = [createItem({ quantity: 10, unit_price: 100 })];
    const { getByTestId } = render(
      <LineItemsEditor items={items} taxRate={21} onChange={vi.fn()} />
    );

    // subtotal: 1000
    expect(getByTestId("subtotal").textContent).toMatch(/1\.000,00/);
    // tax: 1000 * 0.21 = 210
    expect(getByTestId("tax-amount").textContent).toMatch(/210,00/);
    // total: 1210
    expect(getByTestId("total").textContent).toMatch(/1\.210,00/);
  });

  it("shows correct totals for two items", () => {
    const items = [
      createItem({ id: "item-1", quantity: 10, unit_price: 100 }),
      createItem({ id: "item-2", description: "Design", quantity: 5, unit_price: 80 }),
    ];
    const { getByTestId } = render(
      <LineItemsEditor items={items} taxRate={21} onChange={vi.fn()} />
    );

    // subtotal: 1000 + 400 = 1400
    expect(getByTestId("subtotal").textContent).toMatch(/1\.400,00/);
    // tax: 1400 * 0.21 = 294
    expect(getByTestId("tax-amount").textContent).toMatch(/294,00/);
    // total: 1694
    expect(getByTestId("total").textContent).toMatch(/1\.694,00/);
  });

  it("calls onChange with a new row when Add Line Item is clicked", () => {
    const onChange = vi.fn();
    const items = [createItem()];
    const { getByText } = render(
      <LineItemsEditor items={items} taxRate={21} onChange={onChange} />
    );

    fireEvent.click(getByText("Add Line Item"));

    expect(onChange).toHaveBeenCalledTimes(1);
    const newItems = onChange.mock.calls[0][0];
    expect(newItems).toHaveLength(2);
    expect(newItems[1].description).toBe("");
    expect(newItems[1].quantity).toBe(1);
    expect(newItems[1].unit_price).toBe(0);
  });

  it("calls onChange without the removed item when remove button is clicked", () => {
    const onChange = vi.fn();
    const items = [
      createItem({ id: "item-1" }),
      createItem({ id: "item-2", description: "Design" }),
    ];
    const { getAllByLabelText } = render(
      <LineItemsEditor items={items} taxRate={21} onChange={onChange} />
    );

    const removeButtons = getAllByLabelText("Remove line item");
    fireEvent.click(removeButtons[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const newItems = onChange.mock.calls[0][0];
    expect(newItems).toHaveLength(1);
    expect(newItems[0].id).toBe("item-2");
  });

  it("calls onChange with updated description when input changes", () => {
    const onChange = vi.fn();
    const items = [createItem()];
    const { getByDisplayValue } = render(
      <LineItemsEditor items={items} taxRate={21} onChange={onChange} />
    );

    fireEvent.change(getByDisplayValue("Web Development"), {
      target: { value: "Consulting" },
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    const newItems = onChange.mock.calls[0][0];
    expect(newItems[0].description).toBe("Consulting");
  });

  it("displays tax rate percentage in footer", () => {
    const { getByText } = render(
      <LineItemsEditor items={[]} taxRate={21} onChange={vi.fn()} />
    );

    expect(getByText("Tax (21%)")).toBeInTheDocument();
  });
});
