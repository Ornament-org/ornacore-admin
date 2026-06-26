# Responsive Component Patterns

This document provides ready-to-use responsive patterns for common UI components. Use these patterns as templates when creating new components or making existing components responsive.

## Pattern Usage Guide

1. **Copy the pattern** that matches your component type
2. **Customize the class names** to match your component
3. **Adjust breakpoints** if needed (rarely necessary)
4. **Test across all breakpoints** using the testing checklist

---

## 1. CARD COMPONENTS

### Basic Responsive Card
```scss
// Import breakpoints
@import "../../styles/breakpoints";

.card-component {
  // Mobile-first base styles
  width: 100%;
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  
  @include respond-to-tablet {
    padding: 20px;
  }
  
  @include respond-to-desktop-sm {
    padding: 24px;
  }
}

.card-grid {
  display: grid;
  grid-template-columns: 1fr; // Mobile: single column
  gap: 16px;
  
  @include respond-to-tablet {
    grid-template-columns: repeat(2, 1fr); // Tablet: 2 columns
  }
  
  @include respond-to-desktop-sm {
    grid-template-columns: repeat(3, 1fr); // Desktop-sm: 3 columns
  }
  
  @include respond-to-desktop-lg {
    grid-template-columns: repeat(4, 1fr); // Desktop-lg: 4 columns
  }
}
```

### Card with Header Actions
```scss
.card-with-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @include respond-to-tablet {
    gap: 16px;
  }
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @include respond-to-tablet {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  
  @include respond-to-tablet {
    flex-direction: row;
    width: auto;
  }
  
  .button {
    @include respond-to-mobile {
      width: 100%;
    }
  }
}
```

---

## 2. FORM COMPONENTS

### Responsive Form Grid
```scss
@import "../../styles/breakpoints";

.form-container {
  max-width: 100%;
  margin: 0 auto;
  
  @include respond-to-desktop-sm {
    max-width: 800px;
  }
  
  @include respond-to-desktop-lg {
    max-width: 1000px;
  }
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr; // Mobile: single column
  gap: 16px;
  
  @include respond-to-tablet {
    grid-template-columns: repeat(2, 1fr); // Tablet: 2 columns
  }
  
  @include respond-to-desktop-sm {
    grid-template-columns: repeat(3, 1fr); // Desktop-sm: 3 columns
  }
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @include respond-to-tablet {
    grid-template-columns: repeat(2, 1fr);
  }
}

.form-field {
  width: 100%;
  
  input,
  select,
  textarea {
    width: 100%;
    font-size: 16px; // Prevents iOS zoom on focus
  }
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 24px;
  
  @include respond-to-tablet {
    flex-direction: row;
    justify-content: flex-end;
  }
  
  .button {
    @include respond-to-mobile {
      width: 100%;
    }
  }
}
```

### Inline Form
```scss
.inline-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  @include respond-to-tablet {
    flex-direction: row;
    align-items: flex-end;
    flex-wrap: wrap;
  }
}

.inline-form-field {
  flex: 1;
  min-width: 200px;
  
  @include respond-to-mobile {
    min-width: 100%;
  }
}
```

---

## 3. BUTTON COMPONENTS

### Button Group
```scss
@import "../../styles/breakpoints";

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  
  @include respond-to-tablet {
    flex-direction: row;
    flex-wrap: wrap;
    width: auto;
  }
  
  .button {
    @include respond-to-mobile {
      width: 100%;
    }
  }
}

.button-group-inline {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @include respond-to-tablet {
    flex-direction: row;
    align-items: center;
  }
}

.button-group-justified {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @include respond-to-tablet {
    flex-direction: row;
    justify-content: space-between;
  }
}
```

### Icon Button Group
```scss
.icon-button-group {
  display: flex;
  gap: 4px;
  
  @include respond-to-mobile {
    gap: 2px;
  }
  
  .icon-button {
    min-width: 44px; // Touch target minimum
    min-height: 44px;
    
    @include respond-to-mobile {
      padding: 8px;
    }
  }
}
```

---

## 4. TABLE COMPONENTS

### Responsive Table Wrapper
```scss
@import "../../styles/breakpoints";

.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--surface-soft);
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--line-strong);
    border-radius: 3px;
  }
}

.data-table {
  width: 100%;
  min-width: 780px; // Forces scroll on smaller screens
  border-collapse: collapse;
  
  @include respond-to-mobile {
    font-size: 12px;
  }
}

// Card view for mobile (alternative to horizontal scroll)
.table-card-view {
  @include respond-to-mobile {
    display: block;
    
    thead {
      display: none;
    }
    
    tbody {
      display: block;
    }
    
    tr {
      display: block;
      margin-bottom: 16px;
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 12px;
    }
    
    td {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--line);
      
      &:last-child {
        border-bottom: none;
      }
      
      &::before {
        content: attr(data-label);
        font-weight: 600;
        color: var(--muted);
        margin-right: 12px;
      }
    }
  }
}
```

---

## 5. NAVIGATION COMPONENTS

### Responsive Navigation
```scss
@import "../../styles/breakpoints";

.nav-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  @include respond-to-tablet {
    flex-direction: row;
    align-items: center;
  }
}

.nav-horizontal {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  gap: 8px;
  padding: 8px 0;
  
  @include respond-to-tablet {
    overflow-x: visible;
  }
}

.nav-item {
  white-space: nowrap;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background 150ms ease;
  
  @include respond-to-mobile {
    padding: 12px 16px;
    font-size: 14px;
  }
}

// Hamburger menu for mobile
.nav-mobile-toggle {
  display: block;
  
  @include respond-above-tablet {
    display: none;
  }
}

.nav-desktop {
  display: none;
  
  @include respond-above-tablet {
    display: flex;
  }
}
```

---

## 6. MODAL COMPONENTS

### Responsive Modal
```scss
@import "../../styles/breakpoints";

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
  
  @include respond-to-tablet {
    padding: 24px;
  }
}

.modal-content {
  width: 100%;
  max-width: 100%;
  max-height: 100vh;
  overflow-y: auto;
  border-radius: 12px;
  background: var(--surface);
  
  @include respond-to-tablet {
    max-width: 600px;
    max-height: 90vh;
    border-radius: 16px;
  }
  
  @include respond-to-desktop-sm {
    max-width: 700px;
  }
  
  @include respond-to-desktop-lg {
    max-width: 800px;
  }
}

.modal-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--line);
  
  @include respond-to-tablet {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
  }
}

.modal-body {
  padding: 16px;
  
  @include respond-to-tablet {
    padding: 20px;
  }
}

.modal-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-top: 1px solid var(--line);
  
  @include respond-to-tablet {
    flex-direction: row;
    justify-content: flex-end;
    padding: 20px;
  }
  
  .button {
    @include respond-to-mobile {
      width: 100%;
    }
  }
}
```

---

## 7. DASHBOARD WIDGETS

### Widget Grid
```scss
@import "../../styles/breakpoints";

.widget-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  
  @include respond-to-tablet {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @include respond-to-desktop-sm {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @include respond-to-desktop-lg {
    grid-template-columns: repeat(4, 1fr);
  }
}

.widget {
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface);
  
  @include respond-to-tablet {
    padding: 20px;
  }
}

.widget-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  
  @include respond-to-tablet {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
}

.widget-stat {
  font-size: 28px;
  font-weight: 700;
  
  @include respond-to-mobile {
    font-size: 24px;
  }
}
```

---

## 8. LIST COMPONENTS

### Responsive List
```scss
@import "../../styles/breakpoints";

.list-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.list-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 8px;
  
  @include respond-to-tablet {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
  }
}

.list-item-content {
  flex: 1;
  min-width: 0;
}

.list-item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  
  @include respond-to-tablet {
    flex-direction: row;
    width: auto;
  }
  
  .button {
    @include respond-to-mobile {
      width: 100%;
    }
  }
}
```

---

## 9. HEADER COMPONENTS

### Page Header
```scss
@import "../../styles/breakpoints";

.page-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  margin-bottom: 16px;
  
  @include respond-to-tablet {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    padding: 20px 24px;
  }
}

.page-title {
  font-size: 20px;
  
  @include respond-to-tablet {
    font-size: 24px;
  }
  
  @include respond-to-desktop-sm {
    font-size: 28px;
  }
}

.page-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  
  @include respond-to-tablet {
    flex-direction: row;
    width: auto;
  }
  
  .button {
    @include respond-to-mobile {
      width: 100%;
    }
  }
}
```

---

## 10. SIDEBAR COMPONENTS

### Responsive Sidebar
```scss
@import "../../styles/breakpoints";

.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 50;
  width: 280px;
  transform: translateX(-100%);
  transition: transform 250ms ease;
  
  @include respond-above-desktop-sm {
    transform: translateX(0);
  }
  
  &.open {
    transform: translateX(0);
  }
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: block;
  visibility: hidden;
  opacity: 0;
  background: rgba(0, 0, 0, 0.5);
  transition: opacity 250ms ease;
  
  @include respond-above-desktop-sm {
    display: none;
  }
  
  &.open {
    visibility: visible;
    opacity: 1;
  }
}

.sidebar-toggle {
  display: block;
  
  @include respond-above-desktop-sm {
    display: none;
  }
}
```

---

## UTILITY CLASSES REFERENCE

You can also use pre-built utility classes from `_responsive-utilities.scss`:

### Grid Utilities
- `.responsive-grid` - 1 → 2 → 3 → 4 columns
- `.responsive-grid-2` - 1 → 2 columns
- `.responsive-grid-3` - 1 → 2 → 3 columns
- `.responsive-grid-auto` - Auto-fit with minmax

### Flex Utilities
- `.responsive-flex-row` - Column → Row
- `.responsive-flex-center` - Column center → Row center
- `.responsive-flex-between` - Column → Row space-between

### Spacing Utilities
- `.responsive-padding` - 16px → 24px → 32px
- `.responsive-padding-sm` - 12px → 16px → 20px
- `.responsive-gap` - 12px → 16px → 24px

### Button Utilities
- `.responsive-button-group` - Stacked → Horizontal
- `.responsive-button-group-inline` - Stacked → Inline

### Form Utilities
- `.responsive-form-grid` - 1 → 2 → 3 columns
- `.responsive-form-grid-2` - 1 → 2 columns

### Display Utilities
- `.hide-mobile` - Hide on mobile
- `.hide-tablet` - Hide on tablet only
- `.hide-desktop` - Hide on desktop
- `.show-mobile-only` - Show only on mobile
- `.show-tablet-only` - Show only on tablet
- `.show-desktop-only` - Show only on desktop

---

## TESTING CHECKLIST

Before marking a component as responsive, verify:

- [ ] Layout works at 560px (mobile)
- [ ] Layout works at 780px (tablet)
- [ ] Layout works at 1024px (desktop-sm)
- [ ] Layout works at 1280px+ (desktop-lg)
- [ ] Touch targets are minimum 44x44px
- [ ] Text is readable (minimum 12px)
- [ ] No horizontal scroll on mobile
- [ ] Tables are scrollable or card-based
- [ ] Modals fit screen on mobile
- [ ] Navigation is accessible on mobile
- [ ] Buttons don't overlap on mobile
- [ ] Form inputs are full width on mobile

---

**Remember**: Always test on actual devices when possible. Emulators don't always reflect real-world performance and touch behavior.
