# Issue #22: Organization Highlighting Logic

**Sprint:** Sprint 4 (Week 7-8)

**Story Points:** 4

**Priority:** P1

**Labels:** highlighting, interaction

**Dependencies:** #19

**Reference:** [prd.md Section 6.10](../prd.md)

---

## Title

Implement contextual highlighting by organization

---

## Description

Highlight all papers and models from a specific organization on the map with visual feedback. Users can quickly see all contributions from an organization through dimming of non-highlighted items and visual emphasis on selected ones.

---

## Acceptance Criteria

- [ ] Zustand store action: `highlightOrganization(orgId)` implemented
- [ ] Zustand store action: `clearHighlights()` implemented
- [ ] Map dims non-highlighted markers (opacity 0.3)
- [ ] Highlighted markers display pulsate animation (scale effect)
- [ ] Highlighted markers have colored outline (organization color)
- [ ] Count of highlighted items displayed in UI
- [ ] Highlighting persists until cleared
- [ ] Unit test verifies store state updates
- [ ] E2E test verifies visual highlighting on map

---

## Technical Details

### Zustand Store Actions

```typescript
// src/store/mapStore.ts
type MapStore = {
  // ... existing state

  highlightedOrgId: string | null;
  highlightedLandmarkIds: string[];

  highlightOrganization: (orgId: string) => void;
  clearHighlights: () => void;
};

// Implementation
const highlightOrganization = (orgId: string) => {
  const org = state.data?.organizations.find(o => o.id === orgId);
  set({
    highlightedOrgId: orgId,
    highlightedLandmarkIds: org?.landmarkIds || []
  });
};

const clearHighlights = () => {
  set({
    highlightedOrgId: null,
    highlightedLandmarkIds: []
  });
};
```

### Visual Styling

#### Non-Highlighted Markers

```css
/* Dimmed state for non-highlighted markers */
.landmark-marker-dimmed {
  opacity: 0.3;
  filter: grayscale(80%);
}
```

#### Highlighted Markers

```css
/* Highlighted marker with animation */
.landmark-marker-highlighted {
  opacity: 1;
  animation: pulse 2s infinite;
  outline: 3px solid var(--org-color);
  outline-offset: 2px;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
```

### Organization Color Usage

Each organization from organizations.json (#19) has a `color` field (hex code) used for:
- Highlight outline color
- InfoPanel accent color
- Legend item color

Example:
```json
{
  "id": "org-001",
  "name": "OpenAI",
  "color": "#10A37F"
}
```

---

## Component Integration

### LandmarkMarker Component

LandmarkMarker should check if it's highlighted and apply styles:

```typescript
export function LandmarkMarker({ landmark }: Props) {
  const { highlightedLandmarkIds, highlightedOrgId } = useMapStore();
  const isHighlighted = highlightedLandmarkIds.includes(landmark.id);
  const isDimmed = highlightedOrgId && !isHighlighted;

  return (
    <Marker
      position={[landmark.coordinates[0], landmark.coordinates[1]]}
      className={cn(
        isHighlighted && 'landmark-marker-highlighted',
        isDimmed && 'landmark-marker-dimmed'
      )}
      style={{
        outlineColor: isHighlighted && highlightedOrgId
          ? getOrgColor(highlightedOrgId)
          : undefined
      }}
    >
      {/* marker content */}
    </Marker>
  );
}
```

### Count Display

Display count in UI when highlighting is active:

```typescript
const highlightedCount = useMapStore(state => state.highlightedLandmarkIds.length);
const highlightedOrgName = useMapStore(state => {
  const orgId = state.highlightedOrgId;
  return orgId
    ? state.data?.organizations.find(o => o.id === orgId)?.name
    : null;
});

// In UI
{highlightedOrgName && (
  <div className="highlight-badge">
    Highlighting {highlightedOrgName}: {highlightedCount} contributions
  </div>
)}
```

---

## Animation Specifications

### Pulse Animation

- Duration: 2 seconds
- Scale: 1x → 1.2x → 1x
- Easing: ease-in-out
- Infinite repetition

### Transitions

- Dimming transition: 300ms ease-out
- Outline appearance: 200ms ease-in
- No jarring changes - smooth visual feedback

---

## Performance Considerations

- Use CSS animations (not JavaScript) for pulse effect
- Memoize organization lookup to avoid re-renders
- Debounce rapid highlight/clear toggling (100ms)
- Use transform and opacity for smooth 60fps animations

---

## Accessibility Requirements

- Screen reader announces highlight state: "Highlighting OpenAI: 5 contributions"
- Keyboard accessible (Tab through landmarks to see highlight state)
- Color not sole indicator - use outline and animation for contrast
- Dimmed state still readable (opacity 0.3 maintains text legibility)

---

## Testing Requirements

### Unit Tests

- Test `highlightOrganization(orgId)` updates store correctly
- Test `clearHighlights()` resets state
- Test correct landmarks are identified for organization
- Test highlighted and dimmed state logic
- Test edge cases (org with no landmarks, non-existent org)

### E2E Tests

- Click on organization in InfoPanel
- Verify markers dim/highlight correctly
- Verify highlight badge displays correct count
- Verify pulsate animation plays
- Verify colored outline appears
- Test rapid highlight/clear toggling
- Verify keyboard navigation while highlighting active

---

## State Management

### Before Highlighting
```javascript
{
  highlightedOrgId: null,
  highlightedLandmarkIds: []
}
```

### After highlightOrganization('org-001')
```javascript
{
  highlightedOrgId: 'org-001',
  highlightedLandmarkIds: ['lm-001', 'lm-002', 'lm-005']
}
```

### After clearHighlights()
```javascript
{
  highlightedOrgId: null,
  highlightedLandmarkIds: []
}
```

---

## Dependencies

- Depends on: Issue #19 (Organizations seed data)
- Required for: Issue #23 (Highlight button in InfoPanel)
- Works with: Issue #22 provides foundation for #22 highlighting

---

## Integration Notes

- Organizations data loaded by Issue #20 (useDataLoader hook)
- Organization color from organizations.json (#19)
- Landmark markers conditionally styled based on highlight state
- InfoPanel integrates with this feature in Issue #23

---

## Browser Compatibility

- CSS animations: All modern browsers
- Outline styling: All modern browsers
- Transform property: All modern browsers
- Grayscale filter: All modern browsers

---

## Notes

- Highlighting is one organization at a time (not multiple simultaneous)
- Highlighting persists until user explicitly clears it or selects different org
- Consider adding keyboard shortcut to clear highlights (Esc key)
- Outline color should have sufficient contrast with map background
- Animation shouldn't be distracting - 2 second pulse is slow enough to not be jarring
