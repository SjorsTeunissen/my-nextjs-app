"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  LineItemsEditor,
  type LineItemRow,
} from "@/components/line-items-editor";
import { createInvoice, updateInvoice } from "@/app/(app)/invoices/actions";
import type { Database } from "@/lib/types/database";
import { PageHeader } from "@/components/page-header";

type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
type LineItemDb = Database["public"]["Tables"]["invoice_line_items"]["Row"];

interface InvoiceFormProps {
  invoice?: Invoice;
  lineItems?: LineItemDb[];
  defaultInvoiceNumber: string;
  defaultTaxRate: number;
}

export function InvoiceForm({
  invoice,
  lineItems,
  defaultInvoiceNumber,
  defaultTaxRate,
}: InvoiceFormProps) {
  const isEditing = !!invoice;

  const [invoiceNumber, setInvoiceNumber] = useState(
    invoice?.invoice_number ?? defaultInvoiceNumber
  );
  const [issueDate, setIssueDate] = useState(
    invoice?.issue_date ?? new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState(invoice?.due_date ?? "");
  const [taxRate, setTaxRate] = useState(
    invoice?.tax_rate ?? defaultTaxRate
  );
  const [clientName, setClientName] = useState(invoice?.client_name ?? "");
  const [clientAddress, setClientAddress] = useState(
    invoice?.client_address ?? ""
  );
  const [clientCity, setClientCity] = useState(invoice?.client_city ?? "");
  const [clientPostalCode, setClientPostalCode] = useState(
    invoice?.client_postal_code ?? ""
  );
  const [clientCountry, setClientCountry] = useState(
    invoice?.client_country ?? ""
  );
  const [clientEmail, setClientEmail] = useState(
    invoice?.client_email ?? ""
  );
  const [clientPhone, setClientPhone] = useState(
    invoice?.client_phone ?? ""
  );
  const [clientVatNumber, setClientVatNumber] = useState(
    invoice?.client_vat_number ?? ""
  );

  const [items, setItems] = useState<LineItemRow[]>(() => {
    if (lineItems && lineItems.length > 0) {
      return lineItems
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        .map((li) => ({
          id: li.id,
          description: li.description ?? "",
          quantity: li.quantity ?? 0,
          unit_price: li.unit_price ?? 0,
        }));
    }
    return [
      {
        id: crypto.randomUUID(),
        description: "",
        quantity: 1,
        unit_price: 0,
      },
    ];
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const formData = {
      invoice_number: invoiceNumber,
      issue_date: issueDate,
      due_date: dueDate || null,
      tax_rate: taxRate,
      client_name: clientName,
      client_address: clientAddress || null,
      client_city: clientCity || null,
      client_postal_code: clientPostalCode || null,
      client_country: clientCountry || null,
      client_email: clientEmail || null,
      client_phone: clientPhone || null,
      client_vat_number: clientVatNumber || null,
      line_items: items.map((item, index) => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        sort_order: index,
      })),
    };

    let result;
    if (isEditing) {
      result = await updateInvoice(invoice.id, formData);
    } else {
      result = await createInvoice(formData);
    }

    if (result?.error) {
      setError(result.error);
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <PageHeader
        title={isEditing ? "Edit Invoice" : "New Invoice"}
        actions={
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Invoice Details */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Invoice Details</h2>
        <Separator className="mt-2 mb-3" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label htmlFor="invoice_number">Invoice Number</Label>
            <Input
              id="invoice_number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issue_date">Issue Date</Label>
            <Input
              id="issue_date"
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tax_rate">Tax Rate (%)</Label>
            <Input
              id="tax_rate"
              type="number"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </section>

      {/* Client Details */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Client Details</h2>
        <Separator className="mt-2 mb-3" />
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="client_name">Client Name</Label>
            <Input
              id="client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="client_address">Address</Label>
            <Input
              id="client_address"
              value={clientAddress}
              onChange={(e) => setClientAddress(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="client_city">City</Label>
              <Input
                id="client_city"
                value={clientCity}
                onChange={(e) => setClientCity(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_postal_code">Postal Code</Label>
              <Input
                id="client_postal_code"
                value={clientPostalCode}
                onChange={(e) => setClientPostalCode(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_country">Country</Label>
              <Input
                id="client_country"
                value={clientCountry}
                onChange={(e) => setClientCountry(e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="client_email">Email</Label>
              <Input
                id="client_email"
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_phone">Phone</Label>
              <Input
                id="client_phone"
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="client_vat_number">VAT Number</Label>
              <Input
                id="client_vat_number"
                value={clientVatNumber}
                onChange={(e) => setClientVatNumber(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Line Items */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground">Line Items</h2>
        <Separator className="mt-2 mb-3" />
        <LineItemsEditor
          items={items}
          taxRate={taxRate}
          onChange={setItems}
        />
      </section>
    </form>
  );
}
