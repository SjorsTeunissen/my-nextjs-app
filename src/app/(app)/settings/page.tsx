import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export { SettingsForm };

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("company_settings")
    .select("*")
    .single();

  return <SettingsForm data={data!} />;
}
