"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useTheme } from "next-themes";
import { signOut } from "@/app/login/actions";
import { saveThemePreference } from "@/app/(app)/settings/theme-actions";
import { cn } from "@/lib/utils";
import { navSections } from "@/lib/nav-config";

export function MobileSidebar({ userEmail }: { userEmail: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <>
      <Button
        data-testid="mobile-menu-button"
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
        <span className="sr-only">Open menu</span>
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-64 bg-background p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle className="text-sm font-semibold">
              Invoice Generator
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation menu
            </SheetDescription>
          </SheetHeader>
          <nav className="flex-1 space-y-1 p-2">
            {navSections.flatMap((section) => section.items).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent/60 hover:text-accent-foreground",
                  pathname.startsWith(item.href) &&
                    "bg-accent text-accent-foreground"
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
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
