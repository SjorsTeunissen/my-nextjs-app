"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { calculateTotals, type LineItem } from "@/lib/invoice-utils";

export interface LineItemRow extends LineItem {
  id: string;
}

interface LineItemsEditorProps {
  items: LineItemRow[];
  taxRate: number;
  onChange: (items: LineItemRow[]) => void;
}

export function LineItemsEditor({
  items,
  taxRate,
  onChange,
}: LineItemsEditorProps) {
  const totals = calculateTotals(items, taxRate);

  function addRow() {
    onChange([
      ...items,
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ]);
  }

  function removeRow(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  function updateRow(id: string, field: keyof LineItem, value: string) {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        if (field === "description") {
          return { ...item, description: value };
        }
        const numValue = parseFloat(value) || 0;
        return { ...item, [field]: numValue };
      })
    );
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="w-28">Quantity</TableHead>
            <TableHead className="w-32">Unit Price</TableHead>
            <TableHead className="w-32 text-right">Amount</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <Input
                  aria-label="Description"
                  value={item.description}
                  onChange={(e) =>
                    updateRow(item.id, "description", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  aria-label="Quantity"
                  type="number"
                  min="0"
                  step="1"
                  value={item.quantity}
                  onChange={(e) =>
                    updateRow(item.id, "quantity", e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  aria-label="Unit Price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) =>
                    updateRow(item.id, "unit_price", e.target.value)
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(item.quantity * item.unit_price)}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeRow(item.id)}
                  aria-label="Remove line item"
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right" data-testid="subtotal">
              {formatCurrency(totals.subtotal)}
            </TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} className="text-right font-medium">
              Tax ({taxRate}%)
            </TableCell>
            <TableCell className="text-right" data-testid="tax-amount">
              {formatCurrency(totals.taxAmount)}
            </TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell colSpan={3} className="text-right font-bold">
              Total
            </TableCell>
            <TableCell
              className="text-right font-bold"
              data-testid="total"
            >
              {formatCurrency(totals.total)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="size-4" />
        Add Line Item
      </Button>
    </div>
  );
}
