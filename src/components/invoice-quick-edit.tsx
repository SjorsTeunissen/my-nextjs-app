"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil } from "lucide-react";
import { quickUpdateInvoice } from "@/app/(app)/invoices/actions";
import type { Database } from "@/lib/types/database";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

interface InvoiceQuickEditProps {
  invoice: Invoice;
}

export function InvoiceQuickEdit({ invoice }: InvoiceQuickEditProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [clientName, setClientName] = useState(invoice.client_name ?? "");
  const [issueDate, setIssueDate] = useState(invoice.issue_date ?? "");
  const [dueDate, setDueDate] = useState(invoice.due_date ?? "");
  const [total, setTotal] = useState(
    invoice.total != null ? String(invoice.total) : ""
  );

  function resetFields() {
    setClientName(invoice.client_name ?? "");
    setIssueDate(invoice.issue_date ?? "");
    setDueDate(invoice.due_date ?? "");
    setTotal(invoice.total != null ? String(invoice.total) : "");
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetFields();
    }
    setOpen(nextOpen);
  }

  function handleSave() {
    startTransition(async () => {
      await quickUpdateInvoice(invoice.id, {
        client_name: clientName || null,
        issue_date: issueDate || null,
        due_date: dueDate || null,
        total: total ? parseFloat(total) : null,
      });
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon-xs"
          className="opacity-0 group-hover/row:opacity-100"
          aria-label="Quick edit"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="size-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80"
        align="start"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
          }
        }}
      >
        <div className="grid gap-3">
          <h3 className="text-sm font-medium">Quick Edit</h3>
          <div className="grid gap-2">
            <Label htmlFor={`client-${invoice.id}`}>Client Name</Label>
            <Input
              id={`client-${invoice.id}`}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`issue-date-${invoice.id}`}>Issue Date</Label>
            <Input
              id={`issue-date-${invoice.id}`}
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`due-date-${invoice.id}`}>Due Date</Label>
            <Input
              id={`due-date-${invoice.id}`}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor={`total-${invoice.id}`}>Total</Label>
            <Input
              id={`total-${invoice.id}`}
              type="number"
              step="0.01"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
            />
          </div>
          <Button size="sm" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
