export interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export interface Totals {
  subtotal: number;
  taxAmount: number;
  total: number;
}

export function calculateTotals(items: LineItem[], taxRate: number): Totals {
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

export function generateInvoiceNumber(
  lastInvoiceNumber: string | undefined
): string {
  if (!lastInvoiceNumber) {
    return "INV-001";
  }
  const currentNumber = parseInt(lastInvoiceNumber.replace("INV-", ""), 10);
  const nextNumber = currentNumber + 1;
  return `INV-${nextNumber.toString().padStart(3, "0")}`;
}
