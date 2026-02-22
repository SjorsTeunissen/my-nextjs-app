import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NavSidebar } from "@/components/nav-sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
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
    <div className="flex h-dvh">
      <ThemeSync initialTheme={themePreference} />
      <NavSidebar userEmail={user.email ?? ""} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-12 items-center border-b px-4 md:hidden">
          <MobileSidebar userEmail={user.email ?? ""} />
          <span className="ml-2 text-sm font-semibold">Invoice Generator</span>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
