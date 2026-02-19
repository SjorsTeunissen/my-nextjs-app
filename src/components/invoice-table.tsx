"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  const router = useRouter();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="size-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      {invoices.length === 0 ? (
        <p className="text-muted-foreground">
          No invoices yet. Create your first invoice.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Issue Date</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow
                key={invoice.id}
                className="cursor-pointer"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <TableCell>{invoice.invoice_number}</TableCell>
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
                <TableCell>
                  {invoice.total != null ? formatCurrency(invoice.total) : ""}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
