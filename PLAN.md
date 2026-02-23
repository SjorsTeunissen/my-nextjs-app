# SER-39: Advanced Data Table with Sorting, Filtering, and Bulk Actions

## Approach
Rewrite the invoice table component using `@tanstack/react-table` with full sorting, client-side filtering via a new filter bar component, checkbox row selection with bulk actions, and column resizing. Add a `bulkDeleteInvoices` server action. Use TDD -- write tests first, then implement.

## Key Files to Modify
- `src/components/invoice-table.tsx` -- full rewrite with @tanstack/react-table
- `src/components/invoice-filter-bar.tsx` -- new component
- `src/app/(app)/invoices/page.tsx` -- wire filter state, add onRowSelect prop
- `src/app/(app)/invoices/actions.ts` -- add bulkDeleteInvoices
- `src/__tests__/invoice-table.test.tsx` -- full test rewrite
- `src/__tests__/invoice-filter-bar.test.tsx` -- new test file

## Test Strategy
Write tests first covering all 14 test scenarios from the AC. Tests use vitest + @testing-library/react with mocked next/navigation and server actions. The `createInvoice()` factory pattern from existing tests will be reused.

## Estimated Complexity
Large (L)

---

## Phase 1: Write Tests (TDD Red Phase)

### 1a. Rewrite `src/__tests__/invoice-table.test.tsx`

Tests to write:
1. **Render table with 3 invoices** -- Table shows 3 rows with columns: checkbox, invoice number, client name, issue date, due date, total, actions
2. **Click "Client Name" column header** -- Rows sort by client name ascending; arrow indicator shows up
3. **Click "Client Name" column header twice** -- Rows sort descending; arrow indicator shows down
4. **Click a table row** -- `onRowSelect` callback called with the clicked invoice
5. **Hover action buttons** -- Quick-edit and view buttons present
6. **Empty state** -- Shows empty state message when no invoices
7. **Format currency** -- Total formatted as EUR
8. **Select-all checkbox** -- All visible row checkboxes checked; bulk actions toolbar appears
9. **Select 2 rows, click Delete selected** -- `bulkDeleteInvoices` called with 2 invoice IDs
10. **Select 3 rows, click Export CSV** -- CSV download triggered
11. **Rows have group/row class** -- For hover action visibility

Key mocking changes:
- Remove `useRouter`/`router.push` mock (row click now uses `onRowSelect` callback)
- Add `onRowSelect` mock as a prop
- Add `bulkDeleteInvoices` action mock
- Keep `quickUpdateInvoice` mock for InvoiceQuickEdit

### 1b. Create `src/__tests__/invoice-filter-bar.test.tsx`

Tests to write:
1. **Type "Acme" in client name filter** -- `onFiltersChange` called with client name filter
2. **Set date range filter** -- `onFiltersChange` called with date range
3. **Set amount range filter** -- `onFiltersChange` called with amount range
4. **Click dismiss on filter badge** -- Filter removed
5. **Click "Clear all"** -- All filters removed
6. **Active filters shown as badges** -- Badges rendered for active filters

## Phase 2: Implement Components (TDD Green Phase)

### 2a. Add `bulkDeleteInvoices` to `src/app/(app)/invoices/actions.ts`

Server action that accepts `ids: string[]`, deletes from invoices table using `.in('id', ids)`, calls `revalidatePath("/invoices")`.

### 2b. Create `src/components/invoice-filter-bar.tsx`

New client component with:
- Props: `filters` state object, `onFiltersChange` callback
- Client name text input (debounced 300ms)
- Issue date range (from/to date inputs)
- Total amount range (min/max number inputs)
- Active filters shown as dismissible Badge chips
- "Clear all" button when any filter active

Filter state interface:
```typescript
interface InvoiceFilters {
  clientName: string;
  issueDateFrom: string;
  issueDateTo: string;
  totalMin: string;
  totalMax: string;
}
```

### 2c. Rewrite `src/components/invoice-table.tsx`

Full rewrite using `useReactTable` with:
- Column defs: checkbox (selection), invoice_number, client_name, issue_date, due_date, total, actions
- `getCoreRowModel()`, `getSortedRowModel()`
- `columnResizeMode: "onEnd"`
- `enableRowSelection: true`
- Sort toggle on header click with arrow indicators (ArrowUp/ArrowDown from lucide)
- Row click calls `onRowSelect(invoice)` via callback prop
- Existing hover actions (InvoiceQuickEdit + view link) preserved with `stopPropagation`
- Bulk actions toolbar (delete selected, export CSV) when rows selected
- Export CSV creates a Blob download with selected invoice data

Props:
```typescript
interface InvoiceTableProps {
  invoices: Invoice[];
  onRowSelect?: (invoice: Invoice) => void;
}
```

### 2d. Modify `src/app/(app)/invoices/page.tsx`

- Keep Server Component for data fetching
- Create a client wrapper component `InvoicesClient` that manages filter state
- Import InvoiceFilterBar and wire filter state
- Apply client-side filtering with AND logic on the invoice array
- Pass `onRowSelect` prop to InvoiceTable

## Phase 3: Run Tests & Validate

1. Run tests for modified files
2. Run full test suite for regression check
3. Run `npx tsc --noEmit` for type checking
4. Run `npx next build` to verify production build
5. Run linter

## Phase 4: Quality Validation

Run applicable Tier 1 frontend skills on changed files.

## Phase 5: Commit & PR

1. Commit with conventional format
2. Push branch
3. Open PR targeting main
