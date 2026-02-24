import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/invoice-form";
import { PdfDownloadButtonWrapper } from "@/components/pdf-download-button-wrapper";
import type { BreadcrumbItemData } from "@/components/breadcrumbs";

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

  const { data: companySettings } = await supabase
    .from("company_settings")
    .select("*")
    .single();

  const defaultTaxRate = companySettings?.default_tax_rate ?? 21;

  const breadcrumbs: BreadcrumbItemData[] = [
    { label: "Invoices", href: "/invoices" },
    { label: invoice.invoice_number },
    { label: "Edit" },
  ];

  return (
    <InvoiceForm
      invoice={invoice}
      lineItems={lineItems ?? []}
      defaultInvoiceNumber={invoice.invoice_number}
      defaultTaxRate={defaultTaxRate}
      breadcrumbs={breadcrumbs}
      extraActions={
        companySettings && (
          <PdfDownloadButtonWrapper
            invoice={invoice}
            lineItems={lineItems ?? []}
            companySettings={companySettings}
          />
        )
      }
    />
  );
}
