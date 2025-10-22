# Design System

## Overview

This document defines the design tokens and patterns used throughout Terra Incognita Linguae. Following these guidelines ensures visual consistency and helps maintain a cohesive user experience.

---

## 🎨 Colors

### Semantic Colors

These colors represent common UI states and should be used consistently across components.

#### Success
- **Token:** `success-50` to `success-900`
- **Primary:** `#10b981` (green)
- **Usage:** Success messages, completed actions, validated forms

#### Error / Destructive
- **Token:** `destructive-50` to `destructive-900`
- **Primary:** `#ef4444` (red)
- **Usage:** Error messages, delete actions, invalid states

#### Warning / Attention
- **Token:** `warning-50` to `warning-900`
- **Primary:** `#f59e0b` (amber)
- **Usage:** Warnings, pending states, important notices

#### Info
- **Token:** `info-50` to `info-900`
- **Primary:** `#3b82f6` (blue)
- **Usage:** Information, tips, help text

#### Neutral
- **Token:** `muted-50` to `muted-900`
- **Primary:** `#6b7280` (gray)
- **Usage:** Disabled states, secondary text, borders

### Color Accessibility

- **Text Contrast:** Minimum 4.5:1 for normal text, 3:1 for UI components
- **Color Alone:** Never use color as the only way to convey information
- **Palettes:** Designed for color-blind accessibility (deuteranopia friendly)

---

## 📝 Typography

### Font Families

```css
/* Body Text */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Code / Technical */
font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
```

### Font Sizes

| Class | Size | Use Case |
|-------|------|----------|
| `text-xs` | 12px / 0.75rem | Labels, captions |
| `text-sm` | 14px / 0.875rem | Secondary text, help text |
| `text-base` | 16px / 1rem | Body text (default) |
| `text-lg` | 18px / 1.125rem | Card titles, subheadings |
| `text-xl` | 20px / 1.25rem | Section titles |
| `text-2xl` | 24px / 1.5rem | Page titles |

### Font Weights

| Weight | Name | Use Case |
|--------|------|----------|
| 400 | Regular | Body text |
| 500 | Medium | UI labels |
| 600 | Semibold | Subheadings |
| 700 | Bold | Headings |

### Heading Hierarchy

```
h1: 24px, bold
h2: 20px, semibold
h3: 18px, semibold
h4: 16px, medium
```

**Important:** Always maintain semantic heading hierarchy (h1 → h2 → h3) for accessibility.

### Line Height

```
Body Text: 1.5 (line-height: 24px)
Headings: 1.2 (line-height: 28px)
Input Fields: 1.5
```

---

## 🎯 Spacing

### Spacing Scale

All spacing follows an 8px base unit for consistency.

| Value | Pixels | CSS Class |
|-------|--------|-----------|
| 0 | 0px | `p-0` |
| 1 | 4px | `p-1` |
| 2 | 8px | `p-2` |
| 3 | 12px | `p-3` |
| 4 | 16px | `p-4` |
| 6 | 24px | `p-6` |
| 8 | 32px | `p-8` |
| 12 | 48px | `p-12` |
| 16 | 64px | `p-16` |

### Common Patterns

```
Compact Layout: 8px (p-2)
Standard Layout: 16px (p-4)
Spacious Layout: 24px (p-6)
Sections: 32px (p-8)
```

---

## 🎬 Animation

### Durations

| Duration | Milliseconds | Use Case |
|----------|-------------|----------|
| Fast | 150ms | Hover effects, button feedback |
| Normal | 300ms | Panel slide, fade transitions |
| Slow | 500ms | Tour transitions, emphasis |
| Slowest | 700ms | Important state changes |

### Easing Functions

```typescript
// For entrances (things appearing)
easeOut: cubic-bezier(0, 0, 0.2, 1)

// For exits (things disappearing)
easeIn: cubic-bezier(0.4, 0, 1, 1)

// For continuous transitions
easeInOut: cubic-bezier(0.4, 0, 0.2, 1)
```

### Keyframe Animations

```
slideInRight: 300ms ease-out (from right)
slideOutRight: 200ms ease-in (to right)
fadeIn: 300ms ease-out
fadeOut: 200ms ease-in
scaleIn: 300ms ease-out
```

### Accessibility

**Respect prefers-reduced-motion:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
```

All animations should be optional and should not impair functionality.

---

## 🔲 Shadows

### Shadow Scale

```css
/* Small elevation */
shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);

/* Medium elevation (default) */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);

/* Large elevation */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);

/* Extra large elevation */
shadow-xl: 0 20px 25px rgba(0, 0, 0, 0.1);
```

### Usage

- **Default:** `shadow-md` for most cards and panels
- **Hover:** `shadow-lg` when cards/panels are hovered
- **Floating:** `shadow-lg` or `shadow-xl` for floating elements

---

## ⌨️ Focus States

### Keyboard Focus Indicators

All interactive elements must have visible focus states for keyboard navigation.

```css
/* Standard focus state */
focus:outline-none
focus:ring-2
focus:ring-primary
focus:ring-offset-2

/* On dark backgrounds */
focus:ring-offset-background
```

### Minimum Size

- **Touch targets:** 44x44px minimum
- **Focus indicator:** Minimum 3px outline
- **Contrast:** Focus indicator must have 3:1 contrast with adjacent colors

---

## 🖱️ Interactive Elements

### Buttons

**States:**
- Default: Background color, readable text
- Hover: Lighter background (desktop only)
- Active/Pressed: Darker background
- Disabled: Gray background, no hover
- Focus: Visible outline (keyboard)

**Sizes:**
- Small: 8px padding, 14px text
- Medium: 12px padding, 16px text (default)
- Large: 16px padding, 18px text

### Links

**States:**
- Default: Colored text, underline on hover
- Visited: Slightly different color (optional)
- Hover: Color change or underline
- Focus: Outline (keyboard)

**Best Practice:** Avoid "click here" - use descriptive link text

### Forms

**Input Focus:**
- Border: Primary color
- Shadow: Subtle focus shadow
- Label: Clear association

**Error State:**
- Border: Red/destructive color
- Error message: Below input, red text
- Icon: Optional validation icon

**Placeholder:**
- Color: Muted/gray
- Should not contain required information

---

## 🔍 Icon Guidelines

### Icon Set

Using [Lucide React](https://lucide.dev/) for consistency.

### Icon Sizes

```
16px: Small icons, next to text
20px: Standard icons in UI
24px: Prominent icons, buttons
32px: Large icons, empty states
```

### Icon Colors

Match surrounding text or use semantic colors:
- Text: `currentColor` or same as text
- Error: Use error/destructive color
- Success: Use success color
- Info: Use info color

### Accessibility

```tsx
// Icon with label
<Heart className="h-5 w-5" aria-label="Favorite" />

// Icon in button (button handles aria-label)
<Button aria-label="Delete item">
  <Trash className="h-5 w-5" />
</Button>

// Icon with adjacent text (no label needed)
<Clock className="h-5 w-5" />
<span>5 minutes</span>
```

---

## 📱 Responsive Design

### Breakpoints

```
Mobile: 320px - 640px
Tablet: 641px - 1024px
Desktop: 1025px+
```

### Responsive Spacing

```
Mobile: 12px (p-3)
Tablet: 16px (p-4)
Desktop: 24px (p-6)
```

---

## ♿ Accessibility Guidelines

### WCAG 2.1 AA Compliance

- **Color Contrast:** 4.5:1 for text, 3:1 for UI components
- **Touch Targets:** Minimum 44x44px
- **Keyboard Navigation:** All interactive elements reachable via Tab
- **Focus Indicators:** Visible on all focusable elements
- **ARIA Labels:** All buttons and icons have labels

### Motion

- Respect `prefers-reduced-motion`
- Animations enhance, not hinder usability
- No automatic media playback
- No flashing content

### Form Design

- Labels associated with inputs
- Error messages clear and accessible
- Required fields marked
- Helpful placeholder text

---

## 🎭 Component Patterns

### Cards

**Structure:**
```
Header (optional)
├─ Title
├─ Subtitle/Meta
Content (required)
├─ Description
├─ Visual element
Footer (optional)
├─ Action buttons
└─ Secondary info
```

**Spacing:**
- Header to Content: 16px
- Content sections: 12px gap
- Content to Footer: 16px

### Panels

**Right Panel (Desktop):**
- Width: 384px
- Animation: Slide in from right (300ms)
- Always visible on desktop
- Bottom sheet on mobile

### Lists

**Item Height:** Minimum 44px for touch, 36px for desktop
**Spacing:** 8px between items
**Hover:** Subtle background change, never remove

### Modals/Dialogs

**Overlay:** Semi-transparent dark background
**Width:** 90% or max 600px
**Animation:** Fade in (300ms) + scale (300ms)
**Keyboard:** Escape closes, Tab trapped within

---

## 📋 Component Checklist

When creating new components:

- [ ] Semantic HTML used
- [ ] Accessible keyboard navigation
- [ ] ARIA labels/roles appropriate
- [ ] Color contrast ≥4.5:1 for text
- [ ] Focus states visible
- [ ] Responsive design
- [ ] Mobile touch-friendly (44x44px)
- [ ] Animations respect prefers-reduced-motion
- [ ] Loading states defined
- [ ] Error states defined
- [ ] JSDoc comments added
- [ ] Tests included (unit + E2E)

---

## 🔗 Related Documentation

- [Animations](./animations.ts) - Animation token definitions
- [Components](./components.md) - Component documentation
- [Accessibility](./accessibility.md) - Detailed accessibility guidelines
- [Architecture](./architecture.md) - Technical system design

---

**Last Updated:** October 2025
**Version:** 1.0
