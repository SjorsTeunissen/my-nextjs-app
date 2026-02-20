import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavSidebar } from "@/components/nav-sidebar";
import { ThemeSync } from "@/components/theme-sync";
import { getThemePreference } from "@/app/(app)/settings/theme-actions";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const themePreference = await getThemePreference();

  return (
    <div className="flex h-screen">
      <ThemeSync initialTheme={themePreference} />
      <NavSidebar userEmail={user.email ?? ""} />
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
