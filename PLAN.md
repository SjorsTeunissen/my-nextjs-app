# SER-30 Implementation Plan: Redesign App Shell with Responsive Sidebar and Page Header

## Issue Summary
Redesign the app shell layout with a compact Linear-style sidebar (desktop collapse toggle, mobile Sheet drawer), a reusable PageHeader component, and responsive breakpoints.

## Approach
Refactor `nav-sidebar.tsx` to support collapsed/expanded states with a toggle button, create a `mobile-sidebar.tsx` that wraps sidebar content in a Sheet drawer for mobile (<768px), create a `page-header.tsx` component for consistent page titles and action buttons, and update `layout.tsx` to integrate all pieces with responsive breakpoints. Use TDD: write tests first, then implement.

## Scope

### Files to Modify
- `src/components/nav-sidebar.tsx` - Modify: Add collapse toggle, compact styling, conditional icon-only mode
- `src/app/(app)/layout.tsx` - Modify: Integrate mobile sidebar, responsive layout, sidebar state management
- `src/__tests__/nav-sidebar-theme.test.tsx` - Modify: Update existing tests for new structure, add collapse tests

### Files to Create
- `src/components/mobile-sidebar.tsx` - Create: Sheet-based drawer for mobile (<768px) with hamburger trigger
- `src/components/page-header.tsx` - Create: Reusable title + action buttons component
- `src/__tests__/mobile-sidebar.test.tsx` - Create: Tests for Sheet open/close, navigation
- `src/__tests__/page-header.test.tsx` - Create: Tests for title rendering, action buttons

### Files NOT to Modify
- `src/app/globals.css` - Already updated in SER-29 (Task 1)
- `src/components/ui/*` - Already installed/styled in SER-29 (Task 1)
- `src/components/invoice-table.tsx` - Task 5 scope
- `src/components/invoice-form.tsx` - Task 6 scope
- `src/app/(app)/settings/settings-form.tsx` - Task 7 scope
- `src/components/command-palette.tsx` - Task 4 scope

## Design Decisions

### Sidebar Collapse State
- Use React `useState` for collapsed state in NavSidebar
- Collapsed mode: icon-only (no labels), narrower width (~64px vs ~240px)
- Toggle button at the bottom of the sidebar (chevron icon)
- Sidebar remembers state within session only (no DB persistence for this PR)

### Mobile Sidebar
- Below `md` breakpoint (768px), hide the desktop sidebar entirely
- Show a hamburger `Menu` button in a top bar
- Hamburger opens a Sheet from the left with the full sidebar navigation
- Sheet closes on navigation (link click) or close button

### PageHeader Component
- Renders `<header>` with a title (`h1`) and optional `actions` slot (ReactNode)
- Used by all pages: Invoices, New Invoice, Edit Invoice, Settings
- Integrated into the `layout.tsx` main content area - but since page content is `{children}`, each page will use `PageHeader` directly at the top of its content

### Layout Changes
- Desktop: `flex` layout with sidebar (collapsible) + main area
- Mobile: sidebar hidden, top bar with hamburger + main area
- Use Tailwind `md:` breakpoint for responsive switching
- The `MobileSidebar` component handles its own show/hide based on screen size using CSS classes (`md:hidden`)

## Test Strategy

### Phase 1: PageHeader Tests (new file)
Tests for `page-header.test.tsx`:
1. Renders title text
2. Renders action buttons when provided
3. Renders without action buttons (optional)
4. Uses semantic heading element

### Phase 2: Mobile Sidebar Tests (new file)
Tests for `mobile-sidebar.test.tsx`:
1. Renders hamburger menu button
2. Opens Sheet when hamburger clicked
3. Shows navigation links in Sheet
4. Closes Sheet on close button click

### Phase 3: NavSidebar Tests (update existing)
Update `nav-sidebar-theme.test.tsx`:
1. Update existing tests for new sidebar structure (add `collapsed` prop or internal state)
2. Add test: renders collapse toggle button
3. Add test: clicking toggle collapses sidebar (hides labels)
4. Add test: collapsed sidebar shows only icons

### Test Mocks
- Reuse existing `next-themes`, `next/navigation`, `theme-actions`, `login/actions` mocks
- Mock `radix-ui` Dialog for Sheet tests (or use existing Sheet component rendering)
- Use `@testing-library/react` `fireEvent` for interactions

## Implementation Order (TDD)
1. Write `page-header.test.tsx` tests (RED)
2. Implement `page-header.tsx` (GREEN)
3. Write `mobile-sidebar.test.tsx` tests (RED)
4. Implement `mobile-sidebar.tsx` (GREEN)
5. Update `nav-sidebar-theme.test.tsx` with collapse tests (RED)
6. Update `nav-sidebar.tsx` with collapse functionality (GREEN)
7. Update `layout.tsx` to integrate all components
8. Run all tests, lint, type-check, build

## Estimated Complexity
L (Large) - Multiple new components, test files, and significant refactoring of existing sidebar
