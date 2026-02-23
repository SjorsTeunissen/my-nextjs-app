# SER-45: Restyle App Shell & Navigation Sidebar

## Summary
Apply Ink & Ledger styling to the app shell, desktop NavSidebar, and MobileSidebar. Extract shared nav configuration to `src/lib/nav-config.ts` to eliminate duplication between desktop and mobile nav components.

## File Changes

### 1. CREATE: src/lib/nav-config.ts
**Reference:** src/components/nav-sidebar.tsx:23-37 (current inline nav config)
```tsx
// Current inline config in nav-sidebar.tsx:
interface NavSection {
  label: string;
  items: { href: string; label: string; icon: React.ComponentType<{ className?: string }> }[];
}

const navSections: NavSection[] = [
  {
    label: "Main",
    items: [{ href: "/invoices", label: "Invoices", icon: FileText }],
  },
  {
    label: "Settings",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];
```
**Action:** Create a new file exporting `NavSection` type and `navSections` array with the same structure. Import `FileText` and `Settings` icons from lucide-react. Both `NavSidebar` and `MobileSidebar` will import from here.

### 2. MODIFY: src/components/app-shell.tsx
**Pattern source:** .interface-design/system.md lines 148-153
```
### App Shell
- Full viewport height (`h-dvh`), no scrolling on shell itself
- Resizable sidebar (already exists via react-resizable-panels)
- Sidebar: same background as canvas, separated by border only
- Content area: overflow-auto on content, not the shell
- Mobile: sheet-based sidebar trigger
```
**Action:**
- Add `border-r` class to the sidebar `ResizablePanel` to ensure clear border separation from content area.
- Add `overflow-auto` to the content `ResizablePanel` to ensure scrolling is on content, not shell.
- Keep all panel IDs unchanged (`sidebar`, `content`) to preserve localStorage persistence.
- Keep `ResizablePanelGroup` structure and collapse logic intact.

### 3. MODIFY: src/components/nav-sidebar.tsx
**Pattern source:** .interface-design/system.md lines 86-102 (Typography) and lines 148-153 (App Shell)
```
Body: text-sm font-normal  /* 14px -- default text */
Heading-section: text-sm font-semibold tracking-tight
```
**Action:**
- Remove inline `navSections` array and `NavSection` interface (lines 23-37). Import `{ navSections, type NavSection }` from `@/lib/nav-config`.
- Remove `FileText` and `Settings` icon imports from lucide-react (they move to nav-config.ts). Keep `LogOut`, `Sun`, `Moon`, `PanelLeftClose`, `PanelLeftOpen`, `ChevronDown`.
- Change aside `bg-sidebar text-sidebar-foreground` to `bg-background text-foreground` (canvas color).
- Update nav item link classes:
  - Default: `text-sm font-normal` (Body typography)
  - Hover: replace `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` with `hover:bg-muted/50`
  - Active: replace `bg-sidebar-accent text-sidebar-accent-foreground` with `bg-muted text-foreground font-medium`
- Workspace header: add `tracking-tight` to company name `<h1>`.
- Change collapsed logo icon `text-sidebar-primary` to `text-primary`.

### 4. MODIFY: src/components/mobile-sidebar.tsx
**Pattern source:** src/components/nav-sidebar.tsx (after modifications)
```tsx
// Current inline config in mobile-sidebar.tsx:
const navItems = [
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];
```
**Action:**
- Remove inline `navItems` array (lines 20-23). Import `{ navSections }` from `@/lib/nav-config`.
- Remove `FileText` and `Settings` icon imports from lucide-react. Keep `LogOut`, `Menu`, `Sun`, `Moon`.
- Flatten navSections to get all items: `navSections.flatMap(s => s.items)`.
- Update nav item hover: replace `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` with `hover:bg-muted/50`.
- Update active: replace `bg-sidebar-accent text-sidebar-accent-foreground` with `bg-muted text-foreground font-medium`.
- Apply Body typography (`text-sm font-normal`) on nav items.

### 5. MODIFY: src/__tests__/nav-sidebar-theme.test.tsx
**Concrete test cases (additions to existing):**
1. "sidebar container uses bg-background class" -- render NavSidebar, assert aside has bg-background
2. "nav items use warm hover styling (hover:bg-muted/50)" -- render, check link className
3. "active nav item uses bg-muted" -- render with /invoices pathname, check active link
4. "workspace header shows company name with tracking-tight" -- render, check h1 class
5. Keep all existing ThemeSync, theme toggle, collapse, and section header tests unchanged.

### 6. MODIFY: src/__tests__/mobile-sidebar.test.tsx
**Concrete test cases (additions to existing):**
1. "nav items use shared nav-config" -- open sheet, verify nav items match navSections items
2. "nav items use warm hover styling" -- open sheet, check link className includes hover:bg-muted/50
3. Keep all existing hamburger, sheet open, nav links, and user email tests unchanged.

## Reusable Utilities
- `cn` from `src/lib/utils.ts:4` (conditional class merging)
- `useKeyboardShortcuts` from `src/hooks/use-keyboard-shortcuts.ts:36` (already used, no changes)

## Out of Scope
- DO NOT modify `src/app/(app)/layout.tsx` (belongs to SER-46)
- DO NOT modify `src/components/page-header.tsx` (belongs to SER-46)
- DO NOT create `src/components/breadcrumbs.tsx` (belongs to SER-46)
- DO NOT create `src/app/(app)/error.tsx` (belongs to SER-46)
- DO NOT change ResizablePanelGroup panel IDs (breaks localStorage persistence)
- DO NOT add comments, docstrings, or type annotations to unchanged code
