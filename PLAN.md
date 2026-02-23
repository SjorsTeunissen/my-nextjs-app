# PLAN: SER-44 -- Restyle UI Primitive Components

## Context

SER-43 updated `globals.css` with Ink & Ledger CSS custom properties. The Tailwind theme maps:
- `bg-primary` -> `--primary` (navy oklch(0.40 0.12 260))
- `bg-destructive` -> `--destructive` (stamp-red)
- `bg-card` -> `--card` (warm surface)
- `border` -> `--border` (warm)
- `bg-accent` -> `--accent` (navy-subtle)
- `bg-muted` -> `--muted` (warm tint)
- `--radius: 0.5rem` (8px), `--radius-sm` = 4px, `--radius-md` = 6px

Components already get some of the new palette for free via CSS variables. This task updates
the Tailwind **classes** to match the specific design tokens in system.md (shadows, radii,
heights, new badge variants, sticky headers, etc.).

**Key constraint:** Do NOT modify `globals.css`. Only change UI primitive component files + test file.

## File Changes

### 1. MODIFY: src/components/ui/button.tsx
**Pattern source:** .interface-design/system.md:138-139
```
Radius-sm:  4px   -- buttons, inputs, badges
```
**Current (line 8):** Base classes include `rounded-md` (6px)
**Action:** Change `rounded-md` to `rounded-sm` in the base cva string (line 8). This gives Radius-sm = 4px per system.md. All variant styling already references CSS vars (bg-primary = navy, bg-destructive = stamp-red) so no variant changes needed.

### 2. MODIFY: src/components/ui/input.tsx
**Pattern source:** .interface-design/system.md:45-47, 138-139
```
Input-bg:    oklch(0.975 0.004 85)  -- slightly darker than surface, inset feel
Input-border: oklch(0.85 0.006 85)  -- control border (mapped to --input)
Radius-sm:   4px                     -- buttons, inputs, badges
```
**Current (line 11):** `rounded-md border-input bg-transparent`
**Action:**
- Change `rounded-md` to `rounded-sm` (Radius-sm = 4px)
- Change `bg-transparent` to `bg-input/30` to get the warm inset Input-bg feel

### 3. MODIFY: src/components/ui/card.tsx
**Pattern source:** .interface-design/system.md:122-126, 140, 162-165
```
Elevation-1:  shadow-[0_1px_2px_0_oklch(0_0_0/0.04)] + border
Radius-md:    6px  -- cards, panels, dropdowns
Cards:        p-4 for compact, p-6 for content
```
**Current (line 10):** `rounded-lg border py-4 shadow-xs`
**Action:**
- Change `rounded-lg` to `rounded-md` (Radius-md = 6px)
- Change `shadow-xs` to `shadow-[0_1px_2px_0_oklch(0_0_0/0.04)]` (Elevation-1)
- Keep `py-4` and child `px-4` (matches compact card; consumers can override for p-6 content)

### 4. MODIFY: src/components/ui/badge.tsx
**Pattern source:** .interface-design/system.md:32-39, 139
```
Ledger-green:    oklch(0.52 0.14 155) / bg: oklch(0.95 0.03 155)
Stamp-red:       oklch(0.55 0.20 25)  / bg: oklch(0.95 0.03 25)
Amber:           oklch(0.65 0.16 75)  / bg: oklch(0.95 0.04 75)
Dark variants:   Ledger-green oklch(0.62 0.12 155)/bg oklch(0.20 0.03 155)
                 Stamp-red oklch(0.65 0.16 25)/bg oklch(0.20 0.03 25)
                 Amber oklch(0.72 0.14 75)/bg oklch(0.20 0.03 75)
Radius-sm:       4px -- buttons, inputs, badges
```
**Current (line 8):** `rounded-full` base, variants: default/secondary/destructive/outline/ghost/link
**Action:**
- Change `rounded-full` to `rounded-sm` (Radius-sm = 4px)
- Add `success` variant with ledger-green tinted bg + text
- Update `destructive` variant to use tinted bg (stamp-red-bg + stamp-red text) instead of solid bg
- Add `warning` variant with amber tinted bg + text
- Keep existing default, secondary, outline, ghost, link variants

### 5. MODIFY: src/components/ui/separator.tsx
**Current:** Uses `bg-border` which maps to `--border` (warm border from SER-43).
**Action:** No changes needed -- already correct via CSS variable inheritance.

### 6. MODIFY: src/components/ui/table.tsx
**Pattern source:** .interface-design/system.md:167-174, 92
```
Row height: 44px (h-11)
Header: Heading-label style (text-xs font-medium uppercase tracking-wider), sticky
Row hover: subtle surface shift
Selected: navy-subtle background (bg-secondary)
```
**Current:**
- TableRow (line 59-60): `hover:bg-muted/50 data-[state=selected]:bg-muted border-b` (no height)
- TableHead (line 72-73): `h-8 px-2 text-left align-middle font-medium` (no sticky/uppercase)
- TableHeader (line 26): `[&_tr]:border-b` (no bg)

**Action:**
- TableRow: add `h-11` for 44px row height. Change `data-[state=selected]:bg-muted` to `data-[state=selected]:bg-secondary`
- TableHead: change `h-8` to `h-11`, add `sticky top-0 z-10 bg-background`, add `text-xs uppercase tracking-wider`, remove `text-foreground` (will inherit)
- TableHeader: keep as-is (border on tr)

### 7. MODIFY: src/components/ui/skeleton.tsx
**Pattern source:** .interface-design/system.md:188-191
```
Skeleton Loading: Pulse animation on surface-colored rectangles
```
**Current (line 7):** `bg-accent animate-pulse rounded-md`
**Action:** Change `bg-accent` to `bg-muted` for warm surface tint instead of navy-subtle.

### 8. MODIFY: src/__tests__/ui-components-restyled.test.tsx
**Action:** Rewrite tests to match new classes. Import Badge and Skeleton.

**Concrete test cases:**
1. "Button default uses bg-primary" (navy via CSS var)
2. "Button uses rounded-sm" (Radius-sm)
3. "Button preserves all variant names"
4. "Button preserves data-slot, data-variant, data-size attributes"
5. "Input uses rounded-sm" (was rounded-md)
6. "Input uses bg-input/30"
7. "Card uses Elevation-1 shadow"
8. "Card uses rounded-md" (was rounded-lg)
9. "CardHeader uses px-4"
10. "CardContent uses px-4"
11. "Badge uses rounded-sm" (was rounded-full)
12. "Badge success variant renders"
13. "Badge destructive variant renders"
14. "Badge warning variant renders"
15. "TableRow uses h-11" (44px)
16. "TableHead uses h-11 and sticky"
17. "TableHead uses uppercase tracking-wider"
18. "Skeleton uses bg-muted" (was bg-accent)
19. "Separator renders with bg-border"

## Reusable Utilities
- `cn` from `src/lib/utils.ts:4` (clsx + tailwind-merge for conditional classes)

## Out of Scope
- DO NOT modify `src/app/globals.css` (belongs to SER-43)
- DO NOT modify `src/components/app-shell.tsx` (belongs to SER-45)
- DO NOT modify `src/components/nav-sidebar.tsx` (belongs to SER-45)
- DO NOT modify any page-level components
- DO NOT add size variants to Badge beyond what's specified
