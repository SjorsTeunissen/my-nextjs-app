"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { FileText, ExternalLink, ArrowUp, ArrowDown, Trash2, Download, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { InvoiceQuickEdit } from "@/components/invoice-quick-edit";
import { cn, formatCurrency } from "@/lib/utils";
import { bulkDeleteInvoices } from "@/app/(app)/invoices/actions";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface InvoiceTableProps {
  invoices: Invoice[];
  onRowSelect?: (invoice: Invoice) => void;
}

function exportCSV(invoices: Invoice[]) {
  const headers = ["Invoice #", "Client Name", "Issue Date", "Due Date", "Total"];
  const rows = invoices.map((inv) => [
    inv.invoice_number,
    inv.client_name ?? "",
    inv.issue_date ?? "",
    inv.due_date ?? "",
    inv.total != null ? String(inv.total) : "",
  ]);
  const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "invoices.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const columns: ColumnDef<Invoice>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllRowsSelected()}
        onCheckedChange={(checked) => table.toggleAllRowsSelected(!!checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(!!checked)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
    size: 40,
  },
  {
    accessorKey: "invoice_number",
    header: "Invoice #",
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("invoice_number")}</span>
    ),
  },
  {
    accessorKey: "client_name",
    header: "Client Name",
  },
  {
    accessorKey: "issue_date",
    header: "Issue Date",
    cell: ({ row }) => {
      const date = row.getValue<string | null>("issue_date");
      return date ? new Date(date).toLocaleDateString("nl-NL") : "";
    },
  },
  {
    accessorKey: "due_date",
    header: "Due Date",
    cell: ({ row }) => {
      const date = row.getValue<string | null>("due_date");
      return date ? new Date(date).toLocaleDateString("nl-NL") : "";
    },
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const total = row.getValue<number | null>("total");
      return (
        <span className="text-right block tabular-nums">
          {total != null ? formatCurrency(total) : ""}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <InvoiceQuickEdit invoice={row.original} />
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover/row:opacity-100"
          aria-label="View invoice"
          asChild
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/invoices/${row.original.id}`}>
            <ExternalLink className="size-3.5" />
          </Link>
        </Button>
      </div>
    ),
    enableSorting: false,
    size: 64,
  },
];

export function InvoiceTable({ invoices, onRowSelect }: InvoiceTableProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const table = useReactTable({
    data: invoices,
    columns,
    state: {
      sorting,
      rowSelection,
    },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection: true,
    columnResizeMode: "onEnd",
    getRowId: (row) => row.id,
  });

  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const hasSelection = selectedRows.length > 0;

  async function handleBulkDelete() {
    const count = selectedRows.length;
    const confirmed = window.confirm(
      `Delete ${count} invoice${count === 1 ? "" : "s"}? This action cannot be undone.`
    );
    if (!confirmed) return;
    const ids = selectedRows.map((row) => row.original.id);
    const result = await bulkDeleteInvoices(ids);
    if (result.error) {
      toast.error("Failed to delete invoices");
      return;
    }
    toast.success(`${count} invoice${count === 1 ? "" : "s"} deleted`);
    setRowSelection({});
    router.refresh();
  }

  function handleExportCSV() {
    const selectedInvoices = selectedRows.map((row) => row.original);
    exportCSV(selectedInvoices);
  }

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="text-muted-foreground/50 mb-3 size-10" />
        <p className="text-muted-foreground mb-4 text-sm text-pretty">
          No invoices yet. Create your first invoice to get started.
        </p>
        <Button size="sm" asChild>
          <Link href="/invoices/new">
            <Plus className="size-4" />
            Create Invoice
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      {hasSelection && (
        <div className="flex items-center gap-2 mb-2 p-2 rounded-sm bg-muted">
          <span className="text-sm text-muted-foreground">
            {selectedRows.length} selected
          </span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="size-3.5" />
            Delete selected
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </div>
      )}
      <Table style={{ width: table.getCenterTotalSize() }}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className={
                    header.column.getCanSort() ? "cursor-pointer select-none" : ""
                  }
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    {header.column.getIsSorted() === "asc" && (
                      <ArrowUp className="size-3.5" />
                    )}
                    {header.column.getIsSorted() === "desc" && (
                      <ArrowDown className="size-3.5" />
                    )}
                  </div>
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={cn(
                        "absolute right-0 top-0 h-full w-1 cursor-col-resize select-none touch-none",
                        header.column.getIsResizing() ? "bg-primary" : "bg-transparent hover:bg-border"
                      )}
                    />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="group/row cursor-pointer transition-colors duration-150"
              data-state={row.getIsSelected() ? "selected" : undefined}
              onClick={() => onRowSelect?.(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
