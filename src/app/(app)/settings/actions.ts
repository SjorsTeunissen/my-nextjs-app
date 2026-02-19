"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveCompanySettings(
  _prevState: unknown,
  formData: FormData
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const company_name = formData.get("company_name") as string;
  const address_line1 = formData.get("address_line1") as string;
  const address_line2 = formData.get("address_line2") as string;
  const city = formData.get("city") as string;
  const postal_code = formData.get("postal_code") as string;
  const country = formData.get("country") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const bank_name = formData.get("bank_name") as string;
  const bank_iban = formData.get("bank_iban") as string;
  const bank_bic = formData.get("bank_bic") as string;
  const vat_number = formData.get("vat_number") as string;
  const default_tax_rate = parseFloat(
    formData.get("default_tax_rate") as string
  );

  // Fetch existing row ID
  const { data: existing } = await supabase
    .from("company_settings")
    .select("id")
    .single();

  const { error } = await supabase
    .from("company_settings")
    .update({
      company_name,
      address_line1,
      address_line2,
      city,
      postal_code,
      country,
      email,
      phone,
      bank_name,
      bank_iban,
      bank_bic,
      vat_number,
      default_tax_rate,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", existing!.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  return { success: true };
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const file = formData.get("logo") as File;

  if (!file) {
    return { error: "No file provided" };
  }

  // Validate file type
  const allowedTypes = ["image/png", "image/jpeg"];
  if (!allowedTypes.includes(file.type)) {
    return { error: "Only PNG and JPEG images are allowed" };
  }

  // Validate file size (2MB max)
  const maxSize = 2 * 1024 * 1024;
  if (file.size > maxSize) {
    return { error: "File size must be less than 2MB" };
  }

  // Upload to Supabase Storage
  const ext = file.name.split(".").pop();
  const filename = `logo-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(filename, file, { upsert: true });

  if (uploadError) {
    return { error: uploadError.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("company-logos").getPublicUrl(filename);

  // Update company_settings with the logo URL
  const { data: existing } = await supabase
    .from("company_settings")
    .select("id")
    .single();

  await supabase
    .from("company_settings")
    .update({
      logo_url: publicUrl,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq("id", existing!.id);

  revalidatePath("/settings");
  return { success: true, logoUrl: publicUrl };
}
