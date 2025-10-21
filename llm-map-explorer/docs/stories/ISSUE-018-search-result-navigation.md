# Issue #18: Search Result Navigation

**Sprint:** Sprint 3 (Week 5-6)

**Story Points:** 3

**Priority:** P1

**Labels:** search, navigation

**Dependencies:** #17

**Reference:** [prd.md Section 6.7](../prd.md)

---

## Title

Implement navigation to search results on map

---

## Description

Pan and zoom map to selected search result entity, with smooth animation and automatic InfoPanel opening. Users can seamlessly navigate from search results to the map.

---

## Acceptance Criteria

- [ ] `src/lib/utils.ts` function: `focusEntity(id, type, mapRef)` implemented
- [ ] Function pans map to entity coordinates
- [ ] Function zooms to appropriate level for entity type
- [ ] Smooth animation using Leaflet.flyTo()
- [ ] Selected entity highlighted on map
- [ ] InfoPanel opens with entity details
- [ ] Zustand store action: `selectEntity(id, type)` implemented
- [ ] Unit test verifies map state updates
- [ ] E2E test verifies smooth navigation

---

## Technical Details

### focusEntity Function

```typescript
// src/lib/utils.ts
export function focusEntity(
  id: string,
  type: EntityType,
  mapRef: L.Map | null
): void {
  // 1. Get entity coordinates and zoom level
  // 2. Fly to position with smooth animation
  // 3. Update Zustand store with selected entity
  // 4. Trigger InfoPanel to open
}

// Entity type determines zoom level
const zoomLevelByType = {
  'capability': 2,
  'landmark': 4,
  'organization': 1
};
```

### Zustand Store Action

```typescript
// src/store/mapStore.ts
const selectEntity = (id: string, type: EntityType) => {
  set({
    selectedEntity: { id, type },
    infoPanelOpen: true
  });
};
```

### Smooth Animation

- Use Leaflet's `map.flyTo(latlng, zoom, options)` method
- Animation duration: 1000ms for viewport navigation
- Easing: default Leaflet easing (cubic)

### Entity Highlighting

- Applied entity receives visual highlight:
  - **Landmarks:** glow effect or colored outline
  - **Capabilities:** increased opacity/outline
  - **Organizations:** highlight all related landmarks with org color

---

## Coordinate Mapping

Each entity type has different coordinate handling:

- **Landmarks:** Use exact coordinates from landmarks.json
- **Capabilities:** Calculate centroid of polygon coordinates
- **Organizations:** Calculate center of all associated landmarks

---

## Zoom Levels by Entity Type

| Entity Type | Zoom Level | Purpose |
|---|---|---|
| Organization | 1 | Show full context of org's contributions |
| Capability | 2 | Show entire capability region |
| Landmark | 4 | Show landmark with nearby context |

---

## Performance Considerations

- Debounce rapid navigation requests (100ms)
- Memoize entity coordinate lookups
- Use map flyTo() to avoid multiple re-renders

---

## Accessibility Requirements

- Keyboard navigation support through SearchBar
- Focus management when navigating to entity
- Screen reader announces entity selection
- Esc key to deselect entity and close InfoPanel

---

## Testing Requirements

### Unit Tests

- Test focusEntity calculates correct zoom level for each entity type
- Test map state updates correctly
- Test Zustand store updates
- Test coordinate lookup for each entity type
- Test edge cases (missing coordinates, invalid entity)

### Performance Tests

- Navigation should complete in <1000ms with smooth animation
- Multiple rapid navigations should debounce correctly

### E2E Tests

- Search for entity, select result
- Map pans/zooms smoothly to entity
- InfoPanel opens automatically
- Entity is visually highlighted
- Can navigate to multiple entities in sequence

---

## Dependencies

- Depends on: Issue #17 (SearchBar component)
- Works with: Issue #14 (InfoPanel component)
- Uses data from: Issue #9 (capabilities), #12 (landmarks), #19 (organizations)

---

## Integration Notes

- SearchBar calls `selectEntity()` when result is selected
- SearchBar passes mapRef to SearchBar component for navigation
- focusEntity coordinates come from loaded JSON data
- Highlight state managed by Zustand store (shared with #22)

---

## Browser Compatibility

- Leaflet.flyTo() supported in all modern browsers
- Fallback: instant pan/zoom for older browsers (not recommended for MVP)

---

## Notes

- Smooth animation is critical for UX - verify flyTo() works on all target browsers
- Zoom level calculation should account for map bounds to avoid zooming past entity
- Consider caching entity coordinates during data load for performance
- Organization highlighting (Issue #22) builds on this foundation
