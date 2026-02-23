import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { ThemeSync } from "@/components/theme-sync";
import { CommandPalette } from "@/components/command-palette";
import { KeyboardShortcutIndicator } from "@/components/keyboard-shortcut-indicator";
import { getThemePreference } from "@/app/(app)/settings/theme-actions";
import { AppShell } from "@/components/app-shell";

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

  const [themePreference, { data: companySettings }] = await Promise.all([
    getThemePreference(),
    supabase.from("company_settings").select("company_name, logo_url").single(),
  ]);

  return (
    <div className="flex h-dvh">
      <ThemeSync initialTheme={themePreference} />
      <CommandPalette />
      <KeyboardShortcutIndicator />
      <AppShell
        userEmail={user.email ?? ""}
        companyName={companySettings?.company_name ?? "Invoice Generator"}
        logoUrl={companySettings?.logo_url ?? null}
      >
        <div className="flex flex-1 flex-col overflow-hidden">
          <header className="flex h-12 items-center border-b px-4 md:hidden">
            <MobileSidebar userEmail={user.email ?? ""} />
            <span className="ml-2 text-sm font-semibold">Invoice Generator</span>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      </AppShell>
    </div>
  );
}
