import { createClient } from "@/lib/supabase/server";
import { getNextInvoiceNumber } from "../actions";
import { InvoiceForm } from "@/components/invoice-form";
import type { BreadcrumbItemData } from "@/components/breadcrumbs";

const breadcrumbs: BreadcrumbItemData[] = [
  { label: "Invoices", href: "/invoices" },
  { label: "New Invoice" },
];

export default async function NewInvoicePage() {
  const supabase = await createClient();

  const defaultInvoiceNumber = await getNextInvoiceNumber();

  const { data: settings } = await supabase
    .from("company_settings")
    .select("default_tax_rate")
    .single();

  const defaultTaxRate = settings?.default_tax_rate ?? 21;

  return (
    <InvoiceForm
      defaultInvoiceNumber={defaultInvoiceNumber}
      defaultTaxRate={defaultTaxRate}
      breadcrumbs={breadcrumbs}
    />
  );
}
