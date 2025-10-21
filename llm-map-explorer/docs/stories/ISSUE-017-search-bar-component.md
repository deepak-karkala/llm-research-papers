# Issue #17: SearchBar Component with Instant Dropdown

**Sprint:** Sprint 3 (Week 5-6)

**Story Points:** 5

**Priority:** P1

**Labels:** search, component, P1

**Dependencies:** #16

**Reference:** [front-end-spec.md Section 6.2](../front-end-spec.md), [architecture.md Section 5.4](../architecture.md)

---

## Title

Implement SearchBar component with instant dropdown

---

## Description

Create header search bar with fuzzy search and instant results dropdown. Users can search across papers, models, capabilities, and organizations with keyboard navigation support.

---

## Acceptance Criteria

- [ ] `src/components/search/SearchBar.tsx` created
- [ ] Input field in header with search icon
- [ ] Debounced search (300ms delay)
- [ ] Instant dropdown shows top 10 results
- [ ] Results grouped by type (Papers, Models, Capabilities, Organizations)
- [ ] Keyboard navigation (up/down arrows, Enter to select)
- [ ] Selecting result pans/zooms to entity and opens InfoPanel
- [ ] Accessible: aria-autocomplete, aria-activedescendant
- [ ] Uses shadcn/ui Combobox component
- [ ] Unit test verifies search and selection
- [ ] E2E test verifies user search flow

---

## Technical Details

### Component Structure

```typescript
// SearchBar.tsx
export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Group results by type
  const groupedResults = groupBy(results, 'type');

  return (
    // Input with dropdown
  );
}
```

### Search Result Grouping

Results should be grouped by entity type:
- **Papers** (landmark type: "paper")
- **Models** (landmark type: "model")
- **Capabilities** (type: "capability")
- **Organizations** (type: "organization")

### Keyboard Navigation

- **Up/Down Arrows:** Navigate through results
- **Enter:** Select highlighted result
- **Esc:** Close dropdown and clear focus

---

## Visual Design

- Header integration: search bar positioned in top-right
- Dropdown: appears below input, max height with overflow scroll
- Result item styling: icon + name + description
- Hover effect: highlight result background
- Selected state: keyboard highlight visible

---

## Performance Considerations

- Debounce search input at 300ms to reduce search calls
- Limit results to top 10 to avoid DOM bloat
- Memoize search function to prevent unnecessary recalculations

---

## Accessibility Requirements

- Input labeled with aria-label="Search papers, models, and capabilities"
- Dropdown has role="listbox" and aria-label
- Result items have role="option"
- Keyboard navigation fully supported
- Screen reader announces result count

---

## Testing Requirements

### Unit Tests

- Test search input triggers debounced search
- Test results grouping by type
- Test keyboard navigation (up/down arrows)
- Test selection triggers correct action
- Test dropdown open/close states

### E2E Tests

- User types search query, sees results
- User selects result with keyboard/mouse
- Map navigates to entity
- InfoPanel opens with entity details

---

## Dependencies

- Depends on: Issue #16 (Fuse.js search index)
- Required for: Issue #18 (Search result navigation)

---

## Integration Notes

- Search queries use `search()` function from `src/lib/search.ts` (#16)
- Selecting result calls `selectEntity()` from Zustand store
- Map navigation handled by `focusEntity()` utility (#18)
- Results must include entity ID, type, and display name

---

## Notes

- Consider debounce time: 300ms balances responsiveness with performance
- Top 10 results reasonable for MVP; can be increased if performance allows
- Result grouping improves UX by categorizing large result sets
- Keyboard shortcuts [ and ] for tour navigation conflict check (#32)
