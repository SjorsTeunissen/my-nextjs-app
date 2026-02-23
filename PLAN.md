# PLAN: SER-46 - Shell - Add breadcrumbs, page header & error boundary

## File Changes

### 1. CREATE: src/__tests__/breadcrumbs.test.tsx
**Reference:** src/__tests__/invoice-table.test.tsx:12-26 (next/link mock pattern)
```tsx
// next/link mock pattern from invoice-table.test.tsx:12-26
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
```
**Concrete test cases:**
1. "renders breadcrumb items with correct labels" - items [{label: "Invoices", href: "/invoices"}, {label: "INV-001"}] renders both labels
2. "renders parent items as links with correct href" - "Invoices" is a link with href="/invoices"
3. "renders current (last) item as plain text, not a link" - "INV-001" uses BreadcrumbPage (span), not a link
4. "renders separator between items" - separator element exists between items
5. "renders single item without separator" - [{label: "Dashboard"}] renders just text, no separator
6. "renders with nav element with aria-label breadcrumb" - nav[aria-label="breadcrumb"] exists

### 2. CREATE: src/components/breadcrumbs.tsx
**Reference:** src/components/ui/breadcrumb.tsx (shadcn breadcrumb primitives)
```tsx
// shadcn primitives to use:
// Breadcrumb -> wraps as <nav aria-label="breadcrumb">
// BreadcrumbList -> <ol> with flex wrap styling
// BreadcrumbItem -> <li> inline-flex
// BreadcrumbLink -> <a> with hover:text-foreground (use asChild with Next Link)
// BreadcrumbPage -> <span> with aria-current="page"
// BreadcrumbSeparator -> <li> with ChevronRight icon
```
**Action:** Create `AppBreadcrumbs` component that accepts `items: Array<{ label: string; href?: string }>`. Map items to BreadcrumbItem components. If item has `href`, render BreadcrumbLink with Next.js Link (asChild). If last item (no href), render BreadcrumbPage. Add BreadcrumbSeparator between items.

### 3. MODIFY: src/components/page-header.tsx
**Pattern source:** src/components/page-header.tsx:1-21 (current implementation)
```tsx
// Current implementation:
interface PageHeaderProps {
  title: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("flex items-center justify-between pb-4", className)}>
      <h1 className="text-lg font-semibold">{title}</h1>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
```
**Action:**
- Add optional `breadcrumbs?: React.ReactNode` prop to PageHeaderProps
- Render breadcrumbs above the title row when provided
- Update h1 className to `text-lg font-semibold tracking-tight` (Heading-page typography from system.md)
- Restructure: outer header gets `flex flex-col gap-1` when breadcrumbs present, inner div has the title+actions flex row

### 4. MODIFY: src/__tests__/page-header.test.tsx
**Reference:** src/__tests__/page-header.test.tsx:1-35 (current tests)
```tsx
// Current tests: renders title, renders heading, renders actions, renders without actions
```
**Concrete test cases (additions):**
1. "renders breadcrumbs when provided" - pass breadcrumbs={<nav>breadcrumb nav</nav>} and assert it appears
2. "does not render breadcrumb container when breadcrumbs not provided" - no extra wrapper when breadcrumbs omitted
3. "applies Heading-page typography to title" - h1 has classes text-lg, font-semibold, tracking-tight

### 5. CREATE: src/app/(app)/error.tsx
**Reference:** Next.js error.tsx convention - client component with error and reset props
```tsx
// Next.js error.tsx convention:
"use client";
// Props: { error: Error & { digest?: string }; reset: () => void }
// Must be a client component
// reset() re-renders the route segment
```
**Action:** Create error boundary with:
- "use client" directive
- Friendly message: "Something went wrong"
- Description text explaining the error
- "Try again" button that calls reset()
- Centered layout with appropriate spacing
- Uses Button component from ui/button

### 6. CREATE: src/__tests__/error-boundary.test.tsx
**Concrete test cases:**
1. "displays friendly error message" - renders "Something went wrong" text
2. "displays try again button" - button with text "Try again" exists
3. "calls reset when try again button is clicked" - clicking button calls the reset() prop
4. "does not display raw error message" - the Error object's message is not rendered

### 7. MODIFY: src/app/(app)/layout.tsx
**Pattern source:** src/app/(app)/layout.tsx:39-45 (content area)
```tsx
// Current content area:
<div className="flex flex-1 flex-col overflow-hidden">
  <header className="flex h-12 items-center border-b px-4 md:hidden">
    <MobileSidebar userEmail={user.email ?? ""} />
    <span className="ml-2 text-sm font-semibold">Invoice Generator</span>
  </header>
  <main className="flex-1 overflow-auto p-6">{children}</main>
</div>
```
**Action:** No structural changes needed. Next.js automatically picks up `error.tsx` at the `(app)` route level. The layout spacing (`p-6`) already matches system.md's content padding spec for desktop. No changes required.

## Reusable Utilities
- `cn` from `src/lib/utils.ts:4` (conditional class merging)
- shadcn breadcrumb primitives from `src/components/ui/breadcrumb.tsx` (Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator)

## Out of Scope
- DO NOT modify `src/components/app-shell.tsx` (SER-45 handles shell restyle)
- DO NOT modify `src/components/nav-sidebar.tsx` (SER-45 handles nav restyle)
- DO NOT modify `src/components/mobile-sidebar.tsx` (SER-45 handles mobile nav)
- DO NOT add breadcrumbs to individual pages (future issues handle this)
- DO NOT add error logging or reporting services
- DO NOT modify files outside the Scope Files list
