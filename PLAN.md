# PLAN: SER-47 -- Polish Login Page with Ink & Ledger Palette

## Approach

Replace the current generic purple-tinted oklch background gradient and card styling on the login page with the Ink & Ledger design system colors: ink navy gradient background, warm Surface card, and navy-tinted toggle/active states. This is a S-complexity single-page restyle touching 2 files.

## File Changes

### 1. MODIFY: src/app/login/page.tsx

**Pattern source:** .interface-design/system.md lines 13-48 (Color Primitives)

Reference color values (DO NOT MODIFY system.md):
```
Canvas:           oklch(0.985 0.005 85)     /* warm off-white, hint of cream */
Surface:          oklch(0.995 0.003 85)     /* card/elevated surface */
Ink:              oklch(0.205 0.015 260)    /* deep navy-black -- primary text */
Navy:             oklch(0.40 0.12 260)      /* primary actions, links, focus rings */
Navy-hover:       oklch(0.35 0.12 260)      /* primary hover state */
Navy-subtle:      oklch(0.95 0.02 260)      /* primary ghost/soft backgrounds */
Border:           oklch(0.88 0.005 85)      /* standard separation -- warm-tinted */

Dark mode:
Canvas:           oklch(0.16 0.008 260)     /* deep warm charcoal with ink undertone */
Surface:          oklch(0.20 0.010 260)     /* card elevation */
Navy:             oklch(0.65 0.14 260)      /* primary -- brighter for dark bg */
Navy-hover:       oklch(0.70 0.14 260)      /* primary hover */
```

Card styling reference (system.md lines 161-165):
```
Surface background + elevation-1 shadow + standard border
Elevation-1: shadow-[0_1px_2px_0_oklch(0_0_0/0.04)] + border
```

**Current code (line 25):**
```tsx
<div className="flex min-h-screen items-center justify-center bg-[oklch(0.13_0.02_281)] px-4 dark:bg-[oklch(0.1_0.02_281)]">
```

**Current gradient overlay (line 26):**
```tsx
<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.25_0.08_281)_0%,transparent_50%)]" />
```

**Current card (line 29):**
```tsx
<div className="rounded-lg border border-border/50 bg-card p-6 shadow-lg">
```

**Action:**
1. Change outer background from purple-tinted `oklch(0.13_0.02_281)` to ink navy `oklch(0.205_0.015_260)` (Ink color). Dark mode: `oklch(0.16_0.008_260)` (dark Canvas).
2. Change radial gradient overlay from purple `oklch(0.25_0.08_281)` to navy `oklch(0.35_0.12_260)` (Navy-hover, creates subtle navy glow at top).
3. Change card from `bg-card shadow-lg` to warm Surface `bg-[oklch(0.995_0.003_85)]` with Elevation-1 shadow `shadow-[0_1px_2px_0_oklch(0_0_0/0.04)]`. Dark mode card: `dark:bg-[oklch(0.20_0.010_260)]`. Keep `border border-border/50 rounded-lg p-6`.
4. Change toggle link from `text-primary` to `text-[oklch(0.65_0.14_260)]` with `hover:text-[oklch(0.70_0.14_260)]` (navy tones visible on dark bg).

### 2. MODIFY: src/__tests__/login-page.test.tsx

**Current test "uses a card with border and shadow" (line 86-92):**
```tsx
it("uses a card with border and shadow for the form container", () => {
  const { container } = render(<LoginPage />);
  const card = container.querySelector(".rounded-lg.border");
  expect(card).toBeInTheDocument();
  expect(card?.className).toContain("shadow-lg");
  expect(card?.className).toContain("bg-card");
});
```

**Action:**
- Update this test to check for Elevation-1 shadow pattern (`shadow-[0`) instead of `shadow-lg`, and inline oklch background instead of `bg-card`.
- Update the background test (line 37-45) to verify navy hue (260) specifically.
- Add new test: "sign-in/sign-up toggle link uses navy palette color" verifying the toggle button has navy oklch class.

### Concrete test cases:
1. "renders the sign in form with email and password fields" -- no change
2. "shows ink navy gradient background with centered card layout" -- UPDATE: verify oklch with hue 260
3. "has a gradient overlay element" -- no change
4. "toggles between sign in and sign up modes" -- no change
5. "preserves sign-in/sign-up toggle link" -- no change
6. "renders error state with styled container" -- no change
7. "uses a card with warm Surface background and Elevation-1 shadow" -- UPDATE
8. "has responsive padding for small screens" -- no change
9. "constrains card width with max-w-sm" -- no change
10. NEW: "sign-in/sign-up toggle link uses navy palette color"

## Reusable Utilities
- `cn` from `src/lib/utils.ts:4` -- conditional class merging (not needed here)

## Out of Scope
- DO NOT modify `src/components/ui/*.tsx` (UI primitives -- handled by SER-44)
- DO NOT modify `src/app/(app)/**` (app shell routes)
- DO NOT modify `src/app/login/actions.ts` (auth logic)
- DO NOT modify `.interface-design/system.md` (reference only)
- DO NOT modify `src/app/globals.css` (token changes handled by SER-43)
