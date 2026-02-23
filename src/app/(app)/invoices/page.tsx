import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { InvoicesClient } from "./invoices-client";

export default async function InvoicesPage() {
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .order("issue_date", { ascending: false });

  return (
    <>
      <PageHeader
        title="Invoices"
        actions={
          <Button size="sm" asChild>
            <Link href="/invoices/new">
              <Plus className="size-4" />
              New Invoice
            </Link>
          </Button>
        }
      />
      <InvoicesClient invoices={invoices ?? []} />
    </>
  );
}
