# PLAN: SER-48 -- Restyle Invoice Filter Bar, Table & Skeletons

## Summary
Redesign the invoice list page with compact filter triggers, 44px ledger-line table rows, warm hover states, empty state with CTA, matching skeleton loading, and toast notifications for bulk delete actions.

## Scope Files (MUST modify)
- `src/app/(app)/invoices/page.tsx`
- `src/app/(app)/invoices/invoices-client.tsx`
- `src/components/invoice-filter-bar.tsx`
- `src/components/invoice-table.tsx`
- `src/components/invoice-table-skeleton.tsx`
- `src/app/(app)/invoices/loading.tsx`
- `src/__tests__/invoice-filter-bar.test.tsx`
- `src/__tests__/invoice-table.test.tsx`

## MUST NOT modify
- `src/components/invoice-detail-panel.tsx` (SER-52)
- `src/components/invoice-quick-edit.tsx` (SER-52)
- `src/components/invoice-form.tsx` (SER-49)
- `src/app/(app)/invoices/new/page.tsx` (SER-49)
- `src/app/(app)/invoices/[id]/page.tsx` (SER-49)

## Implementation Steps

### Step 1: Restyle `src/components/invoice-filter-bar.tsx`
**Current:** Five inline Input fields (DebouncedInput for client name, 2x date, 2x number) + active filter badges below.
**Target:** Compact ghost-button triggers that open popovers for each filter group. Active filters shown as removable pill badges with x button.

Changes:
1. Replace five inline Input fields with three compact ghost buttons:
   - "Client" button -> opens Popover with DebouncedInput for client name search
   - "Date" button -> opens Popover with From/To date inputs
   - "Amount" button -> opens Popover with Min/Max number inputs
2. Active buttons get a visual indicator (dot or count) when their filter is active
3. Active filters displayed below as pill badges with `rounded-full` styling and X dismiss button
4. Keep "Clear all" ghost button when filters are active
5. Use existing `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`
6. Keep `DebouncedInput` internal component unchanged (used for client name)
7. Import `User`, `Calendar`, `DollarSign` icons from lucide-react for button labels

### Step 2: Restyle `src/components/invoice-table.tsx`
**Current:** Table with shadow+translate hover, basic empty state (no CTA), no toast on bulk delete.
**Target:** Warm surface-shift hover, empty state with CTA button, toast on bulk actions.

Changes:
1. Replace row hover classes: remove `hover:shadow-sm hover:-translate-y-px` etc. -- let the base TableRow `hover:bg-muted/50` handle it. Keep `group/row cursor-pointer` and `transition-colors duration-150`.
2. Empty state: add a "Create Invoice" primary CTA `<Button asChild><Link href="/invoices/new">` below the existing text
3. Import `toast` from `sonner` and add toast notifications in `handleBulkDelete`:
   - On success: `toast.success(\`${count} invoice${count === 1 ? "" : "s"} deleted\`)`
   - On error: `toast.error("Failed to delete invoices")`
4. Bulk action bar: minor styling refinement with `rounded-sm` and consistent spacing
5. All @tanstack/react-table logic, columns, sorting, selection, CSV export remain unchanged

### Step 3: Restyle `src/components/invoice-table-skeleton.tsx`
**Current:** 6 columns of skeleton cells, no checkbox column, generic widths.
**Target:** Match restyled table layout with checkbox column and correct proportions.

Changes:
1. Add a checkbox column skeleton (small 4x4 rounded square) as first column
2. Adjust skeleton widths to better match actual data column proportions
3. Rows already render at 44px via base TableRow h-11
4. Keep 5-row skeleton count

### Step 4: Update `src/app/(app)/invoices/loading.tsx`
**Current:** PageHeader skeleton + InvoiceTableSkeleton.
**Target:** Add filter bar skeleton placeholders between header and table.

Changes:
1. Add filter bar skeleton: row of 3 small rounded skeleton rectangles (matching the 3 ghost button triggers) between header skeleton and table skeleton
2. Keep existing PageHeader skeleton structure
3. Keep InvoiceTableSkeleton reference

### Step 5: Update `src/app/(app)/invoices/invoices-client.tsx`
**Current:** Wrapper with filter bar + table + detail panel in `flex flex-col gap-4`.
**Target:** Minimal changes -- ensure layout composes correctly with new compact filter bar.

Changes:
1. Adjust gap spacing if needed (gap-3 instead of gap-4 for tighter composition)
2. No functional changes

### Step 6: Update `src/app/(app)/invoices/page.tsx`
**Current:** PageHeader + InvoicesClient.
**Target:** No structural changes needed.

Changes:
1. No changes required -- existing structure works with restyled child components

### Step 7: Update test files

#### `src/__tests__/invoice-filter-bar.test.tsx`
1. Update debounce test: click "Client" button to open popover, then find input inside popover and type
2. Update date range test: click "Date" button to open popover, find date inputs inside
3. Update amount range test: click "Amount" button to open popover, find number inputs inside
4. Keep active filter badge tests (badge rendering, remove filter, clear all -- same behavior)

#### `src/__tests__/invoice-table.test.tsx`
1. Update empty state test: verify "Create Invoice" CTA link exists alongside text
2. Add test: "shows toast.success on bulk delete success"
3. Add test: "shows toast.error on bulk delete error"
4. Keep all existing sorting, selection, CSV export, hover-action tests unchanged

## Design Token Application
- Ghost buttons: `variant="ghost" size="sm"` with lucide icons
- Popovers: existing PopoverContent with `bg-popover` + shadow + border (Elevation-2)
- Filter pills: `rounded-full` Badge variant with X button (Radius-full per system.md)
- Table row hover: warm surface shift via base TableRow `hover:bg-muted/50`
- Empty state: centered with muted FileText icon + descriptive text + primary CTA button
- Toast: `sonner` `toast.success()` / `toast.error()` -- Toaster already in root layout

## Dependencies
- `sonner` -- already installed, `<Toaster />` already in root layout
- `@/components/ui/popover` -- already exists
- `@/components/ui/badge` -- already exists with pill-friendly variants
- No new packages or components needed

## Validation
- `npx vitest run` -- all tests pass
- Filter bar renders as 3 compact ghost buttons
- Popovers open on button click with correct filter inputs inside
- Active filters shown as removable pill badges below
- Table rows at 44px with warm hover (surface shift)
- Empty state shows icon + text + "Create Invoice" CTA
- Skeleton matches restyled page layout with filter bar placeholders
- Bulk delete shows success/error toast
