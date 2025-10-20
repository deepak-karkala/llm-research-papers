# Issue #11: Progressive Disclosure Logic

**Status:** Draft
**Story Points:** 3
**Priority:** P0
**Epic:** Sprint 2: Progressive Disclosure & Info Panels
**Sprint:** Sprint 2 (Week 3-4)

---

## Story Statement

**As a** map user exploring LLM research capabilities
**I want** to see capability layers reveal progressively as I zoom in
**So that** the map remains visually clear at different zoom levels and I can focus on relevant research areas

---

## Acceptance Criteria

- [ ] `src/hooks/useProgressiveDisclosure.ts` custom hook created
- [ ] Hook returns visible capabilities based on current zoom level
- [ ] Zoom thresholds implemented: Z0 (continents), Z1 (archipelagos), Z2 (islands)
- [ ] Smooth transitions when layers appear/disappear
- [ ] Zustand store updated with current zoom level
- [ ] MapContainer filters rendered polygons by zoom
- [ ] Unit test verifies filtering logic
- [ ] E2E test verifies zoom behavior

---

## Dependencies

**Previous Stories (Must be Complete):**
- ✅ Issue #7: MapContainer Component with Leaflet
- ✅ Issue #10: CapabilityPolygon Component

**Blocks:**
- Issue #12: Landmark Progressive Disclosure
- Issue #15: Legend Panel (zoom-level indicator)

---

## Dev Notes

### Previous Story Insights

From Issue #10 (CapabilityPolygon), the component successfully renders polygons with styling and interactions. The component accepts a `Capability` prop with polygon coordinates and visual styling. This story extends that work by controlling visibility based on zoom level.

### Data Models

**Capability Level Hierarchy** [Source: architecture.md Section 4.1]
- Each Capability has a `level` property (0=continent, 1=archipelago, 2=island)
- Zoom thresholds map to capability levels:
  - Z0-Z1: Show continents only (level 0)
  - Z1-Z2: Show continents + archipelagos (levels 0-1)
  - Z2+: Show all levels (levels 0-1-2)

The zoom level range for Leaflet CRS.Simple is typically 0-3:
- Level 0 = Full map visible (min zoom)
- Level 1 = 1x base zoom
- Level 2 = 2x base zoom
- Level 3 = 3x base zoom (max zoom) [Source: front-end-spec.md Section 6.1]

### State Management

**Zustand Store Updates** [Source: architecture.md Section 7.2]
- Add store action: `setCurrentZoom(zoomLevel: number)` to persist current zoom
- Add store selector: `getVisibleCapabilities(zoom: number): Capability[]` to filter by zoom

### Component Integration

**MapContainer Component** [Source: architecture.md Section 5.1]
- MapContainer already has access to current zoom via `onViewportChanged` event from react-leaflet
- Will call `setCurrentZoom()` on each zoom change
- Will use `useProgressiveDisclosure()` hook to filter capabilities before rendering

**CapabilityPolygon Component** [Source: architecture.md Section 5.1]
- No changes needed; filtering happens at container level
- Component will only receive visible capabilities as props

### Hook Specification

**useProgressiveDisclosure Hook**
```typescript
function useProgressiveDisclosure(
  capabilities: Capability[],
  currentZoom: number
): Capability[]

// Returns filtered array of capabilities visible at current zoom level
// Transition: triggers on zoom change, may use React.useMemo for performance
```

**Zoom Level Thresholds** [Source: prd.md Section 6.5]
- Z0 (Continental): 0 <= zoom < 1
  - Visible: Continents only (level 0)
- Z1 (Archipelago): 1 <= zoom < 2
  - Visible: Continents + Archipelagos (levels 0-1)
- Z2 (Island): 2 <= zoom <= 3
  - Visible: All levels (0-1-2)

### Performance Considerations

No specific guidance found in architecture docs. However:
- Capabilities filtering should use `useMemo()` to prevent unnecessary recalculation on every render
- Transition timing: Smooth fade-in/fade-out over 300ms [Source: front-end-spec.md Section 11]

### File Locations

Based on project structure [Source: architecture.md Section 5]:
- Hook file: `src/hooks/useProgressiveDisclosure.ts`
- Zustand store updates: `src/store/mapStore.ts` (existing)
- MapContainer integration: Update `src/components/map/MapContainer.tsx`

### Testing Requirements

**Unit Tests** [Source: architecture.md Section 9]
- Test hook with various zoom levels (0, 1, 2, 3)
- Test filtering logic with mixed capability levels
- Test memoization prevents unnecessary re-filtering
- Test edge cases: no capabilities visible, all visible

**E2E Tests** [Source: architecture.md Section 9]
- Start map at Z0: only continents visible
- Zoom to Z1: archipelagos appear
- Zoom to Z2: all islands appear
- Zoom out: layers smoothly fade out
- Verify visual consistency across all zoom transitions

---

## Tasks / Subtasks

### Task 1: Design Zustand Store Extensions (AC: 4-5)

1. Review current `src/store/mapStore.ts` structure
2. Add `currentZoom: number` state property
3. Add `setCurrentZoom(zoom: number)` action
4. Add `getVisibleCapabilities(zoom: number)` selector with filtering logic
5. Write unit test for store updates

**Reference:** [Source: architecture.md Section 7.2]

### Task 2: Implement useProgressiveDisclosure Hook (AC: 1-3)

1. Create `src/hooks/useProgressiveDisclosure.ts`
2. Accept `capabilities: Capability[]` and `currentZoom: number` as parameters
3. Implement filtering logic:
   - Z0-1: Filter to level 0 capabilities
   - Z1-2: Filter to levels 0-1
   - Z2+: Return all capabilities
4. Use `useMemo()` to optimize recalculation
5. Return filtered array
6. Write unit tests for all zoom levels and edge cases

**Reference:** [Source: architecture.md Section 5.7]

### Task 3: Integrate with MapContainer (AC: 4-6)

1. Update `src/components/map/MapContainer.tsx` to track zoom level
2. Call `setCurrentZoom()` in map's `onZoomEnd` event handler
3. Use `useProgressiveDisclosure()` hook to filter capabilities
4. Pass only visible capabilities to `CapabilityPolygon` components
5. Test that zoom changes trigger visibility updates

**Reference:** [Source: architecture.md Section 5.1]

### Task 4: Implement Smooth Transitions (AC: 4)

1. Add CSS transitions for CapabilityPolygon opacity (300ms ease-in-out)
2. Verify existing `CapabilityPolygon` component renders smoothly
3. Test transition performance across zoom levels
4. Add E2E test verifying smooth appearance/disappearance

**Reference:** [Source: front-end-spec.md Section 11 (Animations)]

### Task 5: Write Unit Tests (AC: 7)

1. Create `tests/unit/hooks/useProgressiveDisclosure.test.ts`
2. Test filtering at zoom level 0 (continents only)
3. Test filtering at zoom level 1 (continents + archipelagos)
4. Test filtering at zoom level 2 (all levels)
5. Test with empty capabilities array
6. Test memoization: verify same reference returned for identical inputs
7. Verify no accessibility regressions

**Reference:** [Source: architecture.md Section 9.1]

### Task 6: Write E2E Tests (AC: 8)

1. Create `tests/e2e/progressive-disclosure.spec.ts`
2. Start at Z0: verify only continent capabilities visible
3. Zoom to Z1: verify archipelago capabilities appear
4. Zoom to Z2: verify island capabilities appear
5. Zoom out: verify layers fade out smoothly
6. Test touch/pinch zoom on tablet
7. Verify map legend updates with current zoom level

**Reference:** [Source: architecture.md Section 9.2]

### Task 7: Code Review and Documentation (AC: All)

1. Code review with peer (focus on: zoom logic, performance, accessibility)
2. Add JSDoc comments to hook and store functions
3. Update README or dev docs if needed
4. Verify TypeScript compilation passes
5. Run linter and fix any issues

**Reference:** [Source: architecture.md Section 3.1]

---

## Project Structure Notes

- Hook follows existing pattern: `src/hooks/use*.ts` naming convention
- Uses Zustand store which already exists at `src/store/mapStore.ts`
- Tests follow project structure: `tests/unit/` and `tests/e2e/`
- No new directories required; reuses established patterns

---

## Technical Constraints

1. **Zoom Scale:** Leaflet CRS.Simple zoom range is 0-3 (fixed by map configuration)
2. **Performance:** Must handle filtering 15+ capabilities without lag
3. **Smooth Transitions:** CSS transitions must be 300ms based on design spec
4. **Browser Compatibility:** Must work on desktop and tablet (touch zoom)

---

## Completion Checklist

- [ ] All acceptance criteria met
- [ ] Unit tests pass (> 80% coverage)
- [ ] E2E tests pass
- [ ] Zero TypeScript errors
- [ ] Linter passes
- [ ] Accessibility: keyboard navigation works (Tab through visible capabilities)
- [ ] Code reviewed and approved by peer
- [ ] Merged to main branch
- [ ] Story status updated to "Done"

---

## Notes for Developer

This story implements the critical "progressive disclosure" pattern that keeps the map from becoming visually cluttered. The zoom thresholds are fixed based on the fantasy map concept:
- Continents (Z0) = Broad research areas (Attention, Alignment, Reasoning)
- Archipelagos (Z1) = Specialized techniques (RLHF, Fine-tuning, Quantization)
- Islands (Z2) = Specific implementations and papers

The filtering happens entirely on the client-side with no server calls. Smooth transitions enhance UX by signaling that new content is being revealed.

---

**Created:** 2025-10-20
**Epic:** Sprint 2
**Story:** #11 of Sprint 2 (Issue #11)
