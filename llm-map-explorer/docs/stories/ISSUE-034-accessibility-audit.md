# Issue #34: Accessibility Audit and Fixes

**Sprint:** Sprint 6 (Week 11-12)
**Story Points:** 5
**Priority:** P0
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)
**Status:** Ready for Review

---

## 📖 User Story

**As a** user with accessibility needs
**I want** the application to be fully accessible via keyboard and screen reader
**So that** I can use the app regardless of my abilities or assistive devices

---

## 🎯 Goal

Conduct comprehensive accessibility audit using axe-core and manual testing, then implement fixes to achieve WCAG 2.1 AA compliance across all components. Zero critical violations, proper keyboard navigation, and full screen reader support.

---

## 📋 Acceptance Criteria

### ✅ Automated Accessibility Testing (axe-core)
- [ ] `tests/a11y/accessibility.spec.ts` created with Playwright + axe-core
- [ ] All pages scanned: home, map, tours, panels
- [ ] Zero critical violations (severity: critical)
- [ ] Zero serious violations (severity: serious)
- [ ] Warnings reviewed and documented
- [ ] Accessibility tests integrated into CI/CD pipeline
- [ ] Tests run on every PR

### ✅ Keyboard Navigation
- [ ] All interactive elements reachable via Tab key
- [ ] Tab order logical (left-to-right, top-to-bottom)
- [ ] No keyboard traps (focus can escape any element)
- [ ] Enter/Space activates buttons and links
- [ ] Escape closes panels and dialogs
- [ ] Arrow keys navigate lists and menus
- [ ] Visible focus indicator on all focusable elements (min 3px, contrast 3:1)
- [ ] Keyboard navigation map documented in README.md

### ✅ ARIA Labels & Landmarks
- [ ] All buttons have descriptive aria-label or visible text
- [ ] All icons have aria-label (e.g., map icon)
- [ ] All form inputs have associated labels
- [ ] All panels have role="main", role="complementary", etc.
- [ ] Landmark regions defined (header, main, navigation, contentinfo)
- [ ] Live regions (aria-live) for dynamic content
- [ ] ARIA descriptions for complex components

### ✅ Color & Contrast
- [ ] All text has minimum 4.5:1 contrast ratio (normal text)
- [ ] All UI components have minimum 3:1 contrast ratio
- [ ] Color not sole means of conveying information
- [ ] Map features distinguishable without color (patterns, icons)
- [ ] Error messages not color-only
- [ ] Focus indicators visible (not relying on color alone)

### ✅ Screen Reader Support
- [ ] All content accessible via screen reader (NVDA/JAWS tested)
- [ ] Heading hierarchy proper (h1 > h2 > h3, no skips)
- [ ] Lists marked with `<ul>`, `<ol>`, `<li>`
- [ ] Table data marked with `<table>`, `<thead>`, `<th>`, `<tr>`, `<td>`
- [ ] Form labels associated with inputs (htmlFor)
- [ ] Required fields marked with aria-required or asterisk
- [ ] Error messages announced to screen readers
- [ ] Skip link to main content present

### ✅ Focus Management
- [ ] Focus managed on dialog/panel open (trap within component)
- [ ] Focus restored on dialog/panel close
- [ ] Initial focus on first interactive element (dialogs)
- [ ] Roving tabindex implemented for list items (optional but recommended)
- [ ] No auto-focus on non-modal elements

### ✅ Motion & Animation
- [ ] Respect prefers-reduced-motion media query
- [ ] Animations disabled or simplified for users with motion sensitivity
- [ ] Auto-playing media can be paused/stopped
- [ ] No flashing content (more than 3x per second)
- [ ] Animations don't distract from content

### ✅ Responsive & Mobile Accessibility
- [ ] Minimum touch target size 44x44px
- [ ] Form inputs at least 16px font (prevents zoom on iOS)
- [ ] Responsive design tested with accessibility tools
- [ ] Mobile panels accessible (bottom sheet, not side panel)
- [ ] Touch gestures have keyboard equivalents

### ✅ Component-Specific Fixes
- [ ] MapContainer: keyboard pan/zoom (arrow keys, +/-, wheel)
- [ ] SearchBar: combobox pattern with ARIA
- [ ] Buttons: no empty buttons (must have aria-label or text)
- [ ] Links: no "click here" text; descriptive link text
- [ ] Panels: proper roles (complementary, main, dialog)
- [ ] Tour interface: keyboard shortcuts documented
- [ ] Landmarks: hover states keyboard accessible (focus)

### ✅ Testing Coverage
- [ ] Unit tests for ARIA attributes
- [ ] E2E accessibility tests for critical paths
- [ ] Manual testing with real assistive technologies
- [ ] Testing with keyboard only (no mouse)
- [ ] Testing with screen reader (NVDA or JAWS)
- [ ] Color contrast checker tool validation
- [ ] Lighthouse accessibility audit ≥95

---

## 🛠️ Technical Implementation

### Step 1: Set Up Automated Testing with axe-core

Create `tests/a11y/accessibility.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test.describe('Accessibility Audit', () => {
  test('home page has no critical violations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await injectAxe(page);

    const results = await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
    });

    // Check for critical violations
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('map page has no serious violations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="map-container"]');
    await injectAxe(page);

    const results = await checkA11y(page, '[data-testid="map-container"]', {
      detailedReport: true,
    });

    // Allow warnings but not serious/critical
    const seriousViolations = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );
    expect(seriousViolations).toHaveLength(0);
  });

  test('info panel has no violations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Click a landmark to open info panel
    await page.click('[data-testid="landmark-marker"]');
    await page.waitForSelector('[role="complementary"]');
    await injectAxe(page);

    const results = await checkA11y(page, '[role="complementary"]');
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });

  test('tour panel has no violations', async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Start a tour
    await page.click('button:has-text("Tours")');
    await page.click('[role="article"]:first-child button:has-text("Start")');
    await page.waitForSelector('[data-testid="tour-panel"]');
    await injectAxe(page);

    const results = await checkA11y(page, '[data-testid="tour-panel"]');
    expect(results.violations.filter((v) => v.impact === 'critical')).toHaveLength(0);
  });
});
```

---

### Step 2: Add Keyboard Navigation Tests

Create `tests/a11y/keyboard-navigation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Keyboard Navigation', () => {
  test('tab navigates through all interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Start tabbing
    let focusedCount = 0;
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus');
      const isVisible = await focused.isVisible();
      if (isVisible) focusedCount++;
    }

    expect(focusedCount).toBeGreaterThan(5);
  });

  test('escape closes open panels', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Open info panel
    await page.click('[data-testid="landmark-marker"]');
    await expect(page.locator('[role="complementary"]')).toBeVisible();

    // Press Escape
    await page.keyboard.press('Escape');

    // Panel should close
    await expect(page.locator('[role="complementary"]')).toBeHidden();
  });

  test('enter activates buttons from keyboard', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Focus search button with Tab
    let found = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus');
      const text = await focused.textContent();
      if (text?.includes('Search')) {
        found = true;
        break;
      }
    }

    expect(found).toBeTruthy();

    // Press Enter
    await page.keyboard.press('Enter');
    // Verify action occurred
  });

  test('arrow keys navigate map (pan)', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="map-container"]'); // Focus map

    const initialCenter = await page.evaluate(() => {
      // Get map center from store or Leaflet
      return JSON.stringify((window as any).map.getCenter());
    });

    // Press Up arrow to pan north
    await page.keyboard.press('ArrowUp');

    const newCenter = await page.evaluate(() => {
      return JSON.stringify((window as any).map.getCenter());
    });

    expect(initialCenter).not.toEqual(newCenter);
  });

  test('no keyboard traps', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab through 50 times and verify we don't get stuck
    let previousElement = '';
    let stuckCount = 0;

    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.locator(':focus').textContent();

      if (focused === previousElement) {
        stuckCount++;
      }
      previousElement = focused || '';
    }

    // Allow 1-2 repeats but not constant
    expect(stuckCount).toBeLessThan(5);
  });

  test('focus visible on all interactive elements', async ({ page }) => {
    await page.goto('http://localhost:3000');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    const boxShadow = await focused.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.boxShadow || style.outline;
    });

    // Should have visible focus indicator
    expect(boxShadow).not.toBe('none');
  });
});
```

---

### Step 3: Update Components with ARIA Labels

Update map components:

```typescript
// src/components/map/MapContainer.tsx
<div
  data-testid="map-container"
  role="application"
  aria-label="Interactive map of LLM research landscape"
  onKeyDown={handleKeyboardNavigation}
>
  <Leaflet map instance />
</div>

// src/components/map/LandmarkMarker.tsx
<Marker
  position={landmark.coordinates}
  title={landmark.name}
  aria-label={`${landmark.name}, ${landmark.type}`}
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick();
  }}
/>

// src/components/panels/InfoPanel.tsx
<div
  role="complementary"
  aria-label="Entity details panel"
  data-testid="info-panel"
>
  {/* content */}
</div>

// src/components/search/SearchBar.tsx
<div role="combobox" aria-expanded={isOpen} aria-owns="search-results">
  <input
    type="text"
    aria-label="Search for papers, models, or topics"
    aria-autocomplete="list"
    aria-controls="search-results"
    aria-activedescendant={activeResult?.id}
  />
</div>
```

---

### Step 4: Add Keyboard Shortcut Documentation

Update `src/lib/keyboard-shortcuts.ts`:

```typescript
export const KEYBOARD_SHORTCUTS = {
  ESCAPE: {
    key: 'Escape',
    description: 'Close open panels and dialogs',
    handler: closeActivePanel,
  },
  TAB: {
    key: 'Tab',
    description: 'Navigate between interactive elements',
    handler: focusNext,
  },
  SHIFT_TAB: {
    key: 'Shift+Tab',
    description: 'Navigate backwards',
    handler: focusPrevious,
  },
  ENTER: {
    key: 'Enter',
    description: 'Activate focused button or link',
    handler: activateFocused,
  },
  SPACE: {
    key: 'Space',
    description: 'Toggle focused button',
    handler: toggleFocused,
  },
  ARROW_UP: {
    key: 'Arrow Up',
    description: 'Pan map north or navigate list up',
    handler: panNorth,
  },
  ARROW_DOWN: {
    key: 'Arrow Down',
    description: 'Pan map south or navigate list down',
    handler: panSouth,
  },
  ARROW_LEFT: {
    key: 'Arrow Left',
    description: 'Pan map west or navigate list left',
    handler: panWest,
  },
  ARROW_RIGHT: {
    key: 'Arrow Right',
    description: 'Pan map east or navigate list right',
    handler: panEast,
  },
  BRACKET_LEFT: {
    key: '[',
    description: 'Previous tour stage',
    handler: previousTourStage,
  },
  BRACKET_RIGHT: {
    key: ']',
    description: 'Next tour stage',
    handler: nextTourStage,
  },
  PLUS: {
    key: '+',
    description: 'Zoom in',
    handler: zoomIn,
  },
  MINUS: {
    key: '-',
    description: 'Zoom out',
    handler: zoomOut,
  },
  CTRL_F: {
    key: 'Ctrl+F',
    description: 'Focus search bar',
    handler: focusSearch,
  },
  SLASH: {
    key: '?',
    description: 'Show keyboard shortcuts help',
    handler: showKeyboardHelp,
  },
} as const;
```

---

### Step 5: Fix Focus Management in Dialogs

Create `src/hooks/useFocusTrap.ts`:

```typescript
import { useEffect, useRef } from 'react';

export const useFocusTrap = (elementRef: React.RefObject<HTMLElement>) => {
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Get all focusable elements
    const focusableElements = Array.from(
      element.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    ) as HTMLElement[];

    if (focusableElements.length === 0) return;

    // Focus first element
    focusableElements[0].focus();

    // Trap Tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const isTabbing = !e.shiftKey;

      if (isTabbing && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      } else if (!isTabbing && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    };

    element.addEventListener('keydown', handleKeyDown);

    return () => {
      element.removeEventListener('keydown', handleKeyDown);
      // Restore focus to previous element
      previousActiveElement.current?.focus();
    };
  }, [elementRef]);
};
```

---

### Step 6: Add prefers-reduced-motion Support

Create/update CSS for animations:

```css
/* animations.css */

/* Default animations */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.panel-enter {
  animation: slideIn 0.3s ease-out;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  .panel-enter {
    animation: none;
    transform: translateX(0);
    opacity: 1;
  }
}
```

---

### Step 7: Create Accessibility Checklist Component

Create `src/components/a11y/AccessibilityChecklist.tsx` (internal tool):

```typescript
import React from 'react';

interface ChecklistItem {
  category: string;
  items: string[];
  status: 'pass' | 'fail' | 'warning';
}

export const AccessibilityChecklist: React.FC<{ items: ChecklistItem[] }> = ({
  items,
}) => {
  return (
    <div className="p-4 bg-white rounded-lg border">
      <h2 className="text-xl font-bold mb-4">Accessibility Checklist</h2>
      {items.map((group) => (
        <div key={group.category} className="mb-4">
          <h3 className="font-semibold text-lg mb-2">{group.category}</h3>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li
                key={item}
                className={`flex items-center gap-2 ${
                  group.status === 'pass'
                    ? 'text-green-600'
                    : group.status === 'fail'
                      ? 'text-red-600'
                      : 'text-yellow-600'
                }`}
              >
                <span>{group.status === 'pass' ? '✅' : group.status === 'fail' ? '❌' : '⚠️'}</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
```

---

### Step 8: Document Accessibility in README

Add section to `README.md`:

```markdown
## Accessibility

Terra Incognita Linguae is committed to WCAG 2.1 AA compliance.

### Keyboard Navigation

- **Tab** / **Shift+Tab** - Navigate between elements
- **Enter** / **Space** - Activate buttons and links
- **Escape** - Close panels and dialogs
- **Arrow Keys** - Pan map or navigate lists
- **[** / **]** - Previous/next tour stage
- **+** / **-** - Zoom in/out
- **Ctrl+F** - Focus search
- **?** - Show keyboard shortcuts

### Screen Reader Support

All content is accessible via screen readers (NVDA, JAWS, VoiceOver).
- Proper heading hierarchy
- Descriptive ARIA labels
- Semantic HTML
- Form labels associated with inputs

### Accessibility Testing

Run accessibility tests:

```bash
npm run test:a11y
```

Lighthouse audit:

```bash
npm run lighthouse
```

### Report Accessibility Issues

Found an accessibility issue? Please report it on [GitHub Issues](https://github.com/your-repo/issues).
```

---

## 🧪 Testing Checklist

### Automated Testing
- [ ] Run `npm run test:a11y` - no critical violations
- [ ] Lighthouse accessibility score ≥95
- [ ] axe-core scan passes on all pages
- [ ] No warnings in browser console

### Keyboard Navigation Testing
- [ ] Tab navigates through all interactive elements
- [ ] Tab order is logical (left-to-right, top-to-bottom)
- [ ] No keyboard traps
- [ ] Escape closes panels
- [ ] Enter/Space activates buttons
- [ ] Arrow keys work in lists and map

### Screen Reader Testing
- [ ] Test with NVDA (Windows) or VoiceOver (Mac)
- [ ] All content readable via screen reader
- [ ] Landmarks announced correctly
- [ ] Form labels associated
- [ ] Errors announced

### Color Contrast Testing
- [ ] Use WebAIM contrast checker
- [ ] All text ≥4.5:1
- [ ] UI components ≥3:1
- [ ] Focus indicators visible

### Manual Testing
- [ ] Navigation without mouse
- [ ] Touch interaction on mobile
- [ ] High contrast mode
- [ ] Zoom to 200%
- [ ] Text size increase
- [ ] Motion reduced setting

---

## 📚 Reference Documentation

- **WCAG 2.1 Guidelines:** https://www.w3.org/WAI/WCAG21/quickref/
- **Axe DevTools:** https://www.deque.com/axe/devtools/
- **ARIA Authoring Practices:** https://www.w3.org/WAI/ARIA/apg/
- **Web Content Accessibility Guidelines:** https://www.w3.org/WAI/standards-guidelines/wcag/

---

## 🔗 Dependencies

**Depends On:**
- All UI components (all sprints)

**Blocks:**
- Issue #37 (Vercel Deployment)
- Issue #38 (CI/CD Pipeline)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ Axe-core audit: 0 critical violations
- [ ] ✅ Axe-core audit: 0 serious violations
- [ ] ✅ Keyboard navigation fully tested
- [ ] ✅ Screen reader testing completed
- [ ] ✅ Color contrast verified
- [ ] ✅ Focus management implemented
- [ ] ✅ ARIA labels added to all components
- [ ] ✅ Accessibility tests integrated into CI
- [ ] ✅ Documentation updated
- [ ] ✅ Code reviewed and approved

---

## 📝 Notes for Implementation

### Time Estimate
- **Audit & Testing:** 2 hours
- **Component Fixes:** 1.5 hours
- **Testing Integration:** 45 minutes
- **Documentation:** 30 minutes
- **Total:** ~5 hours (5 story points)

### Best Practices
1. **Test early and often** - Don't wait until sprint end
2. **Use real assistive tech** - Automated tools catch ~30% of issues
3. **Keyboard-first mindset** - If it works on keyboard, likely accessible
4. **Test with disabled users** - If possible, get feedback from community
5. **Maintain accessibility** - Add tests for regressions

### Common Pitfalls
1. **Forgetting ARIA labels on icons** - Every icon needs aria-label or title
2. **Color-only differentiation** - Use patterns/icons/text too
3. **Missing focus states** - Every focusable element needs visible focus
4. **Auto-playing media** - Must be pausable
5. **Focus traps** - Dialogs need proper focus management

---

## 🎯 Success Criteria

**This issue is successfully complete when:**

✅ Zero critical accessibility violations detected
✅ Keyboard navigation works across entire app
✅ Screen reader can access all content
✅ Color contrast meets WCAG AA standards
✅ All automated tests pass
✅ Manual testing confirms accessibility
✅ Documentation complete and accurate

---

**Ready to implement?** Start with axe-core audit, then systematically fix violations by component.

**Estimated Completion:** Day 3-4 of Sprint 6

---

**Issue Metadata:**
- **Sprint:** Sprint 6
- **Milestone:** Milestone 4 - Polish & Production
- **Labels:** `P0`, `accessibility`, `WCAG`, `testing`, `sprint-6`
- **Story Points:** 5

---

*Accessibility is a journey, not a destination. Keep testing, keep learning, and keep improving.*
