# Issue #7: MapContainer Component with Leaflet CRS.Simple

**Sprint:** Sprint 1 (Week 1-2)
**Story Points:** 5
**Priority:** P0 (Critical Path)
**Assignee:** Dev 1 (Senior Full-Stack Developer)
**Status:** ✅ Complete
**Dependencies:** Issue #2 (Install Dependencies), Issue #6 (Base Map Image)
**References:** docs/sprint-planning.md Issue #7, docs/architecture.md Section 5.1, docs/front-end-spec.md Section 6.1

---

## 📖 User Story

**As a** user visiting the LLM Map Explorer,
**I want** to see an interactive fantasy map that I can pan and zoom,
**so that** I can begin exploring the LLM research landscape visually.

---

## 📋 Acceptance Criteria

- [ ] `src/components/map/MapContainer.tsx` created with Leaflet map initialization
- [ ] Leaflet map initialized with **CRS.Simple** coordinate system (pixel-based positioning)
- [ ] ImageOverlay displays the base map PNG at `/images/map-base.png`
- [ ] Map bounds calculated from image dimensions (4096×3072) and properly constrained
- [ ] Default zoom and center configured to show full map on initial load
- [ ] Map fills viewport responsively (100vh height, 100% width)
- [ ] Component uses **React-Leaflet** declarative API (not imperative Leaflet)
- [ ] Basic unit test verifies map initialization without errors

---

## 🔗 Context & Dependencies

- **Depends on Issue #2**: Leaflet (`leaflet@1.9+`) and React-Leaflet (`react-leaflet@4.x`) must be installed
- **Depends on Issue #6**: Base map image must exist at `/public/images/map-base.png` with documented coordinates
- This component serves as the foundation for all future map features: capability polygons (Issue #10), landmark markers (Issue #13), and pan/zoom controls (Issue #8)
- The component will be integrated into the main page layout in `src/app/page.tsx`

---

## 🧠 Previous Story Insights

- **Issue #2 Completion**: Leaflet and React-Leaflet dependencies are installed. TypeScript definitions (`@types/leaflet`) are available. shadcn/ui components are configured. *(Source: llm-map-explorer/docs/stories/ISSUE-002-install-dependencies.md)*
- **Issue #6 Completion**: Base map image exists at `/public/images/map-base.png` (4096×3072 resolution). Coordinate system documented with bounds `[[0, 0], [3072, 4096]]` and recommended zoom levels (minZoom: -1, maxZoom: 2, default: 0). *(Source: llm-map-explorer/docs/stories/ISSUE-006-base-map-image.md)*

---

## 🧩 Dev Notes

### Leaflet CRS.Simple Coordinate System

**Critical Concept**: CRS.Simple is a pixel-based coordinate system where:
- `[0, 0]` is the **top-left** corner of the image
- `[height, width]` is the **bottom-right** corner
- Coordinates are `[y, x]` (latitude, longitude) in Leaflet terms, but represent `[row, column]` pixels
- For our 4096×3072 image: bounds are `[[0, 0], [3072, 4096]]` (height first, then width)

**Why CRS.Simple?**
- Allows pixel-perfect positioning of landmarks and capability regions
- No geographic projection distortion (we're mapping conceptual space, not Earth)
- Simpler coordinate math for overlay positioning
*[Source: docs/architecture.md Section 5.1, docs/dev-quickstart.md Common Pitfalls]*

### Component Structure

**File Location**: `src/components/map/MapContainer.tsx`

**Key Imports**:
```typescript
import { MapContainer as LeafletMap, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Critical: import Leaflet CSS
```

**Component Architecture**:
- Use **React-Leaflet's declarative API** (not imperative `L.map()` calls)
- `MapContainer` component from react-leaflet wraps the Leaflet map
- `ImageOverlay` component renders the base map image
- All Leaflet controls and layers will be React components (not direct Leaflet API calls)
*[Source: docs/architecture.md Section 5.1, React-Leaflet documentation]*

### Map Configuration

**Bounds and Dimensions**:
```typescript
const MAP_WIDTH = 4096;
const MAP_HEIGHT = 3072;
const bounds = L.latLngBounds([[0, 0], [MAP_HEIGHT, MAP_WIDTH]]);
```

**Map Props**:
- `crs={L.CRS.Simple}` - **Required** for pixel-based coordinates
- `bounds={bounds}` - Initial bounds to fit
- `maxBounds={bounds}` - Prevents panning outside the map
- `minZoom={-1}` - Allows viewing entire map in viewport
- `maxZoom={2}` - Allows 3× magnification for landmark detail
- `zoom={-1}` - Default zoom shows full map
- `center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}` - Centers the map (remember: [y, x])
- `style={{ height: '100vh', width: '100%' }}` - Fills viewport
*[Source: docs/architecture.md Section 5.1, docs/dev-quickstart.md Pattern 3]*

### Next.js App Router Integration

**Client Component Directive**: MapContainer **must** be a client component (uses browser APIs)
```typescript
'use client'; // First line of MapContainer.tsx
```

**Page Integration** (`src/app/page.tsx`):
- Import MapContainer component
- Render as main page content
- Ensure proper layout (map should fill available space)
*[Source: docs/architecture.md Section 7.1, Next.js App Router documentation]*

### Styling Considerations

**Leaflet CSS**: Import is **critical** for proper map rendering
```typescript
import 'leaflet/dist/leaflet.css';
```

**Responsive Sizing**:
- Map container should fill viewport: `height: '100vh', width: '100%'`
- On mobile/tablet, adjust via media queries if needed (future story)
- Ensure no CSS conflicts with Tailwind reset
*[Source: docs/front-end-spec.md Section 10 - Responsiveness]*

### TypeScript Types

**Component Props** (for future extensibility):
```typescript
interface MapContainerProps {
  className?: string; // Optional Tailwind classes
}
```

**Leaflet Types**:
- Leaflet ships with TypeScript definitions via `@types/leaflet`
- React-Leaflet has built-in TypeScript support
- Use `L.LatLngBounds` for bounds typing
*[Source: docs/architecture.md Section 13 - TypeScript Configuration]*

### Testing Strategy

**Unit Test** (`tests/unit/components/map/MapContainer.test.tsx`):
- Verify component renders without errors
- Mock Leaflet map initialization
- Check that ImageOverlay is rendered with correct props
- Use Vitest + React Testing Library
*[Source: docs/architecture.md Section 12 - Testing Strategy]*

**Integration Test** (deferred to Issue #8):
- Actual browser testing with Playwright
- Verify pan/zoom interactions
- Visual regression testing

### Performance Considerations

**Image Loading**:
- Base map image (~2-3 MB) should load progressively
- Leaflet handles image rendering efficiently
- No additional optimization needed at this stage
*[Source: docs/front-end-spec.md Section 12 - Performance]*

**Rendering Performance**:
- React-Leaflet optimizes re-renders
- Map instance is created once and reused
- Future stories will add landmark culling for performance with 100+ markers

### Common Pitfalls (from Architecture)

1. **Coordinate Inversion**: Leaflet uses `[lat, lng]` which maps to `[y, x]` in pixel space. Always think `[row, column]` or `[height_offset, width_offset]`.
2. **Missing Leaflet CSS**: Map will render incorrectly without `import 'leaflet/dist/leaflet.css'`
3. **Incorrect Bounds**: Must be `[[0, 0], [height, width]]`, not `[[0, 0], [width, height]]`
4. **SSR Issues**: Next.js will error if map component runs server-side. Always use `'use client'` directive.
*[Source: docs/dev-quickstart.md Section Common Pitfalls]*

### Project Structure Alignment

**Directory Structure**:
```
src/
├── components/
│   └── map/
│       └── MapContainer.tsx  <-- Create this
├── app/
│   └── page.tsx              <-- Integrate MapContainer here
```

**Component Organization**: Map-related components go in `src/components/map/` directory
*[Source: docs/architecture.md Section 7.1, Section 8 - Unified Project Structure]*

### Future Extension Points

This component will be extended in upcoming stories:
- **Issue #8**: Add pan/zoom controls and interactions
- **Issue #10**: Render CapabilityPolygon components as children
- **Issue #13**: Render LandmarkMarker components as children
- **Issue #26**: Add viewport-based landmark culling

Design the component to accept children for easy extension:
```typescript
export function MapContainer({ children }: { children?: React.ReactNode }) {
  return (
    <LeafletMap {...props}>
      <ImageOverlay url="/images/map-base.png" bounds={bounds} />
      {children} {/* Future: polygons, markers */}
    </LeafletMap>
  );
}
```

---

## ✅ Tasks / Subtasks

- [ ] **Task 1: Create MapContainer component file** (AC 1)
  - [ ] Create `src/components/map/MapContainer.tsx`
  - [ ] Add `'use client'` directive at top of file
  - [ ] Import Leaflet, React-Leaflet, and Leaflet CSS
  - [ ] Define MAP_WIDTH, MAP_HEIGHT constants (4096, 3072)
  - [ ] Calculate bounds using `L.latLngBounds()`

- [ ] **Task 2: Implement map initialization with CRS.Simple** (AC 2, 3, 4, 5)
  - [ ] Create LeafletMap component with `crs={L.CRS.Simple}` *[Source: docs/architecture.md Section 5.1]*
  - [ ] Configure bounds, maxBounds, zoom levels (minZoom: -1, maxZoom: 2, default: 0) *[Source: docs/stories/ISSUE-006-base-map-image.md]*
  - [ ] Set center to `[MAP_HEIGHT / 2, MAP_WIDTH / 2]`
  - [ ] Add ImageOverlay component with `url="/images/map-base.png"` and `bounds={bounds}`
  - [ ] Apply inline styles for viewport filling: `style={{ height: '100vh', width: '100%' }}`

- [ ] **Task 3: Make component responsive and extensible** (AC 6, 7)
  - [ ] Use React-Leaflet declarative API (MapContainer, ImageOverlay components)
  - [ ] Add optional `children` prop for future polygon/marker layers
  - [ ] Add optional `className` prop for Tailwind customization
  - [ ] Ensure TypeScript types are properly defined

- [ ] **Task 4: Integrate into main page** (AC 6)
  - [ ] Update `src/app/page.tsx` to import and render MapContainer
  - [ ] Remove any placeholder content
  - [ ] Ensure proper layout (map fills available viewport)
  - [ ] Test in browser: `npm run dev` and verify map renders

- [ ] **Task 5: Write unit test** (AC 8)
  - [ ] Create `tests/unit/components/map/MapContainer.test.tsx`
  - [ ] Test: Component renders without throwing errors
  - [ ] Test: ImageOverlay receives correct url and bounds props
  - [ ] Mock Leaflet map instance to avoid browser dependencies
  - [ ] Run tests: `npm run test` and ensure passing

- [ ] **Task 6: Verify integration and visual appearance**
  - [ ] Start dev server: `npm run dev`
  - [ ] Open browser to `http://localhost:3000`
  - [ ] Verify base map image displays correctly
  - [ ] Verify map fills viewport (no scrollbars, no white space)
  - [ ] Check browser console for any Leaflet errors
  - [ ] Verify zoom levels work (mouse wheel or zoom controls)

---

## 🧪 Testing Guidance

**Unit Testing** (`tests/unit/components/map/MapContainer.test.tsx`):
```typescript
import { render } from '@testing-library/react';
import { MapContainer } from '@/components/map/MapContainer';

// Mock Leaflet to avoid browser dependencies
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }: any) => <div data-testid="map-container">{children}</div>,
  ImageOverlay: ({ url, bounds }: any) => <div data-testid="image-overlay" data-url={url} />,
}));

describe('MapContainer', () => {
  it('renders without crashing', () => {
    const { getByTestId } = render(<MapContainer />);
    expect(getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders ImageOverlay with correct props', () => {
    const { getByTestId } = render(<MapContainer />);
    const overlay = getByTestId('image-overlay');
    expect(overlay).toHaveAttribute('data-url', '/images/map-base.png');
  });
});
```

**Manual Testing Checklist**:
- [ ] Map renders in browser without console errors
- [ ] Base map image is visible and correctly sized
- [ ] Map does not extend beyond image boundaries (maxBounds working)
- [ ] Default zoom shows full map
- [ ] Mouse wheel zoom works (zoom in/out)
- [ ] Map pans with mouse drag (basic Leaflet controls)
- [ ] No layout shift or scroll issues

**Browser Testing**:
- Test in Chrome (primary)
- Test in Firefox (ensure Leaflet compatibility)
- Test in Safari (macOS if available)

---

## 🧭 Project Structure Notes

**Component Hierarchy** (after this story):
```
src/app/page.tsx
  └── MapContainer.tsx (map fills viewport)
        └── ImageOverlay (base map image)
```

**Future Component Tree** (upcoming stories):
```
src/app/page.tsx
  └── MapContainer.tsx
        ├── ImageOverlay (base map)
        ├── CapabilityPolygon[] (Issue #10)
        ├── LandmarkMarker[] (Issue #13)
        └── MapEffectController (Issue #8)
```

*[Source: docs/architecture.md Section 6.1 - Component Tree]*

---

## 📚 Reference Implementation

**Complete Component Example** (from dev-quickstart.md):

```typescript
// src/components/map/MapContainer.tsx
'use client';

import { MapContainer as LeafletMap, ImageOverlay } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MAP_WIDTH = 4096;
const MAP_HEIGHT = 3072;
const bounds = L.latLngBounds([[0, 0], [MAP_HEIGHT, MAP_WIDTH]]);

export function MapContainer() {
  return (
    <LeafletMap
      crs={L.CRS.Simple}
      bounds={bounds}
      maxBounds={bounds}
      minZoom={-1}
      maxZoom={2}
      zoom={-1}
      center={[MAP_HEIGHT / 2, MAP_WIDTH / 2]}
      style={{ height: '100vh', width: '100%' }}
    >
      <ImageOverlay url="/images/map-base.png" bounds={bounds} />
      {/* Future: Capability polygons and landmark markers will be added here */}
    </LeafletMap>
  );
}
```

*[Source: docs/dev-quickstart.md Pattern 3 - Leaflet MapContainer Component]*

---

## 🤖 Dev Agent Record

**Agent Model Used:** Claude Sonnet 4.5 (claude-sonnet-4-5-20250929)

### Debug Log References
No critical issues encountered during development.

### Completion Notes

**Testing Completion (2025-10-18)**

All implementation was already complete. Focused on testing verification and fixing SSR issues:

1. **Test Verification**: All unit tests passing (45 tests across 5 test files)
   - MapContainer component tests verify rendering without crashes
   - ImageOverlay props correctly tested
   - Mock implementation for react-leaflet prevents browser dependency issues

2. **SSR Fix**: Resolved Next.js server-side rendering issue with Leaflet
   - Issue: `window is not defined` error during build
   - Solution: Used Next.js `dynamic()` import with `{ ssr: false }` in [page.tsx:4-7](src/app/page.tsx#L4-L7)
   - Moved Leaflet CSS import to [layout.tsx:3](src/app/layout.tsx#L3) for global availability
   - Build now succeeds with static prerendering

3. **Build Verification**: Production build passes successfully
   - No type errors
   - No linting errors
   - Page properly marked as static (○ Static)

**All Acceptance Criteria Met:**
- ✅ MapContainer component created at [src/components/map/MapContainer.tsx](src/components/map/MapContainer.tsx)
- ✅ Leaflet map initialized with CRS.Simple coordinate system
- ✅ ImageOverlay displays base map at `/images/map-base.png`
- ✅ Map bounds calculated from 4096×3072 dimensions
- ✅ Default zoom and center configured correctly
- ✅ Map fills viewport responsively (100vh height, 100% width)
- ✅ Component uses React-Leaflet declarative API
- ✅ Unit tests verify map initialization without errors

### File List
- [src/components/map/MapContainer.tsx](src/components/map/MapContainer.tsx) - Main map component with CRS.Simple configuration
- [src/app/page.tsx](src/app/page.tsx) - Home page with dynamic MapContainer import (SSR disabled)
- [src/app/layout.tsx](src/app/layout.tsx) - Root layout with Leaflet CSS import
- [tests/unit/components/map/MapContainer.test.tsx](tests/unit/components/map/MapContainer.test.tsx) - Unit tests with react-leaflet mocks

---

## 📄 Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-17 | 0.1 | Initial draft created from sprint planning and architecture references | Bob (Scrum Master) |
| 2025-10-18 | 1.0 | Story completed - testing verified, SSR issue fixed, all acceptance criteria met | James (Dev Agent) |
