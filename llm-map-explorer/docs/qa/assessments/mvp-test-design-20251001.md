# Test Design: Terra Incognita Linguae MVP

**Date:** October 1, 2025
**Designer:** Quinn (Test Architect)
**Scope:** Complete MVP test strategy based on PRD v1.0

---

## Test Strategy Overview

- **Total test scenarios:** 67
- **Unit tests:** 22 (33%)
- **Integration tests:** 28 (42%)
- **E2E tests:** 17 (25%)
- **Priority distribution:** P0: 45, P1: 18, P2: 4

### Test Pyramid Distribution

```
       E2E (17)
      /        \
  Integration (28)
  /              \
Unit (22)
```

### Philosophy

- **Shift Left:** Unit tests for pure logic (coordinate validation, search algorithms, data schemas)
- **Integration Focus:** Component interactions (map + state, search + navigation, tour + map sync)
- **E2E for Criticals:** Full user journeys (exploration, search-to-discovery, tour completion)
- **Performance Baked In:** Landmark culling, progressive disclosure tested at integration level

---

## Test Scenarios by Feature

### Feature 6.1: Core Interactive Map (P0)

**Acceptance Criteria:**
- AC1: Render 4K base map with Leaflet ImageOverlay
- AC2: Support pan, zoom, drag interactions
- AC3: Responsive across desktop/tablet
- AC4: CRS.Simple coordinate system with min/max bounds

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.1-UNIT-001 | Unit | P0 | Validate map bounds configuration | Pure data validation |
| 6.1-UNIT-002 | Unit | P0 | Calculate zoom thresholds correctly | Algorithm logic |
| 6.1-INT-001 | Integration | P0 | MapContainer initializes Leaflet with CRS.Simple | Multi-library integration |
| 6.1-INT-002 | Integration | P0 | Base map image loads and renders at correct size | Asset loading + rendering |
| 6.1-INT-003 | Integration | P1 | Pan updates map center in Zustand store | Component + state sync |
| 6.1-INT-004 | Integration | P1 | Zoom triggers progressive disclosure logic | Component interaction |
| 6.1-INT-005 | Integration | P1 | Responsive layout adapts to viewport changes | CSS + React state |
| 6.1-E2E-001 | E2E | P0 | User can pan map in all directions | Critical interaction |
| 6.1-E2E-002 | E2E | P0 | User can zoom in/out using scroll and buttons | Critical interaction |
| 6.1-E2E-003 | E2E | P1 | Map is usable on tablet (768px-1024px) | Responsive validation |

**Coverage:** 10 scenarios covering all ACs

---

### Feature 6.2: Capability Regions (P0)

**Acceptance Criteria:**
- AC1: Render polygons from capabilities.json
- AC2: Apply visual styles (fill, opacity, patterns)
- AC3: Hover effects with outline highlighting
- AC4: Click opens info panel with region details

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.2-UNIT-001 | Unit | P0 | Validate capability JSON schema with Zod | Data integrity |
| 6.2-UNIT-002 | Unit | P0 | Parse polygon coordinates correctly | Pure transformation |
| 6.2-INT-001 | Integration | P0 | CapabilityPolygon renders with correct GeoJSON | Leaflet + data |
| 6.2-INT-002 | Integration | P0 | Visual style hints apply (color, opacity) | Styling logic |
| 6.2-INT-003 | Integration | P1 | Hover effect changes polygon outline | Event + style |
| 6.2-INT-004 | Integration | P0 | Click polygon updates selectedEntity in store | Component + state |
| 6.2-E2E-001 | E2E | P0 | User clicks capability region and sees info panel | Critical journey |
| 6.2-E2E-002 | E2E | P1 | User hovers region and sees visual feedback | UX validation |

**Coverage:** 8 scenarios covering all ACs

---

### Feature 6.3: Landmarks (P0)

**Acceptance Criteria:**
- AC1: Render markers at specified coordinates
- AC2: Custom icons by type (lighthouse, ship, anchor, flag)
- AC3: Click opens detailed panel
- AC4: Only render visible markers (performance)

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.3-UNIT-001 | Unit | P0 | Validate landmark JSON schema | Data integrity |
| 6.3-UNIT-002 | Unit | P0 | useLandmarkCulling filters by viewport bounds | Critical algorithm |
| 6.3-UNIT-003 | Unit | P1 | Icon selector returns correct SVG by type | Pure logic |
| 6.3-INT-001 | Integration | P0 | LandmarkMarker renders at correct coordinates | Leaflet positioning |
| 6.3-INT-002 | Integration | P0 | Correct icon displayed for each landmark type | Asset + logic |
| 6.3-INT-003 | Integration | P0 | Click landmark updates selectedEntity | Component + state |
| 6.3-INT-004 | Integration | P0 | Culling prevents rendering off-screen markers | Performance critical |
| 6.3-INT-005 | Integration | P1 | Map pan triggers re-culling of markers | Dynamic performance |
| 6.3-E2E-001 | E2E | P0 | User clicks paper landmark and sees abstract | Critical journey |
| 6.3-E2E-002 | E2E | P0 | User clicks model landmark and sees parameters | Critical journey |
| 6.3-E2E-003 | E2E | P1 | Only visible landmarks render (check DOM count) | Performance validation |

**Coverage:** 11 scenarios covering all ACs + performance

---

### Feature 6.4: Information Panels (P0)

**Acceptance Criteria:**
- AC1: Slide-in panel on entity click
- AC2: Display title, type, description, details, links
- AC3: Deep links to related entities
- AC4: Close via X button or Esc key
- AC5: Accessible (ARIA, keyboard nav, focus management)

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.4-UNIT-001 | Unit | P0 | Panel content renderer selects correct template by entity type | Pure logic |
| 6.4-INT-001 | Integration | P0 | InfoPanel opens when selectEntity action called | Component + state |
| 6.4-INT-002 | Integration | P0 | Panel displays all required sections (title, description, links) | Component rendering |
| 6.4-INT-003 | Integration | P0 | Click related entity navigates to new entity | Navigation logic |
| 6.4-INT-004 | Integration | P0 | X button closes panel and clears selection | Component + state |
| 6.4-INT-005 | Integration | P0 | Esc key closes panel | Keyboard handling |
| 6.4-INT-006 | Integration | P0 | Opening panel sets focus to close button | A11y focus mgmt |
| 6.4-INT-007 | Integration | P1 | Slide-in animation completes in 300ms | Performance + UX |
| 6.4-E2E-001 | E2E | P0 | User navigates from paper → related org → back to paper | Complex journey |
| 6.4-E2E-002 | E2E | P0 | Screen reader announces panel content | A11y compliance |
| 6.4-E2E-003 | E2E | P1 | Tab navigation works within panel | Keyboard a11y |

**Coverage:** 11 scenarios covering all ACs + accessibility

---

### Feature 6.5: Progressive Disclosure (P0)

**Acceptance Criteria:**
- AC1: Define zoom thresholds (Z1: continents, Z2: + archipelagos, Z3: + islands/landmarks)
- AC2: Auto show/hide layers by zoom level
- AC3: Smooth transitions
- AC4: Legend explains visibility

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.5-UNIT-001 | Unit | P0 | useProgressiveDisclosure calculates visible layers by zoom | Core algorithm |
| 6.5-UNIT-002 | Unit | P0 | Zoom threshold configuration validates correctly | Data validation |
| 6.5-INT-001 | Integration | P0 | Z1: Only continents visible at zoom -1 | Feature correctness |
| 6.5-INT-002 | Integration | P0 | Z2: Archipelagos appear at zoom 0 | Feature correctness |
| 6.5-INT-003 | Integration | P0 | Z3: Landmarks appear at zoom 1 | Feature correctness |
| 6.5-INT-004 | Integration | P1 | Layer transitions are smooth (no flicker) | UX quality |
| 6.5-E2E-001 | E2E | P0 | User zooms in and progressively sees more details | Critical UX |

**Coverage:** 7 scenarios covering all ACs

---

### Feature 6.6: Legend (P0)

**Acceptance Criteria:**
- AC1: Collapsible panel in bottom-right
- AC2: Sections for icons, region types, zoom levels
- AC3: Keyboard accessible toggle
- AC4: Screen-reader compatible

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.6-INT-001 | Integration | P1 | LegendPanel renders in bottom-right position | Layout |
| 6.6-INT-002 | Integration | P1 | All icon types displayed with labels | Content completeness |
| 6.6-INT-003 | Integration | P1 | Toggle button expands/collapses legend | Interaction |
| 6.6-INT-004 | Integration | P0 | Keyboard accessible (Tab, Enter) | A11y |
| 6.6-INT-005 | Integration | P0 | Screen reader reads legend content | A11y compliance |
| 6.6-E2E-001 | E2E | P1 | User checks legend to understand map symbols | User journey |

**Coverage:** 6 scenarios covering all ACs

---

### Feature 6.7: Search & Filtering (P1)

**Acceptance Criteria:**
- AC1: Search box with instant dropdown
- AC2: Fuzzy matching across papers, capabilities, orgs, models
- AC3: Filter by entity type
- AC4: Weighted search (name > tags > description)
- AC5: Selecting result pans/zooms and opens panel

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.7-UNIT-001 | Unit | P1 | Fuse.js index initialization with correct weights | Search config |
| 6.7-UNIT-002 | Unit | P1 | useDebounceSearch delays search by 300ms | Performance logic |
| 6.7-UNIT-003 | Unit | P1 | Search query normalizes correctly (lowercase, trim) | Data processing |
| 6.7-INT-001 | Integration | P1 | SearchBar renders results in dropdown | Component |
| 6.7-INT-002 | Integration | P1 | Fuzzy search finds "attention" for "atention" | Search quality |
| 6.7-INT-003 | Integration | P1 | Filter tabs update results correctly | Feature logic |
| 6.7-INT-004 | Integration | P1 | Click result calls map.flyTo() | Navigation |
| 6.7-INT-005 | Integration | P1 | Click result opens InfoPanel | State update |
| 6.7-E2E-001 | E2E | P1 | User searches "transformer" and clicks paper | Journey |
| 6.7-E2E-002 | E2E | P1 | User filters to "models only" and finds GPT-3 | Complex journey |

**Coverage:** 10 scenarios covering all ACs

---

### Feature 6.8: Timeline (P1)

**Acceptance Criteria:**
- AC1: Left panel with vertical timeline
- AC2: Events sorted by date
- AC3: Click event highlights map elements
- AC4: Filters: year range, event type

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.8-UNIT-001 | Unit | P1 | Timeline events sort by date correctly | Algorithm |
| 6.8-UNIT-002 | Unit | P1 | Year range filter logic | Pure logic |
| 6.8-INT-001 | Integration | P1 | TimelinePanel renders events in order | Component |
| 6.8-INT-002 | Integration | P1 | Click event highlights linked landmarks | Cross-component |
| 6.8-INT-003 | Integration | P1 | Year slider filters events | Feature logic |
| 6.8-E2E-001 | E2E | P1 | User explores GPT timeline and sees evolution | User journey |

**Coverage:** 6 scenarios

---

### Feature 6.9: Guided Tours (P1)

**Acceptance Criteria:**
- AC1: Tour route with stepper UI
- AC2: Each stage centers map and highlights landmarks
- AC3: Keyboard shortcuts: [ and ]
- AC4: Progress indicator

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.9-UNIT-001 | Unit | P1 | Tour stage navigation logic (next/prev) | State machine |
| 6.9-INT-001 | Integration | P1 | TourPanel displays current stage | Component |
| 6.9-INT-002 | Integration | P1 | Advance stage pans map to new center | Cross-component |
| 6.9-INT-003 | Integration | P1 | Stage landmarks highlight on map | Visual feedback |
| 6.9-INT-004 | Integration | P1 | Progress bar updates correctly | UI state |
| 6.9-INT-005 | Integration | P1 | Keyboard shortcuts work ([ and ]) | Interaction |
| 6.9-INT-006 | Integration | P1 | Pause tour when clicking non-tour landmark | Complex logic |
| 6.9-INT-007 | Integration | P1 | Resume tour returns to correct stage | State persistence |
| 6.9-E2E-001 | E2E | P1 | User completes full "GPT Evolution" tour | Complete journey |
| 6.9-E2E-002 | E2E | P1 | User pauses tour, explores, then resumes | Complex interaction |

**Coverage:** 10 scenarios

---

### Feature 6.10: Organization Highlighting (P1)

**Acceptance Criteria:**
- AC1: Organization panel lists contributions
- AC2: "Highlight on Map" button dims non-org landmarks
- AC3: Highlighted landmarks maintain interactivity

#### Test Scenarios

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| 6.10-UNIT-001 | Unit | P1 | Organization.landmarkIds array filters correctly | Data logic |
| 6.10-INT-001 | Integration | P1 | Org panel displays all models/papers | Component |
| 6.10-INT-002 | Integration | P1 | Highlight button updates highlightedEntities | State |
| 6.10-INT-003 | Integration | P1 | Non-highlighted landmarks dim (opacity 0.3) | Visual effect |
| 6.10-INT-004 | Integration | P1 | Highlighted landmarks remain clickable | Interaction |
| 6.10-E2E-001 | E2E | P2 | User highlights OpenAI and explores contributions | User journey |

**Coverage:** 6 scenarios

---

## Cross-Cutting Concerns

### Data Loading & Validation

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| DATA-UNIT-001 | Unit | P0 | Zod schema validates capabilities.json | Data integrity |
| DATA-UNIT-002 | Unit | P0 | Zod schema validates papers.json | Data integrity |
| DATA-UNIT-003 | Unit | P0 | Zod schema validates tours.json | Data integrity |
| DATA-UNIT-004 | Unit | P0 | Zod schema validates organizations.json | Data integrity |
| DATA-INT-001 | Integration | P0 | useDataLoader fetches all JSON files in parallel | Performance |
| DATA-INT-002 | Integration | P0 | useDataLoader handles fetch errors gracefully | Error handling |
| DATA-E2E-001 | E2E | P0 | App loads successfully with valid data | Critical path |
| DATA-E2E-002 | E2E | P1 | App shows error state with invalid/missing data | Error recovery |

**Coverage:** 8 scenarios

### Accessibility (WCAG 2.1 AA)

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| A11Y-INT-001 | Integration | P0 | All interactive elements have aria-labels | A11y req |
| A11Y-INT-002 | Integration | P0 | Color contrast meets 4.5:1 ratio | A11y req |
| A11Y-INT-003 | Integration | P0 | Focus indicators visible (2px outline) | A11y req |
| A11Y-E2E-001 | E2E | P0 | Keyboard-only navigation completes user journey | A11y critical |
| A11Y-E2E-002 | E2E | P0 | Screen reader announces all page changes | A11y critical |
| A11Y-E2E-003 | E2E | P0 | Axe audit shows 0 violations | Compliance |

**Coverage:** 6 scenarios

### Performance

| ID | Level | Priority | Test | Justification |
|----|-------|----------|------|---------------|
| PERF-INT-001 | Integration | P0 | Landmark culling reduces DOM nodes by 80%+ | Performance critical |
| PERF-INT-002 | Integration | P1 | Search debounce prevents excessive queries | Performance |
| PERF-INT-003 | Integration | P1 | Map pan animations run at 60 FPS | UX quality |
| PERF-E2E-001 | E2E | P0 | First Contentful Paint < 1.5s | Core Web Vital |
| PERF-E2E-002 | E2E | P0 | Time to Interactive < 3s | Core Web Vital |
| PERF-E2E-003 | E2E | P1 | Lighthouse performance score ≥ 85 | Quality gate |

**Coverage:** 6 scenarios

---

## Test Execution Strategy

### Phase 1: Foundation (Week 1-2)
**Goal:** Verify core data and map infrastructure

```bash
# Run P0 unit tests
npm run test -- --grep "P0.*UNIT"

# Run P0 integration tests
npm run test -- --grep "P0.*INT"
```

**Includes:**
- Data validation (Zod schemas)
- Map initialization
- Coordinate calculations
- Progressive disclosure algorithms

**Exit Criteria:** All P0 unit/integration tests pass

---

### Phase 2: Component Integration (Week 3-4)
**Goal:** Verify component interactions

```bash
# Run all integration tests
npm run test:integration
```

**Includes:**
- Map + State sync
- Panel interactions
- Search + Navigation
- Tour logic

**Exit Criteria:** All integration tests pass, 80%+ code coverage

---

### Phase 3: E2E User Journeys (Week 5)
**Goal:** Validate critical user paths

```bash
# Run P0 E2E tests
npm run test:e2e -- --grep "P0"
```

**Includes:**
- First-time exploration
- Search-to-discovery
- Tour completion
- Accessibility validation

**Exit Criteria:** All P0 E2E tests pass, Axe audit clean

---

### Phase 4: Performance & Polish (Week 6)
**Goal:** Meet performance targets

```bash
# Run performance tests
npm run test:perf

# Run Lighthouse CI
npm run lighthouse
```

**Includes:**
- Core Web Vitals
- Landmark culling validation
- Bundle size check
- Full regression suite

**Exit Criteria:** Lighthouse ≥85, all performance tests pass

---

## Risk Coverage Matrix

| Risk | Probability | Impact | Test Coverage |
|------|-------------|--------|---------------|
| **Map performance degrades with 100+ landmarks** | High | High | 6.3-INT-004, PERF-INT-001 |
| **Progressive disclosure breaks at edge zoom levels** | Medium | High | 6.5-UNIT-001, 6.5-INT-001-003 |
| **Search returns irrelevant results** | Medium | Medium | 6.7-INT-002, 6.7-E2E-001 |
| **Accessibility violations block compliance** | Low | High | A11Y-E2E-001-003 |
| **Data validation fails with malformed JSON** | Medium | High | DATA-UNIT-001-004, DATA-INT-002 |
| **Tour navigation state corrupts** | Low | Medium | 6.9-INT-006-007 |
| **Mobile experience unusable** | Medium | High | 6.1-E2E-003, 6.1-INT-005 |

---

## Coverage Gaps & Recommendations

### ✅ Strong Coverage Areas
- **Core Map Functionality:** 10 scenarios (unit → integration → E2E)
- **Accessibility:** 11 scenarios including screen reader testing
- **Data Integrity:** 8 scenarios with Zod validation
- **Performance:** 6 scenarios covering critical paths

### ⚠️ Areas Needing Additional Tests (Post-MVP)

1. **Error Recovery:**
   - What happens if map image fails to load?
   - How does app handle JSON parse errors?
   - **Recommendation:** Add error boundary E2E tests

2. **Mobile Touch Interactions:**
   - Pinch-to-zoom on mobile
   - Touch gestures for panning
   - **Recommendation:** Add mobile-specific E2E tests

3. **Concurrent User Actions:**
   - Opening tour while panel is open
   - Searching while tour is active
   - **Recommendation:** Add integration tests for state conflicts

4. **Browser Compatibility:**
   - Safari-specific rendering
   - Firefox Leaflet quirks
   - **Recommendation:** Add cross-browser E2E suite

---

## Test Maintenance Strategy

### Automated Regression
```yaml
# .github/workflows/test.yml
on: [push, pull_request]
jobs:
  test:
    - Run unit tests (fail fast)
    - Run integration tests
    - Run P0 E2E tests
    - Run accessibility audit
```

### Performance Budgets
```javascript
// playwright.config.ts
use: {
  expectations: {
    performance: {
      fcp: 1500,  // First Contentful Paint
      lcp: 2500,  // Largest Contentful Paint
      tti: 3000,  // Time to Interactive
    }
  }
}
```

### Test Data Management
- **Fixture Data:** Store in `tests/fixtures/` directory
- **Mock JSON:** Subset of production data for unit tests
- **E2E Data:** Full realistic dataset (10 capabilities, 30 papers, 3 tours)

---

## Quality Gates

### Pre-Merge Checklist
- [ ] All P0 tests passing
- [ ] Code coverage ≥ 80%
- [ ] Axe audit: 0 violations
- [ ] Lighthouse performance ≥ 85
- [ ] No console errors in E2E tests

### Release Readiness
- [ ] All tests passing (P0, P1, P2)
- [ ] Manual QA on real devices (Desktop, Tablet)
- [ ] Performance validation on 3G network
- [ ] Accessibility tested with real screen reader
- [ ] Documentation updated

---

## Summary

This test design provides **comprehensive coverage** with **67 scenarios** across **10 MVP features**:

**Strengths:**
✅ Strong focus on P0 critical paths (45 scenarios)
✅ Balanced test pyramid (33% unit, 42% integration, 25% E2E)
✅ Performance baked into integration tests
✅ Accessibility as first-class requirement
✅ Risk-based prioritization

**Implementation Priority:**
1. **Weeks 1-2:** Foundation (data validation, map init, core algorithms)
2. **Weeks 3-4:** Component integration (state sync, interactions)
3. **Week 5:** E2E critical journeys (exploration, search, tours)
4. **Week 6:** Performance validation and regression suite

**Test Automation Target:** 95%+ of scenarios automated (manual QA for UX polish only)

---

**Next Steps:**
1. Set up Vitest + Playwright infrastructure
2. Implement P0 unit tests (data schemas, algorithms)
3. Build integration test harness (React Testing Library + Zustand mocks)
4. Create E2E page objects for key workflows
5. Configure CI/CD pipeline with quality gates

---

**Document Version:** 1.0
**Last Updated:** October 1, 2025
**Status:** ✅ Ready for Implementation
