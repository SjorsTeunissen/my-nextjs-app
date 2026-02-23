# PLAN: SER-45 -- Restyle App Shell & Navigation Sidebar

## Approach

Extract shared nav configuration to `src/lib/nav-config.ts`, then restyle `app-shell.tsx`, `nav-sidebar.tsx`, and `mobile-sidebar.tsx` to use Ink & Ledger tokens (canvas background, border-r separation, warm hover states, Body typography). Update both test files.

## File Changes

### 1. CREATE: src/lib/nav-config.ts
**Reference:** src/components/nav-sidebar.tsx:23-37
```tsx
// Current inline nav section definition in nav-sidebar.tsx
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
**Action:** Create a new module exporting the `NavSection` type and `navSections` array. Move icon imports (`FileText`, `Settings`) here. Both `NavSidebar` and `MobileSidebar` will import from this module.

### 2. MODIFY: src/components/app-shell.tsx
**Pattern source:** .interface-design/system.md:148-153
```
App Shell
- Full viewport height (h-dvh), no scrolling on shell itself
- Resizable sidebar (already exists via react-resizable-panels)
- Sidebar: same background as canvas, separated by border only
- Content area: overflow-auto on content, not the shell
- Mobile: sheet-based sidebar trigger
```
**Action:**
- Add `h-dvh` to the `ResizablePanelGroup` className (full viewport height)
- Add `border-r border-border` to the sidebar `ResizablePanel` so it has a visible right border
- Add `overflow-auto` to the content `ResizablePanel`
- Keep all panel IDs unchanged (`sidebar`, `content`) to preserve localStorage persistence
- Keep all existing resize/collapse logic unchanged

### 3. MODIFY: src/components/nav-sidebar.tsx
**Pattern source:** .interface-design/system.md:86-102 (Typography)
```
Body: text-sm font-normal  /* 14px -- default text */
Heading-section: text-sm font-semibold tracking-tight  /* 14px */
```
**Pattern source:** .interface-design/system.md:21 (Sidebar)
```
Sidebar: oklch(0.985 0.005 85)  /* same as canvas -- border-separated, not color-separated */
```
**Action:**
- Remove the inline `navSections` array and `NavSection` interface; import both from `@/lib/nav-config`
- Remove unused icon imports (`FileText`, `Settings`) that were only used for nav config
- Change aside `className` from `bg-sidebar text-sidebar-foreground` to `bg-background text-foreground` (canvas background)
- Change nav item links: replace `hover:bg-sidebar-accent hover:text-sidebar-accent-foreground` with `hover:bg-accent/60 hover:text-accent-foreground` (warm surface shift)
- Change active nav item: replace `bg-sidebar-accent text-sidebar-accent-foreground` with `bg-accent text-accent-foreground`
- Apply Body typography (`text-sm font-normal`) to nav item links (replace `text-sm font-medium`)
- Polish workspace header: use `text-sm font-semibold tracking-tight` for company name (Heading-section)
- Keep all existing functionality: collapse, theme toggle, search, section toggle, signout

### 4. MODIFY: src/components/mobile-sidebar.tsx
**Reference:** src/components/nav-sidebar.tsx (after restyling)
**Action:**
- Remove inline `navItems` array and icon imports (`FileText`, `Settings`)
- Import `navSections` from `@/lib/nav-config`
- Flatten sections into nav items for rendering (iterate `navSections.flatMap(s => s.items)`)
- Apply same Ink & Ledger nav item styling as desktop: `hover:bg-accent/60 hover:text-accent-foreground`, Body typography (`text-sm font-normal`)
- Change active state: `bg-accent text-accent-foreground`
- Update SheetContent: add `bg-background` for canvas background consistency

### 5. MODIFY: src/__tests__/nav-sidebar-theme.test.tsx
**Reference:** Current test file at src/__tests__/nav-sidebar-theme.test.tsx
**Concrete test cases:**
1. "renders nav-sidebar with canvas background (bg-background)" -- check aside element has `bg-background` class
2. "renders nav items with Body typography (text-sm font-normal)" -- check nav links have correct classes
3. "displays company name with Heading-section typography" -- check workspace header h1 classes
4. Existing tests remain: theme toggle, collapse, section headers, section collapse, logoUrl

### 6. MODIFY: src/__tests__/mobile-sidebar.test.tsx
**Reference:** Current test file at src/__tests__/mobile-sidebar.test.tsx
**Concrete test cases:**
1. "renders nav items from shared nav-config" -- verify items from `navSections` appear
2. "applies canvas background to sheet content" -- check SheetContent has `bg-background`
3. Existing tests remain: hamburger button, opens sheet, nav links, user email

## Reusable Utilities
- `cn` from `src/lib/utils.ts:4` -- conditional class merging, used throughout
- `useKeyboardShortcuts` from `src/hooks/use-keyboard-shortcuts.ts:36` -- already in nav-sidebar, no changes needed

## Out of Scope
- DO NOT modify `src/app/(app)/layout.tsx` (belongs to SER-46)
- DO NOT modify `src/components/page-header.tsx` (belongs to SER-46)
- DO NOT modify `src/app/globals.css` (already styled by SER-43)
- DO NOT modify `src/components/sidebar-search.tsx` (reference only)
- DO NOT change ResizablePanelGroup panel IDs (would break localStorage persistence)
