"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { getInvoiceWithLineItems } from "@/app/(app)/invoices/actions";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItem = Database["public"]["Tables"]["invoice_line_items"]["Row"];

interface InvoiceDetailPanelProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoiceDetailPanel({
  invoice,
  onClose,
}: InvoiceDetailPanelProps) {
  const router = useRouter();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    if (!invoice) {
      setLineItems([]);
      return;
    }

    getInvoiceWithLineItems(invoice.id).then((result) => {
      setLineItems(result.lineItems);
    });
  }, [invoice]);

  return (
    <Sheet open={!!invoice} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[480px] sm:max-w-[480px] p-0 flex flex-col data-[state=open]:duration-300 data-[state=closed]:duration-200 data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0"
        data-testid="invoice-detail-panel"
        showCloseButton={false}
      >
        <SheetHeader className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold tracking-tight">{invoice?.invoice_number}</SheetTitle>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Close"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              &times;
            </Button>
          </div>
          <SheetDescription className="sr-only">
            Invoice detail panel
          </SheetDescription>
        </SheetHeader>

        {invoice && (
          <ScrollArea className="flex-1 overflow-auto">
            <div className="px-6 py-4 space-y-6">
              {/* Invoice Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold tracking-tight">{invoice.client_name}</h3>
                    <Badge data-testid="invoice-total-badge" variant="secondary">
                      {invoice.total != null ? formatCurrency(invoice.total) : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground space-y-1">
                    {invoice.issue_date && (
                      <p className="flex items-center gap-2">
                        <span className="text-xs">Issued:</span>
                        <span className="text-sm font-medium tabular-nums">
                          {new Date(invoice.issue_date).toLocaleDateString("nl-NL")}
                        </span>
                      </p>
                    )}
                    {invoice.due_date && (
                      <p className="flex items-center gap-2">
                        <span className="text-xs">Due:</span>
                        <span className="text-sm font-medium tabular-nums">
                          {new Date(invoice.due_date).toLocaleDateString("nl-NL")}
                        </span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Client Details */}
              <Card>
                <CardHeader>
                  <h4 className="text-xs font-medium uppercase tracking-wider">Client Details</h4>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {invoice.client_address && <p>{invoice.client_address}</p>}
                    {(invoice.client_postal_code || invoice.client_city) && (
                      <p>
                        {[invoice.client_postal_code, invoice.client_city]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                    )}
                    {invoice.client_country && <p>{invoice.client_country}</p>}
                    {invoice.client_email && <p>{invoice.client_email}</p>}
                    {invoice.client_phone && <p>{invoice.client_phone}</p>}
                  </div>
                </CardContent>
              </Card>

              {/* Line Items */}
              {lineItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <h4 className="text-xs font-medium uppercase tracking-wider">Line Items</h4>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Qty</TableHead>
                          <TableHead className="text-right">Unit Price</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lineItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.description}</TableCell>
                            <TableCell className="text-right text-sm font-medium tabular-nums">
                              {item.quantity}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium tabular-nums">
                              {item.unit_price != null
                                ? formatCurrency(item.unit_price)
                                : ""}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium tabular-nums">
                              {item.amount != null
                                ? formatCurrency(item.amount)
                                : ""}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Notes */}
              {invoice.notes && (
                <Card>
                  <CardHeader>
                    <h4 className="text-xs font-medium uppercase tracking-wider">Notes</h4>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {invoice.notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Edit Button */}
              <Button
                className="w-full"
                onClick={() => router.push(`/invoices/${invoice.id}`)}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}
