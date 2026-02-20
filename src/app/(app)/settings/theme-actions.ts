"use server";

import { createClient } from "@/lib/supabase/server";

const VALID_THEMES = ["light", "dark", "system"] as const;

export async function saveThemePreference(theme: string) {
  if (!VALID_THEMES.includes(theme as (typeof VALID_THEMES)[number])) {
    return { error: "Invalid theme value" };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      theme,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function getThemePreference() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return null;
  }

  return data.theme;
}
