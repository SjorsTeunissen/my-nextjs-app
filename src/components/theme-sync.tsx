"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

export function ThemeSync({ initialTheme }: { initialTheme: string | null }) {
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (initialTheme === null) return;
    if (initialTheme === theme) return;
    setTheme(initialTheme);
  }, [initialTheme, theme, setTheme]);

  return null;
}
