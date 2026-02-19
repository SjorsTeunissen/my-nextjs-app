"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteInvoice(id: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("invoices").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/invoices");
  return { success: true };
}

export async function getNextInvoiceNumber() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("invoices")
    .select("invoice_number")
    .order("invoice_number", { ascending: false })
    .limit(1)
    .single();

  if (!data) {
    return "INV-001";
  }

  const currentNumber = parseInt(data.invoice_number.replace("INV-", ""), 10);
  const nextNumber = currentNumber + 1;
  return `INV-${nextNumber.toString().padStart(3, "0")}`;
}
