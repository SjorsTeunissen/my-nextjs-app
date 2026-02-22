"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { InvoiceQuickEdit } from "@/components/invoice-quick-edit";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="text-muted-foreground/50 mb-3 size-10" />
        <p className="text-muted-foreground text-sm">
          No invoices yet. Create your first invoice to get started.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice #</TableHead>
          <TableHead>Client Name</TableHead>
          <TableHead>Issue Date</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-16" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow
            key={invoice.id}
            className="group/row cursor-pointer"
            onClick={() => router.push(`/invoices/${invoice.id}`)}
          >
            <TableCell className="font-medium">
              {invoice.invoice_number}
            </TableCell>
            <TableCell>{invoice.client_name}</TableCell>
            <TableCell>
              {invoice.issue_date
                ? new Date(invoice.issue_date).toLocaleDateString("nl-NL")
                : ""}
            </TableCell>
            <TableCell>
              {invoice.due_date
                ? new Date(invoice.due_date).toLocaleDateString("nl-NL")
                : ""}
            </TableCell>
            <TableCell className="text-right">
              {invoice.total != null ? formatCurrency(invoice.total) : ""}
            </TableCell>
            <TableCell>
              <div className="flex items-center justify-end gap-1">
                <InvoiceQuickEdit invoice={invoice} />
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="opacity-0 group-hover/row:opacity-100"
                  aria-label="View invoice"
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={`/invoices/${invoice.id}`}>
                    <ExternalLink className="size-3.5" />
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
