import { createClient } from "@/lib/supabase/server";
import { InvoiceTable } from "@/components/invoice-table";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .order("issue_date", { ascending: false });

  return <InvoiceTable invoices={invoices ?? []} />;
}
