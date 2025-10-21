# Issue #23: "Highlight on Map" Button

**Sprint:** Sprint 4 (Week 7-8)

**Story Points:** 2

**Priority:** P1

**Labels:** panel, interaction

**Dependencies:** #22

**Reference:** [prd.md Section 6.10](../prd.md)

---

## Title

Add "Highlight on Map" button to organization InfoPanel

---

## Description

Enable users to highlight all contributions from an organization via a button in the InfoPanel. When clicked, all landmarks from that organization are highlighted on the map with visual emphasis and dimming of others.

---

## Acceptance Criteria

- [ ] "Highlight on Map" button added to organization InfoPanel
- [ ] Button triggers `highlightOrganization()` action from store
- [ ] Button text changes to "Clear Highlights" when active
- [ ] Visual feedback: button state changes when highlighting active
- [ ] Accessible: keyboard accessible, aria-pressed state updated
- [ ] Unit test verifies button triggers correct action
- [ ] E2E test verifies end-to-end flow (click button → map updates)

---

## Technical Details

### Button Component Logic

```typescript
// In organization detail view of InfoPanel
export function OrganizationDetail({ organization }: Props) {
  const { highlightedOrgId, highlightOrganization, clearHighlights } = useMapStore();
  const isHighlighted = highlightedOrgId === organization.id;

  const handleToggleHighlight = () => {
    if (isHighlighted) {
      clearHighlights();
    } else {
      highlightOrganization(organization.id);
    }
  };

  return (
    <div className="organization-detail">
      <h2>{organization.name}</h2>
      <p>{organization.description}</p>

      <Button
        onClick={handleToggleHighlight}
        aria-pressed={isHighlighted}
        className={cn(
          'highlight-button',
          isHighlighted && 'highlight-button-active'
        )}
      >
        {isHighlighted ? 'Clear Highlights' : 'Highlight on Map'}
      </Button>

      {/* Other org details */}
    </div>
  );
}
```

### Button Styling

```css
.highlight-button {
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 200ms ease-out;
  background-color: var(--secondary);
  color: var(--secondary-foreground);
  border: 2px solid transparent;
}

.highlight-button:hover:not([aria-pressed="true"]) {
  background-color: var(--secondary-dark);
}

/* Active state - button changes color to org color */
.highlight-button-active {
  background-color: var(--org-color);
  color: white;
  border-color: var(--org-color);
  box-shadow: 0 0 12px rgba(var(--org-color-rgb), 0.3);
}

.highlight-button-active:hover {
  opacity: 0.9;
}
```

### Aria Attributes

```typescript
<Button
  onClick={handleToggleHighlight}
  aria-pressed={isHighlighted}  // Toggles between true/false
  aria-label={
    isHighlighted
      ? `Clear highlights for ${organization.name} contributions`
      : `Highlight all ${organization.name} contributions on the map`
  }
>
  {isHighlighted ? 'Clear Highlights' : 'Highlight on Map'}
</Button>
```

---

## User Flow

### 1. Initial State
- User views organization in InfoPanel (e.g., "OpenAI")
- Button displays: "Highlight on Map"
- Button state: `aria-pressed="false"`

### 2. User Clicks Button
- Button triggers `highlightOrganization('org-001')`
- Zustand store updates state (Issue #22)
- All OpenAI landmarks are highlighted
- All other landmarks are dimmed

### 3. Button Updates
- Button text changes: "Clear Highlights"
- Button color changes to org color
- Button state: `aria-pressed="true"`
- Visual feedback shows highlighting is active

### 4. User Clicks Button Again
- Button triggers `clearHighlights()`
- All markers return to normal state
- Button text reverts: "Highlight on Map"
- Button state: `aria-pressed="false"`

---

## Styling Variations

### Button States

| State | Background | Border | Text | Icon |
|---|---|---|---|---|
| Default | Secondary color | Transparent | Secondary text | None |
| Hover | Darker secondary | Transparent | Secondary text | None |
| Active | Organization color | Org color | White | Checkmark (optional) |
| Active Hover | Org color (0.9 opacity) | Org color | White | Checkmark |
| Disabled | Gray | Gray | Gray text | None |

### Visual Feedback Example

```
Before: [Highlight on Map] ← button visible
After:  [✓ Clear Highlights] ← color changes, text updates
```

---

## Component Placement

### InfoPanel Organization View

```
┌─────────────────────────────────┐
│ OpenAI                          │
│ ────────────────────────────────│
│ AI research lab focused on      │
│ large language models and safe  │
│ AI development.                 │
│                                 │
│ Website: https://openai.com     │
│ Contributions: 5 papers/models  │
│                                 │
│ [Highlight on Map] ← Button     │
│                                 │
│ Related Papers:                 │
│ • GPT-2                         │
│ • GPT-3                         │
│ • InstructGPT                   │
└─────────────────────────────────┘
```

---

## Animation and Transitions

- Button color transition: 200ms ease-out
- Shadow animation on active state: 300ms
- No jarring changes - smooth user feedback

---

## Accessibility Requirements

- Button is keyboard accessible (Tab navigation)
- `aria-pressed` attribute indicates toggle state
- Descriptive aria-label explains action
- Focus state visible with outline
- Color not sole indicator - uses text and state change
- Screen reader announces: "Highlight all OpenAI contributions on the map, button pressed" when active

---

## Testing Requirements

### Unit Tests

- Test button renders with correct initial state
- Test button click triggers `highlightOrganization()` action
- Test button click toggles to active state
- Test button click on active state triggers `clearHighlights()` action
- Test button text updates based on highlight state
- Test aria-pressed attribute updates correctly
- Test aria-label is descriptive and changes appropriately

### E2E Tests

- Navigate to organization in InfoPanel
- Click "Highlight on Map" button
- Verify button state changes
- Verify map highlights corresponding landmarks
- Verify button text changes to "Clear Highlights"
- Click button again
- Verify button state reverts
- Verify map highlighting clears

### Visual Regression Tests

- Button appearance in default state
- Button appearance in active/highlighted state
- Button appearance on hover
- Button appearance on focus (keyboard)

---

## Dependencies

- Depends on: Issue #22 (highlighting logic in store)
- Depends on: Issue #19 (organizations data)
- Works with: Issue #14 (InfoPanel component)

---

## Integration Notes

- Button appears only when organization is displayed in InfoPanel
- Button state must stay in sync with Zustand store's `highlightedOrgId`
- Requires organization color from organizations.json (#19)
- InfoPanel must check if entity type is 'organization' to show button
- Works seamlessly with Issue #22's visual highlighting

---

## Browser Compatibility

- All modern browsers
- IE11: Not required (fade gracefully if highlighting not supported)

---

## Performance Notes

- Button click immediately updates Zustand store (< 50ms)
- Map updates triggered by store change (< 100ms)
- No unnecessary re-renders (memoization in place)

---

## Notes

- Button should be visually prominent to encourage discovery
- Highlight action should be immediate (no loading state)
- Consider adding a tooltip on first visit: "Highlight this organization's contributions"
- Button styling should match overall design system
- Consider adding badge count: "Highlight on Map (5 contributions)"
