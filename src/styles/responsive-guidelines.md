# Responsive Design Guidelines for OrnaCore Admin

Use these rules for every existing and upcoming admin feature. The goal is simple: the UI must feel intentionally designed on desktop, tablet, and mobile — never randomly squeezed.

## 1. Breakpoints

Always use the shared mixins from [\_breakpoints.scss](/Users/akash/Desktop/OrnaMent/ornacore-admin/src/styles/_breakpoints.scss).

```scss
@use "../../styles/breakpoints" as *;

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @include respond-to-desktop-sm {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @include respond-to-tablet {
    grid-template-columns: 1fr;
  }
}
```

Breakpoint meaning:

- `$bp-mobile: 560px` — phones; single-column stacks, full-width buttons, tighter spacing.
- `$bp-tablet: 780px` — large phones/tablets; forms collapse, toolbars stack.
- `$bp-desktop-sm: 1024px` — small screens; sidebar becomes drawer.
- `$bp-desktop-lg: 1280px` — medium desktops; dashboard/card grids reduce columns.

## 2. Layout rules

- Forms with two or more columns must collapse to one column at `respond-to-tablet`.
- Card grids must use `minmax()` or explicit column reductions.
- Header/footer button groups must stack on mobile.
- Do not use random custom breakpoints. If a special breakpoint is truly needed, add it to `_breakpoints.scss` first.
- Feature-specific styling stays in that feature’s SCSS file. Shared primitives belong in `src/components` or `src/styles`.

## 3. Tables

All tables must be wrapped in a horizontal-scroll container:

```scss
.table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
```

For normal admin tables, prefer the shared `DataTable`; it already supports mobile card layout. If building a new table, add `data-label` to cells so mobile cards can show labels.

## 4. Typography and fields

- Inputs, selects, and textareas must be `width: 100%`.
- Mobile form fields should use `font-size: 16px` to prevent iOS zoom.
- Body/action text should not drop below `12px`; tiny metadata can be `8–10px` only when secondary.
- Headings should shrink by layout, not by becoming unreadable.

## 5. Touch targets

- Buttons and icon actions should have at least `44px` touch area on mobile.
- Leave at least `8px` between touch targets.
- Every interactive element needs a visible hover/focus state.

## 6. Modal and bottom-sheet rules

- Desktop: centered modal.
- Tablet/mobile: bottom sheet with max-height and internal scroll.
- Form footers stack full-width buttons on mobile.
- Image upload/preview areas must be square using `aspect-ratio: 1`.

## 7. Reusable utilities

Optional utility classes are available in [\_responsive-utilities.scss](/Users/akash/Desktop/OrnaMent/ornacore-admin/src/styles/_responsive-utilities.scss):

- `.responsive-grid`
- `.responsive-grid-2`
- `.responsive-grid-3`
- `.responsive-grid-4`
- `.responsive-form-grid`
- `.responsive-button-group`
- `.responsive-table-wrap`
- `.hide-mobile`
- `.show-mobile-only`

Use utilities for common layout only. Do not build feature-specific visuals with generic utilities.

## 8. Required test checklist

Before shipping any screen:

- Check 1280px desktop.
- Check 1024px small desktop/tablet landscape.
- Check 780px tablet/large phone.
- Check 560px and 390px phone widths.
- Confirm no accidental horizontal page scroll.
- Confirm tables either scroll horizontally or become cards.
- Confirm modals fit as bottom sheets on mobile.
- Confirm buttons remain tappable and readable.
