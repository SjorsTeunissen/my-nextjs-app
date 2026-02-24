"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { signOut } from "@/app/login/actions";
import { saveThemePreference } from "@/app/(app)/settings/theme-actions";
import { cn } from "@/lib/utils";
import { SidebarSearch } from "@/components/sidebar-search";
import { navSections } from "@/lib/nav-config";

interface NavSidebarProps {
  userEmail: string;
  companyName: string;
  logoUrl: string | null;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function NavSidebar({
  userEmail,
  companyName,
  logoUrl,
  collapsed,
  onToggleCollapse,
}: NavSidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string) => {
    setCollapsedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      data-testid="nav-sidebar"
      className="flex h-full flex-col bg-background text-foreground"
    >
      {/* Workspace Header */}
      <div className={cn("border-b p-4", collapsed && "px-2 py-4")}>
        {collapsed ? (
          <div className="flex justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt={companyName} className="size-5 rounded" />
            ) : (
              <FileText className="size-5 text-primary" aria-hidden="true" />
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {logoUrl && (
              <img src={logoUrl} alt={companyName} className="size-6 rounded" />
            )}
            <h1 className="truncate text-sm font-semibold tracking-tight">{companyName}</h1>
          </div>
        )}
      </div>

      {/* Search */}
      {!collapsed && <SidebarSearch />}

      {/* Nav Sections */}
      <nav className="flex-1 space-y-1 p-2">
        {navSections.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleSection(section.label)}
                aria-expanded={!collapsedSections[section.label]}
                className="flex w-full items-center justify-between rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
              >
                {section.label}
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "size-3 transition-transform duration-200",
                    collapsedSections[section.label] && "-rotate-90"
                  )}
                />
              </button>
            )}
            {!collapsedSections[section.label] && (
              <div className="section-expand motion-reduce:transition-none">
                <div className="overflow-hidden">
                  {section.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-label={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center rounded-md text-sm transition-colors hover:bg-accent/60 hover:text-accent-foreground",
                        collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                        pathname.startsWith(item.href) &&
                          "bg-accent text-accent-foreground"
                      )}
                    >
                      <item.icon className="size-4 shrink-0" />
                      {!collapsed && item.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("border-t p-4", collapsed && "p-2")}>
        {!collapsed ? (
          <>
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
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </form>
          </>
        ) : (
          <>
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
          </>
        )}
        <Button
          data-testid="sidebar-collapse-toggle"
          variant="ghost"
          size={!collapsed ? "sm" : "icon-sm"}
          className={cn(
            !collapsed
              ? "mt-2 w-full justify-start"
              : "mx-auto mt-2 flex"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggleCollapse}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4" />
          ) : (
            <PanelLeftClose className="size-4" />
          )}
          {!collapsed && (collapsed ? "Expand" : "Collapse")}
        </Button>
      </div>
    </aside>
  );
}
