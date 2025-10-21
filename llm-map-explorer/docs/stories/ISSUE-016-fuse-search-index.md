# Issue #16: Fuse.js Search Index Initialization

**Sprint:** Sprint 3 (Week 5-6)

**Story Points:** 3

**Priority:** P1

**Labels:** search, library

**Dependencies:** #12

**Reference:** [architecture.md Section 5.4](../architecture.md), [prd.md Section 6.7](../prd.md)

---

## Title

Initialize Fuse.js search index for client-side search

---

## Description

Set up Fuse.js with weighted search configuration across all searchable entities (capabilities, landmarks, organizations). This enables fast, client-side fuzzy search without backend infrastructure.

---

## Acceptance Criteria

- [ ] `src/lib/search.ts` created with Fuse.js configuration
- [ ] Search index built from capabilities, landmarks, organizations
- [ ] Weighted keys: name (weight 2), tags (weight 1.5), description (weight 1)
- [ ] Fuzzy matching threshold: 0.4
- [ ] Function: `initializeSearchIndex(data): Fuse` implemented
- [ ] Function: `search(query, index): SearchResult[]` implemented
- [ ] Unit test verifies search returns relevant results
- [ ] Performance test: search completes in <50ms

---

## Technical Details

### Configuration

```typescript
// Fuse.js options
{
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 }
  ],
  threshold: 0.4,
  includeScore: true
}
```

### Expected Behavior

- Searching "attention" returns papers, models, and capabilities related to attention mechanisms
- Search results scored by relevance
- Handles typos with fuzzy matching (e.g., "attnetion" still matches "attention")

---

## Testing Requirements

### Unit Tests

- Test basic search functionality
- Test weighted search (name matches ranked higher than description)
- Test fuzzy matching with typos
- Test edge cases (empty query, special characters)

### Performance Tests

- Search should complete in <50ms for 50+ items
- Index initialization should complete in <100ms

---

## Dependencies

- Depends on: Issue #12 (Landmark seed data with tags)
- Required for: Issue #17 (SearchBar component)

---

## Notes

- Fuse.js is client-side only (no server setup needed)
- Search index is rebuilt on data load
- Consider memoizing the index to prevent rebuilding on every search
