# Issue #14: InfoPanel Component (Right Drawer)

**Status:** Draft
**Story Points:** 5
**Priority:** P0
**Epic:** Sprint 2: Progressive Disclosure & Info Panels
**Sprint:** Sprint 2 (Week 3-4)

---

## Story Statement

**As a** map user exploring LLM research
**I want** to view detailed information about selected capabilities or landmarks in a side panel
**So that** I can read descriptions, abstracts, external links without leaving the map view

---

## Acceptance Criteria

- [ ] `src/components/panels/InfoPanel.tsx` created
- [ ] Slide-in animation (300ms ease-out) from right side
- [ ] Close button (X) and Esc key support
- [ ] Displays capability info (description, related landmarks)
- [ ] Displays landmark info (abstract, authors, year, links, tags)
- [ ] Deep links to related entities (capability → landmarks, landmark → capability)
- [ ] Scrollable content area for long text
- [ ] Accessible: focus trap, aria-labels, keyboard navigation
- [ ] Uses shadcn/ui Sheet component
- [ ] Unit test verifies open/close and content rendering
- [ ] E2E test verifies user flow (select entity, view details, close panel)

---

## Dependencies

**Previous Stories (Must be Complete):**
- ✅ Issue #13: LandmarkMarker Component
- ✅ Issue #10: CapabilityPolygon Component
- ✅ Issue #12: Seed Data - Landmarks

**Blocks:**
- Issue #22: Organization Highlighting (adds button to InfoPanel)
- Issue #28: TourPanel Component (transforms into tour mode)
- Issue #31: Tour Pause/Resume (coexists with InfoPanel)

---

## Dev Notes

### Previous Story Insights

From Issues #10 and #13, we have interactive map elements (polygons and markers). This story adds the detailed view panel that displays information about selected entities. The panel needs to handle two entity types: Capability and Landmark.

### UI Component & Library

**shadcn/ui Sheet Component** [Source: front-end-spec.md Section 6.3, architecture.md Section 5.1]

The InfoPanel will use the shadcn/ui Sheet component, which provides:
- Slide-in animation from the right
- Built-in close button and Esc key handling
- Overlay with customizable opacity
- Focus trap (keeps focus within panel)
- Accessibility features (ARIA labels, keyboard navigation)

Sheet configuration:
```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet"

// Usage in InfoPanel
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>{entity.name}</SheetTitle>
      <SheetDescription>{entityType}</SheetDescription>
    </SheetHeader>
    {/* Content area */}
  </SheetContent>
</Sheet>
```

[Source: front-end-spec.md Section 6.3]

### Entity Types & Content Structure

**Capability Entity Display** [Source: architecture.md Section 4.1]
```typescript
interface CapabilityInfo {
  name: string;              // "Attention"
  level: number;             // 0, 1, 2
  description: string;       // Full description
  visualStyleHints: {
    fillColor: string;
    fillOpacity: number;
    strokeColor: string;
  };
  relatedLandmarks: Landmark[];  // Landmarks in this capability
}

Display Layout:
- Header: Capability name + level indicator (continent/archipelago/island)
- Description: Full text with line wrapping
- Related Landmarks: List of landmark names with links
- Map Context: What other capabilities are nearby (optional)
```

**Landmark Entity Display** [Source: architecture.md Section 4.2]
```typescript
interface LandmarkInfo {
  name: string;              // "Attention Is All You Need"
  type: string;              // "paper", "model", "tool", "benchmark"
  year: number;              // 2017
  organization: string;       // "Google Brain"
  description: string;       // Short description
  abstract?: string;         // Full abstract (for papers)
  externalLinks: ExternalLink[];
  capabilityId: string;      // Parent capability
  tags: string[];            // ["attention", "transformer"]
}

Display Layout:
- Header: Landmark name + type badge + year
- Metadata: Organization, publication year, type
- Description: Short description
- Abstract: Full text (expandable for long content)
- Tags: Colorful tag chips
- External Links: Clickable links to arXiv, GitHub, etc.
- Parent Capability: Link to capability region
```

### Animation & Transitions

**Slide-In Animation** [Source: front-end-spec.md Section 11]
- Duration: 300ms ease-out
- From position: Right edge (off-screen)
- To position: Right side of viewport
- Overlay fade-in: Same timing
- Backdrop blur/dim: Optional subtle effect

### State Management Integration

**Zustand Store** [Source: architecture.md Section 7.2]
```typescript
// In map store
interface MapStore {
  selectedEntity: { type: 'capability' | 'landmark', id: string } | null;
  selectEntity: (type, id) => void;
  clearSelection: () => void;
}

// InfoPanel subscribes to selectedEntity
// On change, loads entity data and displays
```

### Content Scrolling

**Long Content Handling** [Source: front-end-spec.md Section 6.3]
- Abstract text may be very long (500+ words for papers)
- Use scrollable div within Sheet:
  - Max height: Viewport height - header - footer space
  - Scrollbar: Native or styled (Tailwind scroll styling)
  - Padding: 16px to avoid text touching edges

Example:
```tsx
<SheetContent side="right" className="max-w-md">
  <SheetHeader>{/* ... */}</SheetHeader>
  <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
    {/* Scrollable content */}
  </div>
</SheetContent>
```

### External Links

**Link Types & Display** [Source: architecture.md Section 4.2]
```typescript
interface ExternalLink {
  title: string;          // "arXiv"
  url: string;            // "https://arxiv.org/..."
  type: "arxiv" | "github" | "model-card" | "website" | "paper";
}

Display:
- Render as buttons or links
- Icon + text: "[ArXiv] View on arXiv"
- Open in new tab: target="_blank" rel="noopener noreferrer"
- Styling: Primary button color (from style guide)
- Accessible: aria-label describing link target
```

### Deep Linking

**Related Entity Links** [Source: prd.md Section 6.4]
- Capability → Related Landmarks: "See {X} landmark(s) in {capability}"
- Landmark → Parent Capability: "Part of {capability} region"
- Clicking related entity:
  1. Panel stays open
  2. Loads new entity data
  3. Map pans/zooms to entity (if not visible)
  4. Smooth transition

### Accessibility Requirements

**Focus Management** [Source: front-end-spec.md Section 9]
- Focus trap: Tab within panel keeps focus inside
- Initial focus: First focusable element (close button or title)
- Close button: Always accessible (top-right corner)
- Esc key: Closes panel and returns focus to map
- Screen reader: Panel announced as modal/drawer

**ARIA Attributes:**
```tsx
<Sheet
  open={isOpen}
  onOpenChange={setIsOpen}
  aria-label="Entity details panel"
>
  <SheetContent
    role="dialog"
    aria-modal="true"
    aria-labelledby="panel-title"
    aria-describedby="panel-description"
  >
    {/* Content */}
  </SheetContent>
</Sheet>
```

### Type Badges & Visual Hierarchy

**Type Indicators** [Source: front-end-spec.md Section 6.3]
- Capability level: Badge showing "Continent", "Archipelago", or "Island"
- Landmark type: Badge showing "Paper", "Model", "Tool", or "Benchmark"
- Colors: Consistent with style guide palette
- Icons: Optional (lighthouse for paper, ship for model, etc.)

### Keyboard Navigation

**Supported Keys:**
- Tab: Navigate through focusable elements (within panel)
- Shift+Tab: Navigate backward
- Enter: Activate links and buttons
- Esc: Close panel
- Arrow keys: (Optional) Navigate between related entities

### Component Structure

**File Location** [Source: architecture.md Section 5]
- Component: `src/components/panels/InfoPanel.tsx`
- Styles: Tailwind + optional CSS module for animations
- Related utilities: `src/lib/formatters.ts` for formatting dates, links, etc.

**Prop Interface:**
```typescript
interface InfoPanelProps {
  isOpen: boolean;
  onClose: () => void;
  entity: Capability | Landmark | null;
  onRelatedEntitySelect?: (type: string, id: string) => void;
}
```

### Testing Strategy

**Unit Tests** [Source: architecture.md Section 9.1]
- Render with capability data
- Render with landmark data
- Verify content displays correctly
- Test close button and Esc key
- Test related entity links (don't navigate, just call callback)
- Test scrolling behavior
- Accessibility tree structure

**E2E Tests** [Source: architecture.md Section 9.2]
- Select landmark from map → InfoPanel opens
- Select capability from map → InfoPanel opens
- Close panel (X button) → Panel closes, focus returns to map
- Press Esc → Panel closes
- Tab through elements → All focusable elements reachable
- Click external link → Opens in new tab
- Click related entity link → InfoPanel updates with new entity
- Verify smooth animations

---

## Tasks / Subtasks

### Task 1: Set Up Component Structure (AC: 1, 8-9)

1. Create `src/components/panels/InfoPanel.tsx`
2. Import shadcn/ui Sheet components
3. Define props interface (isOpen, onClose, entity, onRelatedEntitySelect)
4. Create basic component skeleton:
   - Accept props
   - Integrate with Zustand selectedEntity state
   - Return Sheet component

5. Add TypeScript types for Capability and Landmark
6. Export component from component barrel file

**Reference:** [Source: architecture.md Section 5, front-end-spec.md Section 6.3]

### Task 2: Implement Capability Display (AC: 3)

1. Create `renderCapabilityContent()` function
2. Display capability fields:
   - Name (large heading)
   - Level indicator (badge: "Continent", "Archipelago", "Island")
   - Description (full text with line wrapping)
   - Visual style preview (color swatch showing fill/stroke colors)

3. List related landmarks:
   - Heading: "Related landmarks ({count})"
   - Link list showing landmark names
   - Each link: `onClick={() => selectEntity('landmark', id)}`
   - Icons for landmark types

4. Styling: Use Tailwind for consistent spacing and typography
5. Test rendering with sample capability data

**Reference:** [Source: architecture.md Section 4.1]

### Task 3: Implement Landmark Display (AC: 4)

1. Create `renderLandmarkContent()` function
2. Display landmark fields in order:
   - Name (large heading)
   - Type badge (Paper | Model | Tool | Benchmark)
   - Metadata row: Year • Organization
   - Description
   - Abstract (with expandable read-more if very long)
   - Tags (as colored chips/pills)
   - External links (buttons with icons)
   - Parent capability link

3. Format data:
   - Year: "2017"
   - Links: Icon + title
   - Tags: Lowercase, separated by commas or chips
   - Abstract: Max 3 lines initially, expand on click

4. Styling: Professional, readable layout
5. Test rendering with sample landmark data

**Reference:** [Source: architecture.md Section 4.2]

### Task 4: Implement Slide-In Animation (AC: 2)

1. Configure shadcn/ui Sheet with custom animation:
   - Duration: 300ms
   - Easing: ease-out
   - From: Right off-screen
   - To: Right side of viewport

2. Test animation:
   - Smooth slide-in when panel opens
   - Smooth slide-out when panel closes
   - Overlay fades in/out with panel

3. No janky or stuttering animations
4. Performance: Maintain 60fps during animation
5. Test on different devices (desktop, tablet)

**Reference:** [Source: front-end-spec.md Section 11 (Animations)]

### Task 5: Implement Close Functionality (AC: 2)

1. Add close button (X) to SheetHeader
2. Add click handler: `onClick={onClose}`
3. Add Esc key handler:
   - Listen for keydown event
   - Check if key === 'Escape'
   - Call `onClose()`
   - Prevent default browser behavior

4. Test:
   - Click X button → closes panel
   - Press Esc → closes panel
   - Focus returns to map

**Reference:** [Source: front-end-spec.md Section 6.3]

### Task 6: Implement Deep Linking (AC: 5)

1. For capability: List related landmarks as clickable links
2. For landmark: Show parent capability as clickable link
3. On related entity click:
   - Call `onRelatedEntitySelect(type, id)`
   - Parent (MapContainer) handles:
     - Updating selectedEntity in store
     - Panning/zooming to entity if needed
     - Re-rendering InfoPanel with new data

4. Test:
   - Click landmark link in capability panel → switches to landmark
   - Click capability link in landmark panel → switches to capability
   - Panel stays open during transition
   - Map pans/zooms to new entity

**Reference:** [Source: prd.md Section 6.4]

### Task 7: Implement Scrollable Content (AC: 6)

1. Wrap content in scrollable div with max-height:
   ```tsx
   <div className="overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
     {/* Content */}
   </div>
   ```

2. Style scrollbar (optional):
   - Native scrollbar or Tailwind styling
   - Subtle color (not intrusive)
   - Width: 6-8px

3. Test:
   - Long abstracts scroll properly
   - Content doesn't overflow panel
   - Scrolling smooth and responsive
   - No scroll-jank

**Reference:** [Source: front-end-spec.md Section 6.3]

### Task 8: Implement Accessibility Features (AC: 7)

1. Add focus trap:
   - Use library like `focus-trap-react` or manual implementation
   - Tab cycles through elements within panel
   - Tab at last element → goes to first
   - Esc closes and returns focus to trigger element

2. Add ARIA attributes:
   - `role="dialog"` on SheetContent
   - `aria-modal="true"`
   - `aria-labelledby` pointing to title
   - `aria-describedby` pointing to description
   - `aria-label` on close button

3. Keyboard navigation:
   - All focusable elements reachable via Tab
   - Enter activates buttons and links
   - Visual focus indicator (ring/outline)

4. Screen reader testing:
   - Panel announced as dialog/drawer
   - Content read in logical order
   - Links have descriptive text

**Reference:** [Source: front-end-spec.md Section 9]

### Task 9: Create Formatting Utilities (AC: 3-4)

1. Create or update `src/lib/formatters.ts`:
   - `formatYear(year: number)` → "2017"
   - `formatCapabilityLevel(level: number)` → "Continent" | "Archipelago" | "Island"
   - `formatLandmarkType(type: string)` → "Research Paper" | "Foundation Model" | "Tool" | "Benchmark"
   - `truncateText(text: string, length: number)` → "Lorem ipsum dolor..." for abstracts

2. Use formatters in component for consistent display
3. Add unit tests for formatters

**Reference:** [Source: architecture.md Section 5.7]

### Task 10: Write Unit Tests (AC: 10)

1. Create `tests/unit/components/panels/InfoPanel.test.tsx`
2. Test capability rendering:
   - Render with capability data
   - Verify name, description, level badge display
   - Verify related landmarks listed
   - Verify related landmark links clickable

3. Test landmark rendering:
   - Render with landmark data
   - Verify name, type badge, year, organization
   - Verify abstract displays
   - Verify tags display
   - Verify external links present

4. Test panel behavior:
   - Test close button calls onClose
   - Test Esc key calls onClose
   - Test opening/closing state transitions
   - Test focus trap behavior

5. Test accessibility:
   - ARIA attributes present
   - Dialog role correct
   - Focusable elements accessible

**Reference:** [Source: architecture.md Section 9.1]

### Task 11: Write E2E Tests (AC: 11)

1. Create `tests/e2e/info-panel.spec.ts`
2. Test user flow 1: Select landmark → view details → close
   - Click landmark on map
   - InfoPanel opens with slide animation
   - All landmark info visible
   - Click X button → panel closes

3. Test user flow 2: Select capability → view related landmarks
   - Click capability polygon
   - InfoPanel opens with capability details
   - Click related landmark link
   - Panel updates with landmark data
   - Map pans to landmark

4. Test keyboard navigation:
   - Tab through elements in panel
   - All focusable elements reachable
   - Esc closes panel

5. Test on different viewports (desktop, tablet)
6. Verify smooth animations

**Reference:** [Source: architecture.md Section 9.2]

### Task 12: Integration with MapContainer (AC: All)

1. Update `src/components/map/MapContainer.tsx`:
   - Import InfoPanel component
   - Subscribe to selectedEntity from Zustand store
   - Pass entity data to InfoPanel
   - Implement onClose handler: `clearSelection()`

2. Test full integration:
   - Select entity on map → InfoPanel opens
   - Panel closes → selection cleared
   - Related entity navigation works
   - Map updates along with panel

3. Verify no console errors or warnings

**Reference:** [Source: architecture.md Section 5.1]

### Task 13: Code Review & Documentation (AC: All)

1. Self-review:
   - TypeScript type safety
   - Accessibility compliance
   - Performance (memoization if needed)
   - Code style and naming

2. Peer code review
3. Add JSDoc comments
4. Update component documentation
5. Verify linter passes
6. Commit to git

**Reference:** [Source: architecture.md Section 3.1]

---

## Project Structure Notes

- Component placed in `src/components/panels/` (new folder)
- Uses existing shadcn/ui installation
- Integrates with existing Zustand store
- Follows established component patterns

---

## Technical Constraints

1. **Width:** Panel width ~400px (fits on desktop/tablet)
2. **Animation:** Must use GPU-accelerated transforms for 60fps
3. **Scrolling:** Must handle very long abstracts (500+ words)
4. **Links:** All external links open in new tab with security attributes
5. **Accessibility:** Must pass WCAG 2.1 AA standards

---

## Completion Checklist

- [ ] InfoPanel component created
- [ ] Capability display renders correctly
- [ ] Landmark display renders correctly
- [ ] Close button and Esc key working
- [ ] Smooth slide-in animation (300ms)
- [ ] Scrollable content area
- [ ] Deep linking to related entities working
- [ ] Focus trap implemented
- [ ] ARIA labels and attributes correct
- [ ] External links functional and secure
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] Zero TypeScript errors
- [ ] Linter passes
- [ ] Peer reviewed
- [ ] Integrated with MapContainer
- [ ] Merged to main
- [ ] Story status updated to "Done"

---

## Notes for Developer

The InfoPanel is a critical UI component for content discovery. Quality here impacts user understanding of the research landscape:

1. **Content Clarity:** Information should be easy to scan and understand
2. **Typography:** Use heading hierarchy and spacing for readability
3. **Links:** External links should be clearly actionable and trustworthy
4. **Animation:** Smooth transitions signal that panel is loading entity data
5. **Accessibility:** This panel must be fully usable via keyboard for inclusive access

This component should be as "dumb" as possible - receive data via props and call callbacks for user actions. MapContainer orchestrates the logic.

---

**Created:** 2025-10-20
**Epic:** Sprint 2
**Story:** #14 of Sprint 2 (Issue #14)
