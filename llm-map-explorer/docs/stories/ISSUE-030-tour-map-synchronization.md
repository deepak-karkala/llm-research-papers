# Issue #30: Tour Map Synchronization - FlyTo & Highlighting

**Sprint:** Sprint 5 (Week 9-10)
**Story Points:** 4
**Priority:** P1
**Assignee:** Dev 2 (Mid-Level Full-Stack Developer)
**Status:** 🔄 Ready for Implementation

---

## 📖 User Story

**As a** tour user
**I want** the map to automatically pan and zoom to relevant locations as I navigate stages
**So that** I can visually understand the geographical context and relationships between landmarks

---

## 🎯 Goal

Synchronize map state with tour stage progression, causing the map to fly to stage-specific coordinates and highlight relevant landmarks as users advance through tour stages.

---

## 📋 Acceptance Criteria

### ✅ Map Flyto Animation
- [ ] On stage change, map flies to `stage.mapCenter` coordinates
- [ ] Map zooms to `stage.mapZoom` level
- [ ] Leaflet's `flyTo()` method used for smooth animation
- [ ] Animation duration: 1000ms (1 second)
- [ ] Animation easing is smooth (default Leaflet easing)
- [ ] User can interrupt animation by interacting with map
- [ ] Zoom level respects min/max bounds configured in MapContainer

### ✅ Landmark Highlighting
- [ ] Landmarks in `stage.landmarkIds` are highlighted
- [ ] Highlighted landmarks have distinct visual styling
- [ ] Highlight effect includes: glow, increased opacity, border
- [ ] Previous stage landmarks are dimmed (opacity 0.4)
- [ ] Future stage landmarks have subtle outline only
- [ ] Highlighting persists until next stage change
- [ ] Non-highlighted landmarks remain visible but less prominent

### ✅ Visual States
- [ ] **Current stage landmarks:** Bright glow effect, full opacity
- [ ] **Previous stage landmarks:** Dimmed (opacity 0.4), grey overlay
- [ ] **Future stage landmarks:** Outline only, no fill highlight
- [ ] **Non-tour landmarks:** Normal appearance (no change)
- [ ] Transitions between states are smooth (no sudden changes)

### ✅ State Management
- [ ] Zustand store action: `flyToStage(coordinates, zoom)`
- [ ] Store action: `highlightLandmarks(landmarkIds)`
- [ ] Store action: `clearHighlights()`
- [ ] Map state updates trigger appropriate visual changes
- [ ] Highlight state persists in store
- [ ] Exiting tour clears all highlighting

### ✅ Capability Polygons
- [ ] Capability polygons in stage region are highlighted
- [ ] Polygons in relevant regions have enhanced visibility
- [ ] Polygons outside stage region remain visible but dimmed
- [ ] Color/opacity changes don't obscure geographic context

### ✅ Progressive Disclosure Integration
- [ ] Progressive disclosure respects tour highlighting
- [ ] Tour highlights visible even when polygons are hidden by zoom
- [ ] Tour highlighting takes precedence over normal zoom-based display
- [ ] Switching between tours updates highlights correctly

### ✅ Touch/Mobile Interaction
- [ ] FlyTo works on touch devices
- [ ] Touch panning doesn't interrupt flyTo animation
- [ ] Highlighting visible on mobile/tablet viewports
- [ ] Touch gestures work after flyTo completes

### ✅ Performance
- [ ] Map updates don't cause visible lag
- [ ] Multiple stage transitions smooth (no stuttering)
- [ ] Rendering 200+ landmarks with highlighting <16ms (60fps)
- [ ] Memory usage stable across multiple stage changes
- [ ] No memory leaks from event listeners

### ✅ Testing
- [ ] Unit tests verify coordinate calculations
- [ ] Unit tests verify highlight state management
- [ ] E2E tests demonstrate map navigation with tours
- [ ] Performance tests verify 60fps during animation
- [ ] Accessibility tests verify visual contrast

---

## 🛠️ Technical Implementation

### Step 1: Create Tour Map Synchronization Hook

Create `src/hooks/useTourMapSync.ts`:

```typescript
import { useEffect, useRef } from 'react';
import { LatLngExpression } from 'leaflet';
import { useMapStore } from '@/lib/store';
import { Tour } from '@/types';

interface TourMapSyncOptions {
  duration?: number; // flyTo animation duration in ms
  padding?: [number, number]; // padding around target
}

const DEFAULT_OPTIONS: TourMapSyncOptions = {
  duration: 1000,
  padding: [50, 50],
};

export const useTourMapSync = (options = DEFAULT_OPTIONS) => {
  const mapRef = useRef(null);
  const { currentTour, currentStageIndex } = useMapStore();

  useEffect(() => {
    if (!currentTour || !mapRef.current) return;

    const stage = currentTour.stages[currentStageIndex];
    if (!stage) return;

    // Get map instance (implementation depends on your map setup)
    const map = mapRef.current;

    // Fly to stage coordinates
    if (stage.mapCenter && stage.mapZoom !== undefined) {
      const center: LatLngExpression = [stage.mapCenter[0], stage.mapCenter[1]];

      map.flyTo(center, stage.mapZoom, {
        duration: options.duration,
        easeLinearity: 0.25,
      });
    }

    // Update landmark highlighting
    updateLandmarkHighlighting(currentTour, currentStageIndex);
  }, [currentStageIndex, currentTour, options]);

  const updateLandmarkHighlighting = (tour: Tour, stageIndex: number) => {
    const { highlightLandmarks, clearHighlights } = useMapStore.getState();

    // Get landmarks for current, previous, and future stages
    const currentStage = tour.stages[stageIndex];
    const previousStage = stageIndex > 0 ? tour.stages[stageIndex - 1] : null;
    const futureStageIds = new Set<string>();

    for (let i = stageIndex + 1; i < tour.stages.length; i++) {
      tour.stages[i].landmarkIds?.forEach((id) => futureStageIds.add(id));
    }

    // Highlight current stage landmarks
    if (currentStage.landmarkIds) {
      highlightLandmarks({
        current: currentStage.landmarkIds,
        previous: previousStage?.landmarkIds || [],
        future: Array.from(futureStageIds),
      });
    }
  };

  return { mapRef };
};
```

---

### Step 2: Update Zustand Store

Add highlighting actions to `src/lib/store.ts`:

```typescript
interface HighlightConfig {
  current: string[];
  previous: string[];
  future: string[];
}

interface MapState {
  // ...existing state
  currentTour: Tour | null;
  currentStageIndex: number;
  tourHighlights: HighlightConfig;

  // Actions
  flyToStage: (center: LatLngExpression, zoom: number) => void;
  highlightLandmarks: (config: HighlightConfig) => void;
  clearHighlights: () => void;
}

const useMapStore = create<MapState>((set) => ({
  // ...existing state
  tourHighlights: {
    current: [],
    previous: [],
    future: [],
  },

  flyToStage: (center: LatLngExpression, zoom: number) => {
    // This action is called by useTourMapSync
    // Map instance receives this via custom event or ref callback
    const event = new CustomEvent('tourFlyTo', {
      detail: { center, zoom },
    });
    window.dispatchEvent(event);
  },

  highlightLandmarks: (config: HighlightConfig) => {
    set({ tourHighlights: config });
  },

  clearHighlights: () => {
    set({
      tourHighlights: {
        current: [],
        previous: [],
        future: [],
      },
    });
  },
}));
```

---

### Step 3: Update LandmarkMarker Component

Modify `src/components/map/LandmarkMarker.tsx` to apply highlighting:

```typescript
'use client';

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import { useMapStore } from '@/lib/store';
import { Landmark } from '@/types';
import L from 'leaflet';

interface LandmarkMarkerProps {
  landmark: Landmark;
  onClick?: (landmark: Landmark) => void;
}

export const LandmarkMarker: React.FC<LandmarkMarkerProps> = ({
  landmark,
  onClick,
}) => {
  const { tourHighlights } = useMapStore();
  const isCurrentStage = tourHighlights.current.includes(landmark.id);
  const isPreviousStage = tourHighlights.previous.includes(landmark.id);
  const isFutureStage = tourHighlights.future.includes(landmark.id);

  // Determine marker style based on highlight state
  const markerStyle = useMemo(() => {
    if (isCurrentStage) {
      // Bright glow effect
      return {
        opacity: 1,
        className: 'landmark-marker landmark-marker--current',
        filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
      };
    } else if (isPreviousStage) {
      // Dimmed appearance
      return {
        opacity: 0.4,
        className: 'landmark-marker landmark-marker--previous',
      };
    } else if (isFutureStage) {
      // Subtle outline only
      return {
        opacity: 0.6,
        className: 'landmark-marker landmark-marker--future',
      };
    } else {
      // Normal appearance
      return {
        opacity: 1,
        className: 'landmark-marker',
      };
    }
  }, [isCurrentStage, isPreviousStage, isFutureStage]);

  // Get custom icon based on landmark type
  const getMarkerIcon = () => {
    const iconUrl = getLandmarkIcon(landmark.type);
    const scale = isCurrentStage ? 1.3 : 1;

    return L.icon({
      iconUrl,
      iconSize: [32 * scale, 32 * scale],
      popupAnchor: [0, -16 * scale],
      className: markerStyle.className,
    });
  };

  const handleMarkerClick = () => {
    onClick?.(landmark);
  };

  return (
    <Marker
      position={[landmark.coordinates[0], landmark.coordinates[1]]}
      icon={getMarkerIcon()}
      eventHandlers={{
        click: handleMarkerClick,
      }}
      opacity={markerStyle.opacity}
      title={landmark.name}
    >
      <Popup>{landmark.name}</Popup>
    </Marker>
  );
};

const getLandmarkIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    paper: '/icons/landmark-paper.svg',
    model: '/icons/landmark-model.svg',
    benchmark: '/icons/landmark-benchmark.svg',
    tool: '/icons/landmark-tool.svg',
  };
  return iconMap[type] || '/icons/landmark-default.svg';
};
```

---

### Step 4: Update CapabilityPolygon Component

Modify `src/components/map/CapabilityPolygon.tsx` for tour highlighting:

```typescript
'use client';

import React, { useMemo } from 'react';
import { Polygon } from 'react-leaflet';
import { useMapStore } from '@/lib/store';
import { Capability } from '@/types';

interface CapabilityPolygonProps {
  capability: Capability;
  onClick?: (capability: Capability) => void;
}

export const CapabilityPolygon: React.FC<CapabilityPolygonProps> = ({
  capability,
  onClick,
}) => {
  const { tourHighlights } = useMapStore();
  const hasCurrentLandmarks = capability.landmarkIds?.some((id) =>
    tourHighlights.current.includes(id)
  );

  // Determine polygon style based on tour context
  const polygonStyle = useMemo(() => {
    if (hasCurrentLandmarks) {
      // Enhanced visibility for current stage
      return {
        fillColor: capability.visualStyle?.fillColor || '#3b82f6',
        fillOpacity: 0.6,
        strokeColor: '#1e40af',
        strokeOpacity: 1,
        strokeWidth: 3,
        weight: 3,
      };
    } else if (
      capability.landmarkIds?.some((id) => tourHighlights.previous.includes(id))
    ) {
      // Dimmed for previous stage
      return {
        fillColor: capability.visualStyle?.fillColor || '#3b82f6',
        fillOpacity: 0.15,
        strokeColor: '#9ca3af',
        strokeOpacity: 0.5,
        strokeWidth: 1,
        weight: 1,
      };
    } else {
      // Normal appearance
      return {
        fillColor: capability.visualStyle?.fillColor || '#3b82f6',
        fillOpacity: 0.4,
        strokeColor: capability.visualStyle?.strokeColor || '#1e40af',
        strokeOpacity: 0.8,
        strokeWidth: 2,
        weight: 2,
      };
    }
  }, [capability, hasCurrentLandmarks, tourHighlights]);

  const handlePolygonClick = () => {
    onClick?.(capability);
  };

  return (
    <Polygon
      positions={capability.polygonCoordinates}
      pathOptions={polygonStyle}
      eventHandlers={{
        click: handlePolygonClick,
      }}
      title={capability.name}
    />
  );
};
```

---

### Step 5: Integrate with MapContainer

Update `src/components/map/MapContainer.tsx`:

```typescript
'use client';

import React, { useRef, useEffect } from 'react';
import { MapContainer as LeafletMapContainer, TileLayer } from 'react-leaflet';
import { useMapStore } from '@/lib/store';
import { useTourMapSync } from '@/hooks/useTourMapSync';

export const MapContainer: React.FC = () => {
  const mapRef = useRef(null);
  const { currentTour } = useMapStore();

  // Sync map with tour progression
  useTourMapSync({ duration: 1000 });

  // Handle custom tour flyTo events
  useEffect(() => {
    const handleTourFlyTo = (e: Event) => {
      const { detail } = e as CustomEvent;
      if (mapRef.current) {
        mapRef.current.flyTo(detail.center, detail.zoom, {
          duration: 1000,
        });
      }
    };

    window.addEventListener('tourFlyTo', handleTourFlyTo);
    return () => window.removeEventListener('tourFlyTo', handleTourFlyTo);
  }, []);

  return (
    <LeafletMapContainer
      ref={mapRef}
      center={[51.505, -0.09]}
      zoom={2}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Map content */}
    </LeafletMapContainer>
  );
};
```

---

### Step 6: Add CSS for Highlighting Effects

Create `src/styles/tour-highlighting.css`:

```css
/* Current stage landmark - bright glow */
.landmark-marker--current {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.8));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(59, 130, 246, 1));
  }
}

/* Future stage landmark - outline only */
.landmark-marker--future {
  filter: drop-shadow(0 0 2px rgba(100, 116, 139, 0.6));
}

/* Smooth transitions */
.landmark-marker {
  transition: opacity 300ms ease-out, filter 300ms ease-out;
}
```

---

### Step 7: Create Unit Tests

Create `tests/unit/hooks/useTourMapSync.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMapStore } from '@/lib/store';
import { useTourMapSync } from '@/hooks/useTourMapSync';
import { mockTour } from '@/tests/fixtures/tours';

describe('useTourMapSync', () => {
  it('synchronizes map with tour stage progression', () => {
    const { result } = renderHook(() => useTourMapSync());

    act(() => {
      useMapStore.getState().startTour(mockTour);
      useMapStore.getState().advanceTourStage('next');
    });

    expect(useMapStore.getState().currentStageIndex).toBe(1);
  });

  it('updates landmark highlighting on stage change', () => {
    const { result } = renderHook(() => useTourMapSync());

    act(() => {
      useMapStore.getState().startTour(mockTour);
    });

    const { tourHighlights } = useMapStore.getState();
    expect(tourHighlights.current.length).toBeGreaterThan(0);
  });

  it('clears highlights when tour exits', () => {
    const { result } = renderHook(() => useTourMapSync());

    act(() => {
      useMapStore.getState().startTour(mockTour);
      useMapStore.getState().exitTour();
    });

    const { tourHighlights } = useMapStore.getState();
    expect(tourHighlights.current).toHaveLength(0);
    expect(tourHighlights.previous).toHaveLength(0);
    expect(tourHighlights.future).toHaveLength(0);
  });
});
```

---

### Step 8: Create E2E Tests

Create `tests/e2e/tour-map-sync.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Tour Map Synchronization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=Guided Tours');
    await page.click('text=GPT Evolution');
  });

  test('should fly map to stage coordinates', async ({ page }) => {
    // Get initial map center
    const initialCenter = await page.evaluate(() => {
      const mapElement = document.querySelector('[data-testid="map"]');
      return mapElement?.getAttribute('data-bounds');
    });

    // Advance to next stage
    await page.click('button:has-text("Next")');

    // Wait for animation
    await page.waitForTimeout(1200);

    // Get new map center
    const newCenter = await page.evaluate(() => {
      const mapElement = document.querySelector('[data-testid="map"]');
      return mapElement?.getAttribute('data-bounds');
    });

    expect(initialCenter).not.toEqual(newCenter);
  });

  test('should highlight current stage landmarks', async ({ page }) => {
    // Get current stage landmarks
    const currentLandmarks = await page.locator('.landmark-marker--current');
    const count = await currentLandmarks.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should dim previous stage landmarks', async ({ page }) => {
    // Advance to stage 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(300);

    // Check previous stage landmarks have reduced opacity
    const previousLandmarks = page.locator('.landmark-marker--previous');
    const opacity = await previousLandmarks.first().evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });

    expect(parseFloat(opacity)).toBeLessThan(0.5);
  });

  test('should update highlighting on navigation', async ({ page }) => {
    // Stage 1 - check current highlights
    let currentCount = await page.locator('.landmark-marker--current').count();
    expect(currentCount).toBeGreaterThan(0);

    // Navigate to stage 2
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(300);

    // Previous stage should now be dimmed, new landmarks highlighted
    const previousCount = await page.locator('.landmark-marker--previous').count();
    const newCurrentCount = await page.locator('.landmark-marker--current').count();

    expect(previousCount).toBeGreaterThan(0);
    expect(newCurrentCount).toBeGreaterThan(0);
  });

  test('should clear highlighting when tour exits', async ({ page }) => {
    // Exit tour
    await page.press('body', 'Escape');

    // No landmarks should have tour highlighting classes
    const highlightedLandmarks = await page.locator('[class*="landmark-marker--"]');
    expect(await highlightedLandmarks.count()).toBe(0);
  });
});
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] FlyTo coordinates calculated correctly
- [ ] Highlight state updates on stage change
- [ ] Highlights clear on tour exit
- [ ] Boundary conditions handled

### E2E Tests
- [ ] Map flies to stage coordinates smoothly
- [ ] Landmarks highlighted appropriately
- [ ] Highlighting updates on navigation
- [ ] Highlighting clears on tour exit
- [ ] Mobile/touch interaction works

### Visual Testing
- [ ] Current stage landmarks have glow effect
- [ ] Previous stage landmarks dimmed
- [ ] Future stage landmarks have outline
- [ ] No jarring visual changes
- [ ] Animations smooth at 60fps

### Performance Testing
- [ ] FlyTo animation smooth (no stuttering)
- [ ] Highlighting updates don't cause lag
- [ ] Memory stable across stage changes
- [ ] Handles 200+ landmarks without issue

---

## 📚 Reference Documentation

- **Architecture:** [architecture.md](../architecture.md) Section 6.3 (Tour Synchronization)
- **Leaflet Docs:** https://leafletjs.com/reference-1.7.1.html#map-method-flyto
- **Sprint Plan:** [sprint-planning.md](../sprint-planning.md) Sprint 5, Issue #30

---

## 🔗 Dependencies

**Depends On:**
- Issue #28 (TourPanel Component)
- Issue #29 (Tour Stage Navigation)
- Issue #13 (LandmarkMarker Component)
- Issue #10 (CapabilityPolygon Component)

**Blocks:**
- Issue #31 (Pause/Resume)

---

## ✅ Definition of Done

Before marking complete:

- [ ] ✅ Map flys to stage coordinates
- [ ] ✅ Landmarks highlighted appropriately
- [ ] ✅ Capability polygons respond to tour context
- [ ] ✅ Unit tests passing
- [ ] ✅ E2E tests demonstrate smooth synchronization
- [ ] ✅ Performance verified (60fps)
- [ ] ✅ No memory leaks
- [ ] ✅ Accessibility verified
- [ ] ✅ Code reviewed

---

**Ready to implement?** Start with the hook and store integration, then gradually add visual effects. Test performance early.

**Estimated Completion:** Days 3-4 of Sprint 5

---

**Issue Metadata:**
- **Sprint:** Sprint 5
- **Milestone:** Milestone 3 - Guided Tours
- **Labels:** `P1`, `tour`, `map`, `synchronization`, `sprint-5`
- **Story Points:** 4
