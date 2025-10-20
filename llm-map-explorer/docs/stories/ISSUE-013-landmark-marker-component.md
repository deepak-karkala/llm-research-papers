# Issue #13: LandmarkMarker Component

**Status:** Draft
**Story Points:** 4
**Priority:** P0
**Epic:** Sprint 2: Progressive Disclosure & Info Panels
**Sprint:** Sprint 2 (Week 3-4)

---

## Story Statement

**As a** map user exploring LLM research
**I want** to see landmark points (papers, models, tools) on the map with distinctive icons
**So that** I can visually identify different types of research contributions and interact with them

---

## Acceptance Criteria

- [ ] `src/components/map/LandmarkMarker.tsx` created
- [ ] Renders Leaflet Marker at provided coordinates
- [ ] Custom icons by type (lighthouse for papers, ship for models, wrench for tools, target for benchmarks)
- [ ] Click opens InfoPanel with landmark details
- [ ] Hover shows tooltip with landmark name
- [ ] Accessible: keyboard focusable (Tab), aria-label with description
- [ ] Component accepts Landmark prop
- [ ] Unit test verifies rendering and click handler
- [ ] E2E test verifies user interactions (hover, click, keyboard)

---

## Dependencies

**Previous Stories (Must be Complete):**
- ✅ Issue #7: MapContainer Component with Leaflet
- ✅ Issue #12: Seed Data - Landmarks

**Blocks:**
- Issue #14: InfoPanel Component
- Issue #26: Landmark Culling (performance optimization)

---

## Dev Notes

### Previous Story Insights

From Issue #7 (MapContainer), we have the core Leaflet setup with CRS.Simple coordinate system. From Issue #12, we have landmark data ready. This story creates the visual representation of landmarks as interactive markers on the map.

### Landmark Type Icons Mapping

**Icon Visual Strategy** [Source: front-end-spec.md Section 6.1]
```
Paper     → Lighthouse icon (information beacon)
Model     → Ship icon (carries knowledge across seas)
Tool      → Wrench icon (utility, implementation)
Benchmark → Target icon (goal/measurement)
```

These icons convey semantic meaning:
- Lighthouse: Guides navigation (papers guide research)
- Ship: Carries cargo (models carry learned knowledge)
- Wrench: Practical tool
- Target: Achievement milestone

### Component API

**LandmarkMarker Props** [Source: architecture.md Section 5.1]
```typescript
interface LandmarkMarkerProps {
  landmark: Landmark;          // Landmark data object
  selected?: boolean;          // Visual highlight when selected
  dimmed?: boolean;            // Reduced opacity (used in filtering/highlighting)
  onSelect?: (id: string) => void;  // Callback when clicked
  onHover?: (id: string | null) => void;  // Callback for hover
}

// Landmark type (from Issue #12)
interface Landmark {
  id: string;
  name: string;
  type: "paper" | "model" | "tool" | "benchmark";
  year: number;
  organization: string;
  coordinates: LatLng;
  description: string;
  // ... other fields
}
```

[Source: architecture.md Section 4.2]

### Icon Creation & Asset Management

**SVG Icon Libraries** [Source: architecture.md Section 5.1, front-end-spec.md Section 8]
- Use react-leaflet's Marker component with custom icon
- Icons can be:
  - SVG strings (embedded)
  - External SVG files from `/public/icons/`
  - Generated using popular icon library (e.g., lucide-react)

**Recommended Approach:** Use Leaflet.divIcon for flexibility:
```typescript
const iconHtml = `<div class="landmark-marker landmark-${type}">${svgIcon}</div>`;
const icon = L.divIcon({
  html: iconHtml,
  className: '', // Override default styling
  iconSize: [32, 32],
  iconAnchor: [16, 16], // Center of icon
  popupAnchor: [0, -20] // Above icon
});
```

### Tooltip Behavior

**Hover Tooltip** [Source: front-end-spec.md Section 6.1]
- Show on hover: landmark name
- Display time: 200ms delay to prevent tooltip spam
- Position: Above landmark marker
- Animation: Fade-in 200ms
- Hide on hover-out: 100ms delay

Example: Hovering over "GPT-3" model shows tooltip "GPT-3 · Model · 2020"

### Click Interaction & State Management

**Click Handler Flow** [Source: architecture.md Section 7.2]

```
1. User clicks LandmarkMarker
2. Component calls onSelect(landmarkId)
3. Parent (MapContainer) updates Zustand store:
   - setSelectedEntity({type: 'landmark', id: landmarkId})
4. MapContainer re-renders with selected={true} prop
5. Store triggers InfoPanel to open with landmark details
```

Selected state visual feedback:
- Highlight: Glow effect (box-shadow or CSS filter)
- Scale: Slight scale-up (1.1x)
- Z-index: Bring to front

### Accessibility Requirements

**Keyboard Navigation** [Source: front-end-spec.md Section 9 (Accessibility)]
- Tab to focus marker
- Enter to "select" (open InfoPanel)
- Esc to close InfoPanel
- Arrow keys to navigate between nearby markers (stretch goal)

**ARIA Labels:**
- `aria-label`: "{Name} · {Type} · {Year} · {Organization}"
  - Example: "Attention Is All You Need · Paper · 2017 · Google"
- `role="button"` to indicate clickability
- `aria-pressed` to indicate selection state

**Visual Accessibility:**
- Focus ring visible (3px minimum)
- Color contrast ≥ 4.5:1
- Icons meaningful (not just decorative)
- Fallback text for SVG icons

### Component Structure & Styling

**File Location** [Source: architecture.md Section 5]
- Component: `src/components/map/LandmarkMarker.tsx`
- Styles: Inline CSS or `src/styles/components/LandmarkMarker.module.css`
- Icons: `public/icons/landmarks/` (if external SVGs)

**Styling Approach** [Source: front-end-spec.md Section 11]
- Use Tailwind classes for styling
- CSS modules for complex animations
- BEM naming if using separate CSS file
- Support dark mode (future-proofing)

### Performance Considerations

**Memoization Strategy** [Source: architecture.md Section 2.5]
- Use `React.memo()` to prevent unnecessary re-renders
- Compare: `landmark.id`, `selected`, `dimmed` props
- Landmark content rarely changes during a session

**Event Delegation:**
- onClick/onHover handled by component (Leaflet handles event bubbling)
- No memory leaks: cleanup handlers properly

### Testing Requirements

**Unit Tests** [Source: architecture.md Section 9.1]
- Render marker with landmark data
- Verify correct icon renders based on landmark type
- Verify click handler called on marker click
- Verify hover tooltip appears/disappears
- Test with different landmark types (paper, model, tool, benchmark)
- Verify aria-label is correct
- Test selected/dimmed visual states

**E2E Tests** [Source: architecture.md Section 9.2]
- Hover over marker → tooltip appears
- Click marker → InfoPanel opens with landmark details
- Tab to marker → focus visible
- Press Enter on focused marker → InfoPanel opens
- Esc closes InfoPanel
- Keyboard navigation between markers (if implemented)

### Integration with MapContainer

**Parent Component Integration** [Source: architecture.md Section 5.1]
```typescript
// In MapContainer.tsx
{landmarks.map(landmark => (
  <LandmarkMarker
    key={landmark.id}
    landmark={landmark}
    selected={selectedEntity?.id === landmark.id}
    dimmed={someFilter}  // e.g., when organization highlighting active
    onSelect={(id) => selectEntity('landmark', id)}
    onHover={(id) => setHoveredLandmarkId(id)}
  />
))}
```

---

## Tasks / Subtasks

### Task 1: Design Icon Set (AC: 3)

1. Choose or create icons for each landmark type:
   - Paper: Lighthouse or book icon
   - Model: Ship or robot icon
   - Tool: Wrench or gear icon
   - Benchmark: Target or flag icon

2. Create icon SVGs:
   - Size: 32×32 px minimum
   - Color: Match front-end spec palette
   - Simplicity: Recognizable at map zoom levels
   - Accessibility: Not relying solely on color

3. Save icons to `public/icons/landmarks/`:
   - `lighthouse.svg` (paper)
   - `ship.svg` (model)
   - `wrench.svg` (tool)
   - `target.svg` (benchmark)

4. Document icon meanings in component comments

**Reference:** [Source: front-end-spec.md Section 6.1, Section 8]

### Task 2: Create LandmarkMarker Component Structure (AC: 1-2)

1. Create `src/components/map/LandmarkMarker.tsx`
2. Define component props interface (Landmark, selected, dimmed, callbacks)
3. Use Leaflet Marker with custom divIcon
4. Implement icon selection based on landmark.type
5. Set up basic rendering (no interactions yet)
6. Add TypeScript types and export

**Reference:** [Source: architecture.md Section 5.1]

### Task 3: Implement Click Handler (AC: 4, 7)

1. Add onClick handler to marker
2. Call onSelect callback with landmark.id
3. Update Zustand store via parent component
4. Add visual feedback: glow effect or scale-up
5. Handle multiple clicks gracefully
6. Test click event bubbling

**Reference:** [Source: architecture.md Section 7.2]

### Task 4: Implement Hover Tooltip (AC: 5)

1. Add Leaflet Tooltip to marker
2. Configure tooltip text: `{name} · {type} · {year}`
3. Set tooltip options:
   - Delay: 200ms on hover-in
   - Hide delay: 100ms on hover-out
   - Position: Above marker
   - Sticky: false

4. Style tooltip with Tailwind/CSS:
   - Background: Dark (from style guide)
   - Text: Light/white
   - Border-radius: 4px
   - Font-size: 12px

5. Test tooltip appearance and behavior

**Reference:** [Source: front-end-spec.md Section 6.1]

### Task 5: Implement Accessibility Features (AC: 6)

1. Add keyboard focus management:
   - Component receives ref prop from parent
   - Focus outline visible (ring class from Tailwind)
   - Tab order correct

2. Add ARIA attributes:
   - `role="button"` on marker
   - `aria-label="{name} · {type} · {year} · {organization}"`
   - `aria-pressed={selected}` for selection state
   - `tabIndex={0}` for keyboard access

3. Add keyboard event handlers:
   - Enter key to select (call onSelect)
   - Esc key to deselect (call parent deselect method)

4. Test with screen reader (NVDA or similar)

**Reference:** [Source: front-end-spec.md Section 9 (Accessibility)]

### Task 6: Implement Visual States (AC: 3, 6)

1. Style normal state:
   - Icon visible at normal size
   - Cursor: pointer
   - Opacity: 1.0

2. Style hover state:
   - Scale: 1.1x (slight zoom)
   - Opacity: 1.0
   - Glow effect (box-shadow or filter)

3. Style selected state:
   - Scale: 1.15x (more prominent)
   - Glow effect: More intense
   - Z-index: Higher than other markers

4. Style dimmed state (for highlighting):
   - Opacity: 0.3
   - Scale: 0.9x (slightly smaller)

5. Smooth transitions:
   - All changes 200ms ease
   - No jarring visual shifts

**Reference:** [Source: front-end-spec.md Section 11 (Animations)]

### Task 7: Implement Memoization & Performance (AC: 7)

1. Wrap component with `React.memo()`
2. Define prop comparison function:
   - Compare: landmark.id, selected, dimmed
   - Ignore: function references (use useCallback)
3. Move callbacks to parent or use useCallback
4. Test performance with 50+ markers on map
5. Verify no excessive re-renders (use React DevTools Profiler)

**Reference:** [Source: architecture.md Section 2.5]

### Task 8: Write Unit Tests (AC: 8)

1. Create `tests/unit/components/map/LandmarkMarker.test.tsx`
2. Test rendering:
   - Render with landmark data
   - Verify correct icon for each type
   - Verify name visible

3. Test interactions:
   - Click handler called with correct landmark ID
   - Hover shows tooltip
   - Selected state applies styling

4. Test accessibility:
   - aria-label correct
   - role="button" present
   - Tab focus works

5. Test edge cases:
   - Very long landmark name
   - Special characters in name

**Reference:** [Source: architecture.md Section 9.1]

### Task 9: Write E2E Tests (AC: 9)

1. Create `tests/e2e/landmark-marker.spec.ts`
2. Test user flows:
   - Hover landmark → tooltip appears with name
   - Click landmark → InfoPanel opens
   - Esc closes InfoPanel
   - Tab to landmark → focus visible
   - Enter opens InfoPanel
   - Click another landmark → switches InfoPanel

3. Test with multiple landmark types
4. Test on different viewport sizes
5. Verify accessibility tree (screen reader)

**Reference:** [Source: architecture.md Section 9.2]

### Task 10: Integration Testing (AC: All)

1. Integrate LandmarkMarker with MapContainer
2. Test landmark filtering based on zoom
3. Test landmark highlighting on organization select
4. Test landmark culling (from Task 26)
5. Verify no console errors or warnings
6. Test performance with full landmark dataset

**Reference:** [Source: architecture.md Section 5.1]

### Task 11: Code Review & Documentation (AC: All)

1. Self-review code for:
   - Type safety (TypeScript strict mode)
   - Accessibility compliance
   - Performance (memoization, no memory leaks)
   - Code style and naming

2. Peer code review
3. Add JSDoc comments to component and functions
4. Update component documentation (if applicable)
5. Commit to git with clear message

**Reference:** [Source: architecture.md Section 3.1]

---

## Project Structure Notes

- Component follows pattern: `src/components/map/{Feature}.tsx`
- Icons stored in `public/icons/landmarks/` for accessibility and reusability
- Tests follow structure: `tests/unit/components/map/` and `tests/e2e/`
- Uses existing Leaflet + react-leaflet setup from Issue #7

---

## Technical Constraints

1. **Icon Size:** Must be recognizable at all zoom levels (test at Z0, Z1, Z2)
2. **Event Handling:** Click events must not conflict with map pan/zoom
3. **Performance:** Component must memoize and avoid re-renders on map pan
4. **Accessibility:** Must be fully keyboard navigable and screen-reader compatible
5. **Coordinate System:** Must use CRS.Simple coordinates from landmarks.json

---

## Completion Checklist

- [ ] LandmarkMarker component created
- [ ] Custom icons for all landmark types created
- [ ] Click handler opens InfoPanel
- [ ] Hover shows tooltip with name/year
- [ ] Tab navigation focuses marker
- [ ] ARIA labels present and correct
- [ ] Visual states (normal, hover, selected, dimmed) working
- [ ] Memoization implemented (no unnecessary re-renders)
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] Zero TypeScript errors
- [ ] Linter passes
- [ ] Peer reviewed
- [ ] Merged to main
- [ ] Story status updated to "Done"

---

## Notes for Developer

This component is the primary UI element for landmark interaction. Quality here impacts user experience significantly:

1. **Icons:** Make them distinctive and meaningful. Icons should communicate type at a glance
2. **Responsiveness:** Test at multiple zoom levels to ensure icons don't become too large or small
3. **Performance:** With 30+ landmarks, memoization is critical to prevent lag when panning
4. **Accessibility:** This component must be fully accessible via keyboard for inclusive user experience

The component should be "dumb" - it receives props from MapContainer and calls callbacks. MapContainer manages state and filtering.

---

**Created:** 2025-10-20
**Epic:** Sprint 2
**Story:** #13 of Sprint 2 (Issue #13)
