"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

const shortcutEntries = [
  { keys: ["N"], description: "New invoice" },
  { keys: ["G", "I"], description: "Go to invoices" },
  { keys: ["G", "S"], description: "Go to settings" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
];

export function KeyboardShortcutIndicator() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "n",
        action: () => router.push("/invoices/new"),
        description: "New invoice",
      },
      {
        key: "?",
        action: () => setOpen(true),
        description: "Show keyboard shortcuts",
      },
    ],
    sequences: [
      {
        keys: ["g", "i"],
        action: () => router.push("/invoices"),
        description: "Go to invoices",
      },
      {
        keys: ["g", "s"],
        action: () => router.push("/settings"),
        description: "Go to settings",
      },
    ],
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Available keyboard shortcuts for quick navigation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {shortcutEntries.map((entry) => (
            <div
              key={entry.description}
              className="flex items-center justify-between rounded-md border px-3 py-2"
            >
              <span className="text-sm">{entry.description}</span>
              <div className="flex gap-1">
                {entry.keys.map((key, i) => (
                  <span key={i}>
                    <kbd className="bg-muted text-muted-foreground rounded border px-1.5 py-0.5 text-xs font-mono">
                      {key}
                    </kbd>
                    {i < entry.keys.length - 1 && (
                      <span className="text-muted-foreground mx-1 text-xs">then</span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
