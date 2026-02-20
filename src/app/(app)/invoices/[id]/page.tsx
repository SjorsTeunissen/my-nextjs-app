import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/invoice-form";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (!invoice) {
    notFound();
  }

  const { data: lineItems } = await supabase
    .from("invoice_line_items")
    .select("*")
    .eq("invoice_id", id)
    .order("sort_order", { ascending: true });

  const { data: settings } = await supabase
    .from("company_settings")
    .select("default_tax_rate")
    .single();

  const defaultTaxRate = settings?.default_tax_rate ?? 21;

  return (
    <InvoiceForm
      invoice={invoice}
      lineItems={lineItems ?? []}
      defaultInvoiceNumber={invoice.invoice_number}
      defaultTaxRate={defaultTaxRate}
    />
  );
}
