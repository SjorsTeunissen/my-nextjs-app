"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  Settings,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
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
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside
      className={cn(
        "hidden md:flex h-dvh flex-col border-r bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className={cn("border-b p-4", collapsed && "px-2")}>
        {!collapsed && (
          <h1 className="truncate text-sm font-semibold">Invoice Generator</h1>
        )}
        {collapsed && (
          <div className="flex justify-center">
            <FileText className="size-5 text-sidebar-primary" aria-hidden="true" />
          </div>
        )}
      </div>
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-label={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center rounded-md text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
              pathname.startsWith(item.href) &&
                "bg-sidebar-accent text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>
      <div className={cn("border-t p-4", collapsed && "p-2")}>
        {!collapsed && (
          <p className="mb-2 truncate text-xs text-muted-foreground">
            {userEmail}
          </p>
        )}
        {!collapsed && (
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
        )}
        {collapsed && (
          <Button
            data-testid="theme-toggle"
            variant="ghost"
            size="icon-sm"
            className="mx-auto flex"
            aria-label={theme === "dark" ? "Dark mode" : "Light mode"}
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
          </Button>
        )}
        {!collapsed && (
          <form action={signOut}>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <LogOut className="size-4" />
              Sign Out
            </Button>
          </form>
        )}
        {collapsed && (
          <form action={signOut}>
            <Button
              variant="ghost"
              size="icon-sm"
              className="mx-auto flex"
              aria-label="Sign Out"
            >
              <LogOut className="size-4" />
            </Button>
          </form>
        )}
        <Button
          data-testid="sidebar-collapse-toggle"
          variant="ghost"
          size={collapsed ? "icon-sm" : "sm"}
          className={cn(
            collapsed ? "mx-auto mt-2 flex" : "mt-2 w-full justify-start"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
          {!collapsed && "Collapse"}
        </Button>
      </div>
    </aside>
  );
}
