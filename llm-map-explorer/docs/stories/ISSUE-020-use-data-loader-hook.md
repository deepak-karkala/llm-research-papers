# Issue #20: useDataLoader Hook

**Sprint:** Sprint 3 (Week 5-6)

**Story Points:** 3

**Priority:** P0

**Labels:** data, hook, P0

**Dependencies:** #5, #9, #12

**Reference:** [architecture.md Section 5.7](../architecture.md)

---

## Title

Implement useDataLoader hook for JSON data loading

---

## Description

Create custom React hook to load and validate all static JSON data at app startup. This hook handles parallel data fetching, Zod validation, error handling, and memoization to ensure data integrity and optimal performance.

---

## Acceptance Criteria

- [ ] `src/hooks/useDataLoader.ts` hook created
- [ ] Hook fetches all JSON files in parallel (capabilities, landmarks, organizations)
- [ ] Validates data against Zod schemas (Issue #5)
- [ ] Returns loading state, error state, and data object
- [ ] Memoizes data to prevent re-fetching on re-renders
- [ ] Comprehensive error handling for fetch failures and validation errors
- [ ] Hook integrates with Zustand store to persist loaded data
- [ ] Unit test verifies data loading and validation
- [ ] E2E test verifies app loads data on startup

---

## Hook Implementation

### Hook Signature

```typescript
// src/hooks/useDataLoader.ts
export function useDataLoader() {
  return {
    loading: boolean;
    error: Error | null;
    data: {
      capabilities: Capability[];
      landmarks: Landmark[];
      organizations: Organization[];
    } | null;
  };
}
```

### Usage Example

```typescript
// In App.tsx or root component
const { loading, error, data } = useDataLoader();

if (loading) return <LoadingScreen />;
if (error) return <ErrorScreen error={error} />;
if (!data) return <ErrorScreen error={new Error('No data')} />;

// Use data...
```

---

## Data Loading Flow

### 1. Parallel Fetching

```typescript
// Fetch all JSON files in parallel
const [capabilitiesRes, landmarksRes, organizationsRes] = await Promise.all([
  fetch('/public/data/capabilities.json'),
  fetch('/public/data/landmarks.json'),
  fetch('/public/data/organizations.json')
]);
```

### 2. JSON Parsing

```typescript
const rawCapabilities = await capabilitiesRes.json();
const rawLandmarks = await landmarksRes.json();
const rawOrganizations = await organizationsRes.json();
```

### 3. Zod Validation

```typescript
// Validate against schemas from src/lib/schemas.ts
const capabilities = z.array(capabilitySchema).parse(rawCapabilities);
const landmarks = z.array(landmarkSchema).parse(rawLandmarks);
const organizations = z.array(organizationSchema).parse(rawOrganizations);
```

### 4. Zustand Store Integration

```typescript
// Update Zustand store with loaded data
const store = useMapStore();
store.setData({ capabilities, landmarks, organizations });
```

---

## Error Handling

### Fetch Errors

- **Network failure:** Display user-friendly error message
- **404 Not Found:** Log error, show fallback
- **Timeout:** Retry up to 2 times with exponential backoff

### Validation Errors

- **Schema mismatch:** Log validation error details
- **Missing required fields:** Identify problematic records
- **Type mismatches:** Show which file/field failed validation

### Error Message Examples

```
"Failed to load map data. Please refresh the page."
"Data validation failed: landmarks.json - missing 'id' field in record 5"
"Network error: Failed to fetch capabilities.json (check your connection)"
```

---

## Memoization Strategy

### First Load

- Load data only once on app initialization
- Cache results in Zustand store
- Return cached data on subsequent calls

### Implementation

```typescript
// Use useMemo to prevent re-fetching on re-renders
const memoizedData = useMemo(() => {
  // Only refetch if hook is called again (rare)
  return { capabilities, landmarks, organizations };
}, [capabilities, landmarks, organizations]);

return { loading, error, data: memoizedData };
```

---

## Zustand Store Integration

### Store Actions

```typescript
// src/store/mapStore.ts
type MapStore = {
  data: {
    capabilities: Capability[];
    landmarks: Landmark[];
    organizations: Organization[];
  } | null;

  setData: (data: MapStore['data']) => void;
  clearData: () => void;
};
```

### Hook integrates with store:

```typescript
const store = useMapStore();
store.setData({ capabilities, landmarks, organizations });
```

---

## Performance Considerations

- **Parallel loading:** Use Promise.all() to fetch 3 files simultaneously
- **Memoization:** Cache data after first load
- **Lazy loading:** Tours and other data can be lazy-loaded later
- **Initial data size:** Keep JSON files <5MB gzipped for fast loading

---

## Testing Requirements

### Unit Tests

- Test successful data loading for each entity type
- Test validation passes for valid data
- Test validation fails for invalid data (schema mismatch)
- Test fetch error handling and retry logic
- Test memoization prevents duplicate fetches
- Test Zustand store updates with loaded data
- Test empty data handling
- Test missing optional fields

### Integration Tests

- Test hook used in App component
- Test data available throughout app after loading
- Test error boundary catches and displays errors

### E2E Tests

- App loads successfully with all data
- Map renders with capabilities and landmarks
- Search index builds from loaded data
- Lighthouse Performance score not significantly impacted

---

## Loading States

### Initial Load

1. `loading: true, error: null, data: null`

### Success

2. `loading: false, error: null, data: { capabilities, landmarks, organizations }`

### Fetch Error

3. `loading: false, error: new Error('...'), data: null`

### Validation Error

4. `loading: false, error: new Error('Validation failed: ...'), data: null`

---

## Dependencies

- Depends on: Issue #5 (Zod schemas), #9 (capabilities data), #12 (landmarks data), #19 (organizations data)
- Required for: All components that consume entity data
- Works with: Zustand store (#11 style state management)

---

## Integration Notes

- Hook called in root App component or during app initialization
- Data loading should happen before map renders
- Consider adding progress indicator during loading
- Search index (#16) built from loaded data after validation
- useDataLoader must complete before useProgressiveDisclosure (#11) starts

---

## File Locations

```
Hook implementation: src/hooks/useDataLoader.ts
Data files:
  - public/data/capabilities.json (#9)
  - public/data/landmarks.json (#12)
  - public/data/organizations.json (#19)
Schemas: src/lib/schemas.ts (#5)
Zustand store: src/store/mapStore.ts
```

---

## Notes

- This is a P0 task - critical for app startup
- Consider adding loading spinner/skeleton during data fetch
- Error handling should be user-friendly with clear recovery steps
- Performance optimization: only validate data once at load time
- Future: Consider service worker for offline data caching
