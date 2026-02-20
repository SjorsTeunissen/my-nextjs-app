"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Settings, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { signOut } from "@/app/login/actions";
import { saveThemePreference } from "@/app/(app)/settings/theme-actions";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="border-b p-4">
        <h1 className="text-lg font-semibold">Invoice Generator</h1>
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              pathname.startsWith(item.href) &&
                "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <p className="mb-2 truncate text-xs text-muted-foreground">
          {userEmail}
        </p>
        <Button
          data-testid="theme-toggle"
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => {
            const newTheme = theme === "dark" ? "light" : "dark";
            setTheme(newTheme);
            saveThemePreference(newTheme);
          }}
        >
          {theme === "dark" ? (
            <Moon className="size-4" />
          ) : (
            <Sun className="size-4" />
          )}
          {theme === "dark" ? "Dark" : "Light"}
        </Button>
        <form action={signOut}>
          <Button variant="ghost" size="sm" className="w-full justify-start">
            <LogOut className="size-4" />
            Sign Out
          </Button>
        </form>
      </div>
    </aside>
  );
}
