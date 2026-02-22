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
    <div className="space-y-3">
      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-8 text-xs">Description</TableHead>
              <TableHead className="h-8 w-28 text-xs">Quantity</TableHead>
              <TableHead className="h-8 w-32 text-xs">Unit Price</TableHead>
              <TableHead className="h-8 w-32 text-right text-xs">Amount</TableHead>
              <TableHead className="h-8 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="group border-border hover:bg-muted/50">
                <TableCell className="py-1.5">
                  <Input
                    aria-label="Description"
                    value={item.description}
                    onChange={(e) =>
                      updateRow(item.id, "description", e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="py-1.5">
                  <Input
                    aria-label="Quantity"
                    type="number"
                    min="0"
                    step="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateRow(item.id, "quantity", e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="py-1.5">
                  <Input
                    aria-label="Unit Price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateRow(item.id, "unit_price", e.target.value)
                    }
                    className="h-8"
                  />
                </TableCell>
                <TableCell className="py-1.5 text-right text-sm">
                  {formatCurrency(item.quantity * item.unit_price)}
                </TableCell>
                <TableCell className="py-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeRow(item.id)}
                    aria-label="Remove line item"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="border-border">
              <TableCell colSpan={3} className="py-1.5 text-right text-sm font-medium">
                Subtotal
              </TableCell>
              <TableCell className="py-1.5 text-right text-sm" data-testid="subtotal">
                {formatCurrency(totals.subtotal)}
              </TableCell>
              <TableCell className="py-1.5" />
            </TableRow>
            <TableRow className="border-border">
              <TableCell colSpan={3} className="py-1.5 text-right text-sm font-medium">
                Tax ({taxRate}%)
              </TableCell>
              <TableCell className="py-1.5 text-right text-sm" data-testid="tax-amount">
                {formatCurrency(totals.taxAmount)}
              </TableCell>
              <TableCell className="py-1.5" />
            </TableRow>
            <TableRow className="border-border">
              <TableCell colSpan={3} className="py-1.5 text-right text-sm font-bold">
                Total
              </TableCell>
              <TableCell
                className="py-1.5 text-right text-sm font-bold"
                data-testid="total"
              >
                {formatCurrency(totals.total)}
              </TableCell>
              <TableCell className="py-1.5" />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <Plus className="size-4" />
        Add Line Item
      </Button>
    </div>
  );
}
