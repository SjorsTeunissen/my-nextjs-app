"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { calculateTotals } from "@/lib/invoice-utils";

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  sort_order: number;
}

interface InvoiceFormData {
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  tax_rate: number;
  client_name: string;
  client_address: string | null;
  client_city: string | null;
  client_postal_code: string | null;
  client_country: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_vat_number: string | null;
  line_items: InvoiceLineItem[];
}

export async function createInvoice(data: InvoiceFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const totals = calculateTotals(data.line_items, data.tax_rate);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      invoice_number: data.invoice_number,
      issue_date: data.issue_date,
      due_date: data.due_date,
      tax_rate: data.tax_rate,
      client_name: data.client_name,
      client_address: data.client_address,
      client_city: data.client_city,
      client_postal_code: data.client_postal_code,
      client_country: data.client_country,
      client_email: data.client_email,
      client_phone: data.client_phone,
      client_vat_number: data.client_vat_number,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total: totals.total,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (invoiceError) {
    return { error: invoiceError.message };
  }

  if (data.line_items.length > 0) {
    const { error: lineItemsError } = await supabase
      .from("invoice_line_items")
      .insert(
        data.line_items.map((item) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
          sort_order: item.sort_order,
        }))
      );

    if (lineItemsError) {
      return { error: lineItemsError.message };
    }
  }

  revalidatePath("/invoices");
  redirect("/invoices");
}

export async function updateInvoice(id: string, data: InvoiceFormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const totals = calculateTotals(data.line_items, data.tax_rate);

  const { error: invoiceError } = await supabase
    .from("invoices")
    .update({
      invoice_number: data.invoice_number,
      issue_date: data.issue_date,
      due_date: data.due_date,
      tax_rate: data.tax_rate,
      client_name: data.client_name,
      client_address: data.client_address,
      client_city: data.client_city,
      client_postal_code: data.client_postal_code,
      client_country: data.client_country,
      client_email: data.client_email,
      client_phone: data.client_phone,
      client_vat_number: data.client_vat_number,
      subtotal: totals.subtotal,
      tax_amount: totals.taxAmount,
      total: totals.total,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (invoiceError) {
    return { error: invoiceError.message };
  }

  // Delete all existing line items, then insert new ones (replace strategy)
  const { error: deleteError } = await supabase
    .from("invoice_line_items")
    .delete()
    .eq("invoice_id", id);

  if (deleteError) {
    return { error: deleteError.message };
  }

  if (data.line_items.length > 0) {
    const { error: lineItemsError } = await supabase
      .from("invoice_line_items")
      .insert(
        data.line_items.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
          sort_order: item.sort_order,
        }))
      );

    if (lineItemsError) {
      return { error: lineItemsError.message };
    }
  }

  revalidatePath("/invoices");
  redirect("/invoices");
}

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

export interface QuickUpdateData {
  issue_date?: string | null;
  due_date?: string | null;
  client_name?: string | null;
  subtotal?: number | null;
  total?: number | null;
}

export async function quickUpdateInvoice(id: string, data: QuickUpdateData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("invoices")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

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
