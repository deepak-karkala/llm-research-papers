# Issue #24: URL State Encoding/Decoding

**Sprint:** Sprint 4 (Week 7-8)

**Story Points:** 5

**Priority:** P2

**Labels:** sharing, state

**Dependencies:** #7, #14

**Reference:** [prd.md Section 6.11](../prd.md)

---

## Title

Implement URL state encoding for snapshot sharing

---

## Description

Encode current map view state in URL for shareable links. Users can share the exact map view (position, zoom, selected entity, organization highlights) with others via URL, allowing instant restoration of that view when the link is opened.

---

## Acceptance Criteria

- [ ] `src/lib/urlState.ts` created with serialize/deserialize functions
- [ ] Function: `serializeState(state): URLSearchParams` implemented
- [ ] Function: `parseState(search): Partial<State>` implemented
- [ ] URL params: lat, lng, zoom, selectedEntity, selectedEntityType, highlightedOrg
- [ ] On app load, parse URL and restore state
- [ ] URL updates on map interactions (debounced 500ms)
- [ ] Backward compatible: ignore unknown params
- [ ] Unit test verifies serialization/deserialization round-trip
- [ ] E2E test verifies shared link restores exact state

---

## Technical Details

### URL Format

```
https://terrain.example.com?lat=50&lng=100&zoom=3&entity=lm-001&entityType=landmark&org=org-001
```

### URL Parameters

| Parameter | Type | Value | Example | Required |
|---|---|---|---|---|
| `lat` | number | Center latitude | 50 | No |
| `lng` | number | Center longitude | 100 | No |
| `zoom` | number | Map zoom level | 3 | No |
| `entity` | string | Entity ID | lm-001 | No |
| `entityType` | string | Entity type | landmark \| capability \| organization | No |
| `org` | string | Organization ID to highlight | org-001 | No |

### URL Serialization Function

```typescript
// src/lib/urlState.ts
import { MapState } from '@/store/mapStore';

export function serializeState(state: MapState): URLSearchParams {
  const params = new URLSearchParams();

  // Map position and zoom
  if (state.mapCenter) {
    params.set('lat', state.mapCenter[0].toString());
    params.set('lng', state.mapCenter[1].toString());
  }

  if (state.mapZoom !== undefined) {
    params.set('zoom', state.mapZoom.toString());
  }

  // Selected entity
  if (state.selectedEntity) {
    params.set('entity', state.selectedEntity.id);
    params.set('entityType', state.selectedEntity.type);
  }

  // Organization highlighting
  if (state.highlightedOrgId) {
    params.set('org', state.highlightedOrgId);
  }

  return params;
}
```

### URL Deserialization Function

```typescript
export function parseState(search: string): Partial<MapState> {
  const params = new URLSearchParams(search);
  const state: Partial<MapState> = {};

  // Parse map position
  const lat = params.get('lat');
  const lng = params.get('lng');
  if (lat && lng) {
    state.mapCenter = [parseFloat(lat), parseFloat(lng)];
  }

  // Parse zoom
  const zoom = params.get('zoom');
  if (zoom) {
    state.mapZoom = parseInt(zoom, 10);
  }

  // Parse selected entity
  const entity = params.get('entity');
  const entityType = params.get('entityType');
  if (entity && entityType) {
    state.selectedEntity = {
      id: entity,
      type: entityType as EntityType
    };
  }

  // Parse organization highlight
  const org = params.get('org');
  if (org) {
    state.highlightedOrgId = org;
  }

  return state;
}
```

---

## Integration in App

### On App Load

```typescript
// src/app/page.tsx or layout.tsx
import { parseState } from '@/lib/urlState';

export default function Page({ searchParams }: PageProps) {
  const store = useMapStore();

  useEffect(() => {
    // Parse URL params and restore state
    const restoredState = parseState(searchParams.toString());

    if (restoredState.mapCenter) {
      store.setMapCenter(restoredState.mapCenter);
    }
    if (restoredState.mapZoom) {
      store.setMapZoom(restoredState.mapZoom);
    }
    if (restoredState.selectedEntity) {
      store.selectEntity(restoredState.selectedEntity.id, restoredState.selectedEntity.type);
    }
    if (restoredState.highlightedOrgId) {
      store.highlightOrganization(restoredState.highlightedOrgId);
    }
  }, [searchParams]);

  return <MapApp />;
}
```

### URL Updates on Map Changes

```typescript
// In MapContainer or main app component
import { useRouter } from 'next/navigation';
import { serializeState } from '@/lib/urlState';

export function MapApp() {
  const router = useRouter();
  const state = useMapStore();
  const [isReady, setIsReady] = useState(false);

  // Debounced URL update
  useEffect(() => {
    // Skip initial render to avoid double-encoding
    if (!isReady) {
      setIsReady(true);
      return;
    }

    const timer = setTimeout(() => {
      const params = serializeState(state);
      const newUrl = `?${params.toString()}`;
      router.replace(newUrl, { shallow: true });
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [state.mapCenter, state.mapZoom, state.selectedEntity, state.highlightedOrgId]);
}
```

---

## State Properties to Encode

### Core Map State

```typescript
type MapState = {
  // Map viewport
  mapCenter: [number, number];      // [lat, lng]
  mapZoom: number;

  // Selection
  selectedEntity?: {
    id: string;
    type: 'landmark' | 'capability' | 'organization';
  };

  // Organization highlighting
  highlightedOrgId?: string;

  // ... other non-URL-relevant state
};
```

---

## URL Examples

### Example 1: Viewing a Landmark

```
?lat=45&lng=120&zoom=4&entity=lm-001&entityType=landmark
```

Restores:
- Map centered at [45, 120]
- Zoom level 4
- Landmark with ID "lm-001" selected (InfoPanel open)

### Example 2: Highlighting an Organization

```
?lat=50&lng=100&zoom=2&org=org-001
```

Restores:
- Map centered at [50, 100]
- Zoom level 2
- Organization highlighting active for "org-001"

### Example 3: Combined View

```
?lat=55&lng=110&zoom=3&entity=lm-005&entityType=landmark&org=org-002
```

Restores:
- Map position and zoom
- Landmark selected and visible in InfoPanel
- Organization highlighting on map

---

## Encoding Considerations

### Precision

- Latitude/Longitude: 2 decimal places is sufficient
- Zoom: Integer value
- No need for high-precision coordinates for MVP

### URL Length

- Maximum reasonable URL length: 2000 characters
- Current parameters are minimal: typically < 100 characters
- Ample room for future expansion

### Special Characters

- Use `URLSearchParams` which handles encoding automatically
- No need to manually escape special characters

---

## Backward Compatibility

### Unknown Parameters

```typescript
// Gracefully ignore unknown parameters
export function parseState(search: string): Partial<MapState> {
  const params = new URLSearchParams(search);
  const state: Partial<MapState> = {};

  // Only parse known parameters
  // Unknown parameters are ignored

  return state;
}
```

### Future-Proofing

- When adding new state to URL, add new parameter
- Old URLs without new parameter still work (use defaults)
- Never remove existing parameters

---

## Testing Requirements

### Unit Tests

- Test `serializeState()` encodes all relevant state
- Test `parseState()` decodes all parameters correctly
- Test round-trip: serialize → parse → compare
- Test with missing parameters (partial state)
- Test with invalid parameter values
- Test with unknown parameters (graceful ignore)
- Test special characters in entity IDs
- Test edge cases (empty object, null values)

### Integration Tests

- Test URL updates when map panned
- Test URL updates when zoom changed
- Test URL updates when entity selected
- Test URL updates when organization highlighted
- Test debouncing works (rapid changes don't spam URLs)
- Test URL parsing on app load
- Test state restoration from URL

### E2E Tests

- Share URL to another browser
- Open URL in new tab
- Verify exact state is restored
- Verify map position restored
- Verify selected entity visible in InfoPanel
- Verify organization highlighting active
- Verify zoom level restored

---

## Performance Considerations

### Debouncing

- Debounce URL updates by 500ms to reduce URL re-writes
- Prevents excessive history bloat
- User won't see flickering URLs in address bar

### History API

```typescript
// Use replaceState instead of pushState
// This updates current URL without adding history entry
router.replace(newUrl, { shallow: true });
```

---

## Browser Support

- URLSearchParams: All modern browsers (IE 11+)
- Next.js router: All supported versions
- URL API: All modern browsers

---

## Security Considerations

- No sensitive data in URL (public, shareable)
- Entity IDs are public references
- Organization IDs are public references
- No authentication tokens in URL

---

## Accessibility Notes

- Screen reader reads URL when it updates
- Announce state change to user (optional toast)
- URL updates don't interrupt user interaction

---

## Testing Checklist

### Manual Testing Steps

1. Open app at root URL
2. Pan map to new position
3. Check URL updates with new lat/lng
4. Zoom to different level
5. Check URL updates with new zoom
6. Click landmark
7. Check URL includes entity param
8. Check URL updates on highlight
9. Copy URL and open in new browser tab
10. Verify state identical to original

---

## Dependencies

- Depends on: Issue #7 (MapContainer), #14 (InfoPanel)
- Required for: Issue #25 (Copy Link button)
- Works with: Zustand store for state management

---

## Integration Notes

- Requires Zustand store with serializable state
- Uses Next.js router for URL management
- Must initialize on app load before rendering map
- Debounced updates for performance

---

## Notes

- URL should be human-readable (no compression)
- Map zoom stored as integer (simplicity)
- Entity type stored as string for clarity
- Future: Could add more complex state (routes, drawings, etc.)
- Consider adding URL shortener integration in future (bit.ly, etc.)
