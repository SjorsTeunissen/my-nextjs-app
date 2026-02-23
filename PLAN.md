# PLAN: SER-43 - Foundation: Install dependencies & update CSS tokens

## Overview

Replace all CSS custom property VALUES in `globals.css` with Ink & Ledger oklch palette from `.interface-design/system.md`. Install sonner (toast notifications) and shadcn breadcrumb component. Add `<Toaster />` to root layout. Update color token tests to validate new values.

## File Changes

### 1. MODIFY: src/app/globals.css
**Pattern source:** `.interface-design/system.md` lines 13-83
```
Light Mode Mapping (system.md primitive -> CSS variable):
Canvas:           oklch(0.985 0.005 85)     -> --background, --sidebar
Surface:          oklch(0.995 0.003 85)     -> --card
Surface-raised:   oklch(1.0 0.0 0)          -> --popover
Ink:              oklch(0.205 0.015 260)    -> --foreground, --card-foreground, --popover-foreground, --sidebar-foreground
Ink-secondary:    oklch(0.45 0.01 260)      -> --muted-foreground
Navy:             oklch(0.40 0.12 260)      -> --primary, --ring, --sidebar-primary, --sidebar-ring
Navy-subtle:      oklch(0.95 0.02 260)      -> --secondary, --accent, --sidebar-accent
Stamp-red:        oklch(0.55 0.20 25)       -> --destructive
Border:           oklch(0.88 0.005 85)      -> --border, --sidebar-border
Input-border:     oklch(0.85 0.006 85)      -> --input
--muted:           oklch(0.97 0.003 85)     (slightly darker than canvas, warm tinted)
--primary-foreground:   oklch(0.985 0.005 85)   (Canvas - light text on navy)
--secondary-foreground: oklch(0.205 0.015 260)  (Ink)
--accent-foreground:    oklch(0.205 0.015 260)  (Ink)
--sidebar-primary-foreground: oklch(0.985 0.005 85)
--sidebar-accent-foreground:  oklch(0.205 0.015 260)

Dark Mode Mapping:
Canvas:           oklch(0.16 0.008 260)     -> --background, --sidebar
Surface:          oklch(0.20 0.010 260)     -> --card
Surface-raised:   oklch(0.24 0.010 260)     -> --popover
Ink:              oklch(0.93 0.005 85)      -> --foreground, --card-foreground, --popover-foreground, --sidebar-foreground
Ink-secondary:    oklch(0.72 0.008 85)      -> --muted-foreground
Navy:             oklch(0.65 0.14 260)      -> --primary, --ring, --sidebar-primary, --sidebar-ring
Navy-subtle:      oklch(0.22 0.03 260)      -> --secondary, --accent, --sidebar-accent
Stamp-red:        oklch(0.65 0.16 25)       -> --destructive
Border:           oklch(1 0 0 / 10%)        -> --border, --sidebar-border
Input-border:     oklch(1 0 0 / 12%)        -> --input
--muted:           oklch(0.22 0.015 260)    (navy-subtle adjacent)
--primary-foreground:   oklch(0.16 0.008 260)   (Canvas dark)
--secondary-foreground: oklch(0.93 0.005 85)    (Ink dark)
--accent-foreground:    oklch(0.93 0.005 85)    (Ink dark)
--sidebar-primary-foreground: oklch(0.16 0.008 260)
--sidebar-accent-foreground:  oklch(0.93 0.005 85)
```

Chart colors harmonized with Ink & Ledger palette:
```
Light:
--chart-1: oklch(0.40 0.12 260)   (Navy)
--chart-2: oklch(0.52 0.14 155)   (Ledger-green)
--chart-3: oklch(0.65 0.16 75)    (Amber)
--chart-4: oklch(0.55 0.20 25)    (Stamp-red)
--chart-5: oklch(0.45 0.01 260)   (Ink-secondary)

Dark:
--chart-1: oklch(0.65 0.14 260)   (Navy dark)
--chart-2: oklch(0.62 0.12 155)   (Ledger-green dark)
--chart-3: oklch(0.72 0.14 75)    (Amber dark)
--chart-4: oklch(0.65 0.16 25)    (Stamp-red dark)
--chart-5: oklch(0.72 0.008 85)   (Ink-secondary dark)
```

**Action:** Replace ALL color variable values in `:root` and `.dark` blocks. Keep variable NAMES unchanged. Keep `--radius`, `@theme inline` structure, animation keyframes, and `prefers-reduced-motion` untouched.

### 2. MODIFY: src/app/layout.tsx
**Reference:** Current layout at lines 1-28
```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
```
**Action:** Import `Toaster` from `sonner` and render `<Toaster />` inside `<body>` after `<ThemeProvider>`.

### 3. MODIFY: src/__tests__/color-tokens.test.ts
**Reference:** Current test at lines 1-87
```ts
// Current test validates violet axis (270-290 hue) for VIOLET_TOKENS
// Ink & Ledger uses navy hue ~260 which is OUTSIDE 270-290 range
// Need to rewrite tests to validate the actual Ink & Ledger palette values
```

**Concrete test cases:**
1. "light :root --primary matches Navy oklch(0.40 0.12 260)"
2. "light :root --background matches Canvas oklch(0.985 0.005 85)"
3. "light :root --destructive matches Stamp-red oklch(0.55 0.20 25)"
4. "light :root --border matches Border oklch(0.88 0.005 85)"
5. "dark .dark --primary matches dark Navy oklch(0.65 0.14 260)"
6. "dark .dark --background matches dark Canvas oklch(0.16 0.008 260)"
7. "dark .dark --destructive matches dark Stamp-red oklch(0.65 0.16 25)"
8. "@theme inline structure preserved"
9. "animation keyframes untouched"
10. "prefers-reduced-motion query untouched"

**Test approach:** Replace the violet axis validation with exact value matching for each token against the Ink & Ledger palette. The `extractOklchTokens` helper needs to also handle `oklch(L C H / alpha%)` syntax for dark mode border/input tokens.

## Installation Steps (before code changes)
1. `npm install sonner` -- toast notification library
2. `npx shadcn@latest add sonner` -- shadcn sonner wrapper component
3. `npx shadcn@latest add breadcrumb` -- shadcn breadcrumb component

## Reusable Utilities
- `cn` from `src/lib/utils.ts:4` (not directly needed for this issue)

## Out of Scope
- DO NOT modify `src/components/ui/*.tsx` (belongs to SER-44)
- DO NOT modify `src/components/*.tsx` (belongs to later issues)
- DO NOT change CSS variable NAMES -- only VALUES
- DO NOT modify animation keyframes or prefers-reduced-motion query
- DO NOT modify `@theme inline` block structure
