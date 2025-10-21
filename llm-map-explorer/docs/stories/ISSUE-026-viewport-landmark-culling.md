# Issue #26: Viewport-Based Landmark Culling

**Sprint:** Sprint 4 (Week 7-8)

**Story Points:** 5

**Priority:** P0

**Labels:** performance, optimization

**Dependencies:** #13

**Reference:** [architecture.md Section 2.5](../architecture.md), [prd.md Section 8](../prd.md)

---

## Title

Implement viewport-based landmark culling for performance

---

## Description

Only render landmarks within visible viewport plus 20% buffer to optimize performance. This critical optimization enables smooth rendering of 200+ landmarks without lag, ensuring 60fps performance even with large datasets.

---

## Acceptance Criteria

- [ ] `src/hooks/useLandmarkCulling.ts` custom hook created
- [ ] Hook calculates visible map bounds
- [ ] Hook returns landmarks within viewport + 20% buffer
- [ ] Culling updates on pan/zoom (debounced 100ms)
- [ ] Performance: handles 200+ landmarks without lag
- [ ] Unit test verifies culling logic
- [ ] Performance test: 200 landmarks render in <16ms (60fps)

---

## Technical Details

### Culling Hook Implementation

```typescript
// src/hooks/useLandmarkCulling.ts
import { useCallback, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import { useMapStore } from '@/store/mapStore';
import type { Landmark } from '@/types/data';

export function useLandmarkCulling() {
  const mapRef = useMap();
  const allLandmarks = useMapStore(state => state.data?.landmarks || []);
  const [visibleLandmarks, setVisibleLandmarks] = useState<Landmark[]>([]);

  // Calculate visible bounds with buffer
  const calculateVisibleBounds = useCallback(() => {
    if (!mapRef) return null;

    const bounds = mapRef.getBounds();
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    // Calculate 20% buffer
    const latRange = ne.lat - sw.lat;
    const lngRange = ne.lng - sw.lng;
    const latBuffer = latRange * 0.2;
    const lngBuffer = lngRange * 0.2;

    return {
      north: ne.lat + latBuffer,
      south: sw.lat - latBuffer,
      east: ne.lng + lngBuffer,
      west: sw.lng - lngBuffer
    };
  }, [mapRef]);

  // Check if landmark is within bounds
  const isLandmarkVisible = useCallback(
    (landmark: Landmark, bounds: BoundingBox): boolean => {
      const [lat, lng] = landmark.coordinates;
      return (
        lat >= bounds.south &&
        lat <= bounds.north &&
        lng >= bounds.west &&
        lng <= bounds.east
      );
    },
    []
  );

  // Filter landmarks with debouncing
  useEffect(() => {
    const handleMapChange = () => {
      const bounds = calculateVisibleBounds();
      if (!bounds) return;

      const visible = allLandmarks.filter(landmark =>
        isLandmarkVisible(landmark, bounds)
      );

      setVisibleLandmarks(visible);
    };

    const debouncedHandler = debounce(handleMapChange, 100);

    // Listen to map events
    mapRef?.on('moveend', debouncedHandler);
    mapRef?.on('zoomend', debouncedHandler);

    // Initial calculation
    handleMapChange();

    return () => {
      mapRef?.off('moveend', debouncedHandler);
      mapRef?.off('zoomend', debouncedHandler);
    };
  }, [mapRef, allLandmarks, calculateVisibleBounds, isLandmarkVisible]);

  return visibleLandmarks;
}
```

### Debounce Utility

```typescript
// src/lib/utils.ts
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

---

## Integration in MapContainer

```typescript
// src/components/map/MapContainer.tsx
import { useLandmarkCulling } from '@/hooks/useLandmarkCulling';

export function MapContainer() {
  const visibleLandmarks = useLandmarkCulling();
  const allLandmarks = useMapStore(state => state.data?.landmarks || []);

  return (
    <MapDiv>
      {/* Render only visible landmarks */}
      {visibleLandmarks.map(landmark => (
        <LandmarkMarker
          key={landmark.id}
          landmark={landmark}
        />
      ))}
    </MapDiv>
  );
}
```

---

## Buffer Strategy

### Why 20% Buffer?

The 20% buffer ensures:
- Landmarks just outside viewport don't flicker when panning
- Smooth animation without culling/revealing landmarks mid-motion
- Reduced re-renders during rapid panning
- Balance between performance and smoothness

### Visual Example

```
         Viewport + Buffer
         ┌────────────────────┐
         │  ┌──────────────┐   │
         │  │   Visible    │   │
         │  │   Viewport   │   │
         │  │              │   │
         │  └──────────────┘   │
         └────────────────────┘

         Culled landmarks stay outside buffer
         ✗ ✗ ✗ │─────────────│ ✗ ✗ ✗
```

---

## Performance Targets

### Rendering Performance

| Landmark Count | Target Frame Time | Target FPS |
|---|---|---|
| 50 | <3ms | 60 |
| 100 | <5ms | 60 |
| 150 | <10ms | 60 |
| 200+ | <16ms | 60 |

### Memory Impact

- No additional memory per landmark (same object references)
- Array filtering is O(n) but happens once per pan/zoom
- Debouncing prevents excessive calculations

---

## Coordinate System

### Pixel-Based Coordinates

```typescript
// Leaflet CRS.Simple uses pixel coordinates
type Coordinates = [number, number];  // [x, y] in pixels

// Convert to lat/lng equivalent
const toLngLat = (coords: Coordinates, imageSize: Size) => {
  return [
    (coords[0] / imageSize.width) * 180 - 90,
    (coords[1] / imageSize.height) * 180 - 90
  ];
};
```

### Boundary Calculation

Using Leaflet's `map.getBounds()`:

```typescript
const bounds = mapRef.getBounds();  // Returns LatLngBounds
const ne = bounds.getNorthEast();   // [lat, lng]
const sw = bounds.getSouthWest();   // [lat, lng]
```

---

## Debouncing Strategy

### Why Debounce?

- Map fires events multiple times during single pan gesture
- Prevents calculating visible landmarks on every event
- 100ms debounce balances responsiveness with performance

### Debounce Timeline

```
User pans map:
moveend fired → waiting
moveend fired → waiting
moveend fired → waiting (100ms elapsed)
              → Calculate and update landmarks
```

---

## Testing Requirements

### Unit Tests

- Test `useLandmarkCulling` returns visible landmarks
- Test culling with 0 visible landmarks
- Test culling with all landmarks visible
- Test buffer calculation is accurate
- Test boundary conditions (landmarks on edges)
- Test debouncing prevents excessive recalculations
- Test hook cleanup (event listeners removed)

### Performance Tests

- Benchmark with 50 landmarks
- Benchmark with 100 landmarks
- Benchmark with 150 landmarks
- Benchmark with 200+ landmarks
- Verify <16ms frame time at 60fps
- Verify no memory leaks during prolonged panning
- Measure reduce in DOM nodes from full to culled

### E2E Tests

- Pan around map with 200+ landmarks
- Verify landmarks appear/disappear at buffer boundaries
- Verify smooth performance during rapid panning
- Verify no visual flicker
- Test zoom in/out performance
- Test performance on slower devices (mobile simulation)

### Performance Regression Tests

- Add Lighthouse performance tests
- Monitor bundle size impact
- Track rendering time with profiler

---

## Optimization Techniques

### 1. Coordinate Caching

```typescript
// Pre-process landmarks for faster lookups
const landmarkCoords = useMemo(() => {
  return allLandmarks.reduce((map, landmark) => {
    map[landmark.id] = landmark.coordinates;
    return map;
  }, {});
}, [allLandmarks]);
```

### 2. Spatial Indexing (Future)

For 500+ landmarks, consider quad-tree or similar:

```typescript
// Future optimization: spatial index
const spatialIndex = useMemo(() => {
  return buildQuadTree(allLandmarks);
}, [allLandmarks]);
```

### 3. Memoization

```typescript
// Memoize visible landmarks array to prevent unnecessary re-renders
const memoizedVisibleLandmarks = useMemo(
  () => visibleLandmarks,
  [visibleLandmarks]
);
```

---

## Browser Events

### Map Event Listeners

```typescript
// Events that trigger recalculation
mapRef.on('moveend', handleMapChange);   // Panning finished
mapRef.on('zoomend', handleMapChange);   // Zoom finished
mapRef.on('dragend', handleMapChange);   // Drag finished

// Events NOT to listen to (fire too frequently)
// mapRef.on('move', handleMapChange);   // Too frequent
// mapRef.on('zoom', handleMapChange);   // Too frequent
```

---

## Edge Cases

### 1. Map Not Ready

```typescript
if (!mapRef) return [];  // Return empty if map not initialized
```

### 2. Landmarks with Invalid Coordinates

```typescript
const isValidCoordinate = (coords: Coordinates) => {
  return Array.isArray(coords) && coords.length === 2 &&
    typeof coords[0] === 'number' && typeof coords[1] === 'number';
};
```

### 3. Empty Landmarks Array

```typescript
if (allLandmarks.length === 0) {
  setVisibleLandmarks([]);
}
```

---

## Memory Management

### Cleanup

```typescript
useEffect(() => {
  // ... setup code

  return () => {
    // Remove event listeners to prevent memory leaks
    mapRef?.off('moveend', debouncedHandler);
    mapRef?.off('zoomend', debouncedHandler);
    // Clear timeout if debounce pending
    if (timeout) clearTimeout(timeout);
  };
}, []);
```

---

## Dependencies

- Depends on: Issue #13 (LandmarkMarker component)
- Works with: MapContainer (#7), Zustand store
- Improves: Map performance across all features

---

## Integration Notes

- Must be used in MapContainer for maximum benefit
- Visible landmarks passed to rendering logic
- Hook manages its own state internally
- No additional props needed from parent

---

## Monitoring

### Performance Metrics to Track

```typescript
// Measure culling performance
const start = performance.now();
const visible = filterLandmarks(bounds);
const elapsed = performance.now() - start;

console.log(`Culled ${allLandmarks.length - visible.length} landmarks in ${elapsed}ms`);
```

---

## Browser Support

- Map bounds API: All modern browsers
- Event listeners: All modern browsers
- Performance API: All modern browsers

---

## Future Enhancements

1. **Spatial Indexing:** Quad-tree for faster lookups with 500+ landmarks
2. **Adaptive Culling:** Adjust buffer size based on frame rate
3. **Progressive Rendering:** Load landmarks gradually
4. **Vector Tiles:** Use tile-based rendering for massive datasets

---

## Notes

- This is a P0 task - critical for performance
- 20% buffer chosen for balance between smoothness and efficiency
- Debouncing at 100ms prevents excessive recalculations
- Culling transparency: users won't notice landmarks disappearing
- Consider adding visual indicator during development (debug mode)
- Future: Could extend for other renderable items (capabilities, tours)
