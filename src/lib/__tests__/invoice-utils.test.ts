import { describe, it, expect } from "vitest";
import { calculateTotals, generateInvoiceNumber } from "@/lib/invoice-utils";

describe("calculateTotals", () => {
  it("calculates totals for a single line item", () => {
    const result = calculateTotals(
      [{ description: "Web Development", quantity: 10, unit_price: 100 }],
      21
    );
    expect(result).toEqual({ subtotal: 1000, taxAmount: 210, total: 1210 });
  });

  it("calculates totals for multiple line items", () => {
    const result = calculateTotals(
      [
        { description: "Web Development", quantity: 10, unit_price: 100 },
        { description: "Design", quantity: 5, unit_price: 80 },
      ],
      21
    );
    expect(result).toEqual({ subtotal: 1400, taxAmount: 294, total: 1694 });
  });

  it("calculates totals with mixed quantities and prices", () => {
    const result = calculateTotals(
      [
        { description: "Item A", quantity: 2, unit_price: 50 },
        { description: "Item B", quantity: 1, unit_price: 100 },
      ],
      21
    );
    expect(result).toEqual({ subtotal: 200, taxAmount: 42, total: 242 });
  });

  it("returns zero totals for empty items array", () => {
    const result = calculateTotals([], 21);
    expect(result).toEqual({ subtotal: 0, taxAmount: 0, total: 0 });
  });

  it("calculates with zero tax rate", () => {
    const result = calculateTotals(
      [{ description: "Item", quantity: 1, unit_price: 100 }],
      0
    );
    expect(result).toEqual({ subtotal: 100, taxAmount: 0, total: 100 });
  });

  it("calculates with zero tax rate and multiple quantity", () => {
    const result = calculateTotals(
      [{ description: "Item", quantity: 3, unit_price: 100 }],
      0
    );
    expect(result).toEqual({ subtotal: 300, taxAmount: 0, total: 300 });
  });
});

describe("generateInvoiceNumber", () => {
  it("returns INV-001 when no previous invoice number exists", () => {
    expect(generateInvoiceNumber(undefined)).toBe("INV-001");
  });

  it("returns INV-004 when last number is INV-003", () => {
    expect(generateInvoiceNumber("INV-003")).toBe("INV-004");
  });

  it("returns INV-100 when last number is INV-099", () => {
    expect(generateInvoiceNumber("INV-099")).toBe("INV-100");
  });

  it("returns INV-002 when last number is INV-001", () => {
    expect(generateInvoiceNumber("INV-001")).toBe("INV-002");
  });

  it("returns INV-1000 when last number is INV-999", () => {
    expect(generateInvoiceNumber("INV-999")).toBe("INV-1000");
  });
});
