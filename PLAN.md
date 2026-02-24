# PLAN: SER-50 -- Restructure Settings with Sidebar Navigation

## Summary

Restructure the settings page from a single long scrolling form into a sidebar-navigation layout with section links. All sections remain in the DOM for FormData submission -- only CSS controls visibility. Add toast on save success/error.

## Scope Files

| File | Action |
|------|--------|
| `src/app/(app)/settings/settings-form.tsx` | Modify (major) |
| `src/app/(app)/settings/page.tsx` | Modify (minor) |
| `src/app/(app)/settings/loading.tsx` | Modify (rewrite) |
| `src/__tests__/settings-page.test.tsx` | Modify (extend) |

**MUST NOT modify:** `src/components/invoice-*.tsx`, `src/components/app-shell.tsx`, `src/components/nav-sidebar.tsx`

## Approach

### 1. `settings-form.tsx` -- Add sidebar navigation within the form

**Current state:** Single scrolling form with 5 sections (Company Information, Address, Contact, Banking, Tax) inside a `<form>`, plus a separate Logo section outside the form. Inline success/error banners for feedback.

**Target state:** Two-column layout:
- Left sidebar (`<nav>`): Section links (Company, Address, Contact, Banking, Tax, Logo). Active section highlighted with `bg-primary/10` (navy-subtle).
- Right content area: Only the active section is visible.
- All sections always rendered in DOM using Tailwind `hidden` class on inactive sections.
- Single `<form>` wraps Company through Tax sections (unchanged -- Logo upload is already separate).
- Toast notification via `sonner` on save success/error, replacing the inline alert banners.

**Implementation details:**

1. Add `useState<string>` for `activeSection` (default: `"company"`).
2. Define a `sections` constant array:
   ```ts
   const sections = [
     { id: "company", label: "Company" },
     { id: "address", label: "Address" },
     { id: "contact", label: "Contact" },
     { id: "banking", label: "Banking" },
     { id: "tax", label: "Tax" },
     { id: "logo", label: "Logo" },
   ] as const;
   ```
3. Layout: `flex` container with left sidebar (fixed width ~200px) and right content area (flex-1).
4. Sidebar nav: `<nav>` with `<button>` elements for each section. Active button gets `bg-primary/10 text-primary font-medium`. Inactive buttons get `text-muted-foreground hover:text-foreground hover:bg-muted`.
5. Wrap each section's content in a `<Card>` with `<CardHeader>` containing a semantic `<h2>` heading (NOT `<CardTitle>` which renders a `<div>`), and `<CardContent>` containing the fields. The `<h2>` uses `Heading-section` typography (`text-sm font-semibold tracking-tight`). This preserves the existing test that queries `container.querySelectorAll("h2")`.
6. Each section container gets: `className={cn(activeSection !== sectionId && "hidden")}`.
7. The `<form>` wraps Company through Tax sections + Save button. Logo section remains outside the form (already the case).
8. Replace inline success/error banners with `useEffect` watching `saveState`:
   ```ts
   useEffect(() => {
     if (saveState?.success) toast.success("Settings saved successfully.");
     if (saveState?.error) toast.error(saveState.error);
   }, [saveState]);
   ```
9. Save button inside the form, visible regardless of active section.
10. Section heading stays as `<h2>` (semantic HTML), placed inside `<CardHeader>` with `Heading-section` typography. Do NOT use `<CardTitle>` since it renders a `<div>` which would break existing `h2` test queries.
11. Remove `<Separator>` elements (cards provide visual separation). Update the existing separator count test to verify Card components exist instead (see section 4).

**FormData safety:** Tailwind's `hidden` class applies `display: none`. HTML form submission includes all successful controls regardless of CSS display property -- only the `disabled` attribute prevents submission. All 13 form inputs remain enabled in the DOM, so `saveCompanySettings` receives all FormData fields unchanged.

### 2. `page.tsx` -- Keep minimal, adjust layout

- Keep `PageHeader` with title "Settings" for consistency.
- No structural changes needed. The `SettingsForm` handles its own sidebar layout internally.

### 3. `loading.tsx` -- Rewrite skeleton for sidebar + content layout

- Match the new two-column layout structure.
- Left sidebar: 6 skeleton bars (one per section link), each ~200px wide.
- Right content: Card skeleton with form field skeletons inside.
- Keep `PageHeader` skeleton (title bar) at the top.

### 4. `settings-page.test.tsx` -- Extend tests

Add new tests for sidebar navigation behavior while keeping all existing tests passing:

1. **Sidebar nav links rendered:** Assert 6 navigation buttons (Company, Address, Contact, Banking, Tax, Logo) exist.
2. **Default active section:** "Company" section is visible on initial render, others are hidden.
3. **Section switching:** Click "Address" nav button, verify Address section visible, Company section hidden.
4. **Active state styling:** Active nav button has navy-subtle background class.
5. **All fields always in DOM:** All 13 labeled inputs present regardless of which section is active (use `getByLabelText` for each).
6. **Single form wraps all form sections:** `querySelector("form")` exists, contains all 13 inputs.
7. **Toast on save:** Mock `sonner` toast module, trigger save action state change, verify `toast.success` called.

**Existing tests compatibility:**
- `getByLabelText` tests: Work unchanged -- finds inputs regardless of CSS `hidden`.
- `h2` heading test (line 142-156): Headings stay as `<h2>` elements inside `<CardHeader>` (NOT `<CardTitle>` which is a `<div>`). Full heading text preserved ("Company Information", "Address", etc.). Test passes unchanged.
- Separator count test (line 158-165): **Must be updated.** Separators are removed (cards replace them). Replace this assertion with a card count check: `container.querySelectorAll('[data-slot="card"]')` should have 6 cards (one per section).
- Save button test: Passes unchanged.
- Logo tests: Pass unchanged.

**Note on toast `useEffect`:** Each `saveCompanySettings` call returns a new `{ success: true }` object literal, so React sees a new reference on each save and the `useEffect` fires correctly. This is an acceptable trade-off -- no counter/timestamp mechanism needed.

## Design Tokens Applied

- Active sidebar link: `bg-primary/10` (maps to navy-subtle per system.md)
- Cards: existing `Card` component with Elevation-1 shadow
- Section headings: Semantic `<h2>` inside `<CardHeader>` with `text-sm font-semibold tracking-tight` (Heading-section)
- Sidebar text: `text-sm` for nav items
- Layout gap: `gap-6` between sidebar and content (Group spacing = 24px)
- Sidebar width: `w-48` (192px, fits section labels comfortably)

## Constraints

- Zero server action modifications
- All 13 FormData fields always in DOM (never disabled)
- No animation on section switch
- No files outside scope modified
- No added comments or type annotations to unchanged code

## Verification

- `npx vitest run` -- all tests pass
- All 13 form fields present in DOM regardless of active section
- `saveCompanySettings` receives unchanged FormData
