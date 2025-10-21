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

- [x] `src/lib/search.ts` created with Fuse.js configuration
- [x] Search index built from capabilities, landmarks, organizations
- [x] Weighted keys: name (weight 2), tags (weight 1.5), description (weight 1)
- [x] Fuzzy matching threshold: 0.4
- [x] Function: `initializeSearchIndex(data): Fuse` implemented
- [x] Function: `search(query, index): SearchResult[]` implemented
- [x] Unit test verifies search returns relevant results
- [x] Performance test: search completes in <50ms

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

---

## Implementation Summary

### Files Created

1. **[src/lib/search.ts](../../src/lib/search.ts)** - Core search functionality
   - `initializeSearchIndex()` - Creates Fuse.js index from capabilities, landmarks, and organizations
   - `search()` - Performs fuzzy search with configurable limit
   - `filterByEntityType()` - Filters results by entity type
   - `filterByScore()` - Filters results by relevance threshold

2. **[tests/unit/lib/search.test.ts](../../tests/unit/lib/search.test.ts)** - Unit tests (32 tests)
   - Basic search functionality
   - Weighted search (name > tags > description)
   - Fuzzy matching with typos
   - Edge cases (empty queries, special characters, unicode)
   - Entity type filtering
   - Score-based filtering

3. **[tests/unit/lib/search.performance.test.ts](../../tests/unit/lib/search.performance.test.ts)** - Performance tests (12 tests)
   - Index initialization: <100ms for 50+ items
   - Search operations: <50ms for 50+ items
   - Scalability tests with 100-200 items
   - Memory efficiency tests

### Configuration

```typescript
{
  keys: [
    { name: 'name', weight: 2 },
    { name: 'tags', weight: 1.5 },
    { name: 'description', weight: 1 }
  ],
  threshold: 0.4,
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2
}
```

### Test Results

- All 44 tests passing (32 unit + 12 performance)
- Search performance: <50ms for datasets with 50+ items
- Index initialization: <100ms for datasets with 50+ items
- Handles fuzzy matching (e.g., "attnetion" → "attention")

### Usage Example

```typescript
import { initializeSearchIndex, search } from '@/lib/search';

// Initialize index
const index = initializeSearchIndex({
  capabilities,
  landmarks,
  organizations
});

// Perform search
const results = search('attention mechanisms', index, 10);

// Results include entity type, score, and match highlighting
results.forEach(result => {
  console.log(`${result.item.name} (${result.entityType})`);
  console.log(`Relevance: ${result.score}`);
});
```
