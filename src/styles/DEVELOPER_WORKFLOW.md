# Developer Workflow for Responsive Implementation

This guide provides step-by-step instructions for developers to implement responsive design in the OrnaMent Admin UI.

## Quick Start Checklist

For developers who need to make a component responsive quickly:

1. **Import breakpoints**: `@import "../../styles/breakpoints" as *;`
2. **Use mobile-first approach**: Write base styles for mobile (≤560px)
3. **Add tablet styles**: `@include respond-to-tablet { ... }`
4. **Add desktop styles**: `@include respond-to-desktop-sm { ... }`
5. **Test**: Check all breakpoints (560px, 780px, 1024px, 1280px+)
6. **Document**: Add responsive behavior to component comments

---

## Complete Workflow

### Phase 1: Planning & Analysis

#### 1.1 Understand the Component
Before writing any CSS, answer these questions:
- What is the primary purpose of this component?
- What content is most important on mobile?
- What can be hidden or simplified on smaller screens?
- How does the component behave on different screen sizes?

#### 1.2 Choose the Right Pattern
Review `RESPONSIVE_PATTERNS.md` and select the pattern that matches your component:
- Card component? → Use Card Pattern
- Form? → Use Form Pattern
- Table? → Use Table Pattern
- Navigation? → Use Navigation Pattern
- Modal? → Use Modal Pattern

#### 1.3 Plan Content Priority
Determine content hierarchy for mobile:
1. **Must-have**: Essential content and actions
2. **Nice-to-have**: Secondary information
3. **Hidden**: Content that can be moved to drawers/menus

---

### Phase 2: Implementation

#### 2.1 Set Up the File Structure

```scss
// Always import breakpoints first
@import "../../styles/breakpoints";

// Component styles
.component-name {
  // Mobile-first base styles (≤560px)
  
  @include respond-to-tablet {
    // Tablet styles (≤780px)
  }
  
  @include respond-to-desktop-sm {
    // Desktop-sm styles (≤1024px)
  }
  
  @include respond-to-desktop-lg {
    // Desktop-lg styles (>1280px)
  }
}
```

#### 2.2 Implement Mobile-First Base Styles

Write styles for the smallest screen first (≤560px):

```scss
@import "../../styles/breakpoints";

.product-card {
  // Mobile: Single column, stacked layout
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 8px;
  background: var(--surface);
  
  // Ensure touch targets are large enough
  .button {
    min-height: 44px;
    min-width: 44px;
  }
  
  // Full-width inputs
  input, select {
    width: 100%;
    font-size: 16px; // Prevents iOS zoom
  }
}
```

**Mobile Rules to Follow:**
- Single-column layouts
- Full-width elements
- Minimum touch target: 44x44px
- Font size: minimum 12px
- Input font size: 16px (prevents iOS zoom)
- No horizontal scroll

#### 2.3 Add Tablet Enhancements

Enhance the layout for tablets (≤780px):

```scss
.product-card {
  // ... mobile styles ...
  
  @include respond-to-tablet {
    // Tablet: 2-column grid where appropriate
    gap: 16px;
    padding: 20px;
    
    .card-header {
      flex-direction: row;
      justify-content: space-between;
    }
  }
}
```

**Tablet Rules to Follow:**
- 2-column grids where appropriate
- Adjusted spacing (16-20px)
- Horizontal layouts for headers
- Collapsible navigation

#### 2.4 Add Desktop Enhancements

Enhance for desktop screens (≤1024px):

```scss
.product-card {
  // ... mobile and tablet styles ...
  
  @include respond-to-desktop-sm {
    // Desktop-sm: 3-4 column grids
    gap: 24px;
    padding: 24px;
    
    .card-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
}
```

**Desktop-SM Rules to Follow:**
- 3-4 column grids
- Full navigation visible
- Enhanced spacing (24px)
- Side-by-side components

#### 2.5 Add Large Desktop Optimizations

Optimize for large screens (>1280px):

```scss
.product-card {
  // ... mobile, tablet, desktop-sm styles ...
  
  @include respond-to-desktop-lg {
    // Desktop-lg: Maximum layout density
    max-width: 1400px;
    margin: 0 auto;
    
    .card-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}
```

**Desktop-LG Rules to Follow:**
- Maximum layout density
- Centered content with max-width
- 4+ column grids
- Enhanced visual effects

---

### Phase 3: Testing

#### 3.1 Browser DevTools Testing

Use Chrome DevTools for responsive testing:

1. **Open DevTools**: F12 or Cmd+Option+I
2. **Toggle Device Toolbar**: Cmd+Shift+M (Mac) or Ctrl+Shift+M (Windows)
3. **Test Breakpoints**:
   - iPhone SE: 375x667 (mobile)
   - iPad: 768x1024 (tablet)
   - Desktop: 1024x768 (desktop-sm)
   - Large Desktop: 1440x900 (desktop-lg)

#### 3.2 Breakpoint Testing Checklist

Test each breakpoint systematically:

**Mobile (≤560px)**
- [ ] Single-column layout
- [ ] No horizontal scroll
- [ ] Touch targets ≥44x44px
- [ ] Text readable (≥12px)
- [ ] Inputs full width
- [ ] Buttons stacked or full width
- [ ] Navigation accessible

**Tablet (≤780px)**
- [ ] 2-column grids where appropriate
- [ ] Adjusted spacing
- [ ] Horizontal headers
- [ ] Collapsible navigation
- [ ] Touch targets adequate

**Desktop-SM (≤1024px)**
- [ ] 3-4 column grids
- [ ] Full navigation visible
- [ ] Enhanced spacing
- [ ] Side-by-side components
- [ ] No layout issues

**Desktop-LG (>1280px)**
- [ ] Maximum layout density
- [ ] Centered content
- [ ] 4+ column grids
- [ ] Enhanced visual effects

#### 3.3 Cross-Browser Testing

Test on multiple browsers:

- **Desktop**: Chrome, Firefox, Safari, Edge
- **Mobile**: iOS Safari, Android Chrome
- **Tablet**: iPad Safari, Android Chrome

#### 3.4 Real Device Testing (Recommended)

Test on actual devices when possible:
- Physical smartphone (iOS/Android)
- Physical tablet (iPad/Android tablet)
- Different screen sizes

---

### Phase 4: Documentation

#### 4.1 Document Component Behavior

Add responsive documentation to your component:

```scss
// ============================================
// ProductCard Component
// ============================================
// Responsive Behavior:
// - Mobile (≤560px): Single column, stacked layout, full-width buttons
// - Tablet (≤780px): 2-column grid, horizontal header
// - Desktop (≤1024px): 3-column grid, enhanced spacing
// - Desktop-LG (>1280px): 4-column grid, max-width container
// ============================================

@import "../../styles/breakpoints";

.product-card {
  // ... styles ...
}
```

#### 4.2 Update Component Documentation

If the component has a separate documentation file, update it:

```markdown
## ProductCard Component

### Responsive Behavior
- **Mobile (≤560px)**: Single column, stacked layout, full-width buttons
- **Tablet (≤780px)**: 2-column grid, horizontal header
- **Desktop (≤1024px)**: 3-column grid, enhanced spacing
- **Desktop-LG (>1280px)**: 4-column grid, max-width container

### Touch Targets
- Minimum size: 44x44px
- Spacing: 8px between targets

### Content Priority
1. Product image and title
2. Price and add to cart button
3. Product description (expandable)
4. Additional details (in drawer)
```

---

## Common Patterns & Solutions

### Problem: Table Doesn't Fit on Mobile

**Solution 1: Horizontal Scroll**
```scss
.table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.data-table {
  min-width: 780px;
}
```

**Solution 2: Card View**
```scss
@include respond-to-mobile {
  .data-table {
    display: block;
    
    thead { display: none; }
    
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
      
      &::before {
        content: attr(data-label);
        font-weight: 600;
      }
    }
  }
}
```

### Problem: Buttons Overlap on Mobile

**Solution: Stack Buttons**
```scss
.button-group {
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

### Problem: Navigation Doesn't Fit on Mobile

**Solution: Hamburger Menu**
```scss
.nav-toggle {
  display: block;
  
  @include respond-above-tablet {
    display: none;
  }
}

.nav-menu {
  display: none;
  
  @include respond-above-tablet {
    display: flex;
  }
  
  &.open {
    display: flex;
    position: fixed;
    inset: 0;
    z-index: 50;
    flex-direction: column;
    background: var(--surface);
  }
}
```

### Problem: Modal Too Small on Mobile

**Solution: Full-Screen Modal**
```scss
.modal-content {
  width: 100%;
  max-width: 100%;
  border-radius: 0;
  
  @include respond-to-tablet {
    max-width: 600px;
    border-radius: 12px;
  }
}
```

---

## Utility Classes Quick Reference

Use these pre-built utility classes from `_responsive-utilities.scss`:

### Grid
- `.responsive-grid` - 1 → 2 → 3 → 4 columns
- `.responsive-grid-2` - 1 → 2 columns
- `.responsive-grid-3` - 1 → 2 → 3 columns

### Flex
- `.responsive-flex-row` - Column → Row
- `.responsive-flex-center` - Column center → Row center
- `.responsive-flex-between` - Column → Row space-between

### Spacing
- `.responsive-padding` - 16px → 24px → 32px
- `.responsive-gap` - 12px → 16px → 24px

### Buttons
- `.responsive-button-group` - Stacked → Horizontal

### Forms
- `.responsive-form-grid` - 1 → 2 → 3 columns

### Display
- `.hide-mobile` - Hide on mobile
- `.show-mobile-only` - Show only on mobile

---

## Performance Best Practices

### 1. Minimize Repaints
```scss
// Good: Use transform instead of left/right
.sidebar {
  transform: translateX(-100%);
  transition: transform 250ms ease;
}

// Avoid: Using left/right for animations
.sidebar {
  left: -100%;
  transition: left 250ms ease;
}
```

### 2. Use Will-Change Sparingly
```scss
// Use only for animated elements
.animated-element {
  will-change: transform;
}
```

### 3. Optimize Images
```scss
.responsive-image {
  max-width: 100%;
  height: auto;
  display: block;
}
```

### 4. Avoid Expensive Shadows on Mobile
```scss
.card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  @include respond-to-mobile {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
```

---

## Accessibility Guidelines

### Touch Targets
- Minimum size: 44x44px
- Spacing: 8px between targets
- Padding: 12px minimum

### Font Sizes
- Body text: minimum 12px
- Headings: scale appropriately
- Input text: 16px (prevents iOS zoom)

### Color Contrast
- Normal text: 4.5:1 ratio
- Large text: 3:1 ratio
- Interactive elements: 3:1 ratio

### Keyboard Navigation
- All interactive elements keyboard accessible
- Logical tab order
- Visible focus states
- Escape key closes modals/menus

---

## Troubleshooting

### Issue: Styles Not Applying

**Check:**
1. Breakpoints imported correctly: `@import "../../styles/breakpoints" as *;`
2. Mixin syntax correct: `@include respond-to-tablet { ... }`
3. SCSS compiled successfully
4. No CSS specificity conflicts

### Issue: Horizontal Scroll on Mobile

**Solutions:**
1. Check for fixed widths: Use `max-width: 100%` instead
2. Check for overflow: Add `overflow-x: hidden` to container
3. Check for large elements: Scale down or hide on mobile

### Issue: Text Too Small on Mobile

**Solutions:**
1. Set minimum font size: `font-size: 12px`
2. Use relative units: `rem` or `em`
3. Scale text with breakpoints

### Issue: Touch Targets Too Small

**Solutions:**
1. Set minimum size: `min-width: 44px; min-height: 44px`
2. Add padding: `padding: 12px`
3. Increase spacing between targets

---

## Code Review Checklist

When reviewing responsive code, check:

- [ ] Breakpoints imported correctly
- [ ] Mobile-first approach used
- [ ] All breakpoints tested
- [ ] Touch targets adequate (≥44x44px)
- [ ] Text readable (≥12px)
- [ ] No horizontal scroll on mobile
- [ ] Performance optimized
- [ ] Accessibility considered
- [ ] Documentation updated
- [ ] Cross-browser tested

---

## Resources

### Internal Documentation
- `RESPONSIVE_DESIGN_PLAN.md` - Comprehensive plan
- `RESPONSIVE_PATTERNS.md` - Component patterns
- `_breakpoints.scss` - Breakpoint definitions
- `_responsive-utilities.scss` - Utility classes
- `responsive-guidelines.md` - Basic guidelines

### External Resources
- [MDN Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [Material Design Responsive](https://material.io/design/layout/responsive-layout-grid.html)
- [CSS Grid Documentation](https://css-tricks.com/snippets/css/complete-guide-grid/)

---

## Getting Help

If you encounter issues:

1. Check this documentation first
2. Review `RESPONSIVE_PATTERNS.md` for similar components
3. Test in browser DevTools
4. Ask team members for code review
5. Create an issue with screenshots and device info

---

**Remember**: Responsive design is iterative. Start with mobile, test frequently, and refine based on real device testing.
